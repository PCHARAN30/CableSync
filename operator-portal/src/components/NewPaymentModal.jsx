import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import Modal from "./Modal";
import { formatCurrency, formatDate } from "../utils/format";
import { enqueueOutbox, applyOfflinePaymentToCache } from "../services/offlineStore";
import {
  Banknote,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  CalendarPlus,
  Receipt,
  ArrowRight,
  CloudOff,
} from "lucide-react";

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewPaymentModal({ customer, dueInfo, onClose, onSaved }) {
  const [amount, setAmount] = useState(
    String(dueInfo?.arrears > 0 ? dueInfo.arrears : customer.monthlyFee),
  );
  const [paymentDate, setPaymentDate] = useState(getTodayInputValue);
  const [mode, setMode] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const {
    data: preview,
    isLoading: isLoadingPreview,
  } = useQuery({
    queryKey: ["paymentPreview", customer._id, amount, paymentDate],
    queryFn: () =>
      api
        .post("/payments/preview", {
          customerId: customer._id,
          amount: Number(amount),
          paymentDate,
        })
        .then((res) => res.data)
        .catch(() => null), // Gracefully handle offline preview
    staleTime: 0,
    gcTime: 0,
    enabled:
      !!customer &&
      !!paymentDate &&
      !!amount &&
      Number(amount) > 0 &&
      navigator.onLine,
  });

  async function handleSave(e, options = {}) {
    if (e) e.preventDefault();
    setError("");

    if (!paymentDate) {
      setError("Please select the payment date.");
      return;
    }

    setSaving(true);
    const finalNotes = options.isAdvance
      ? notes
        ? `${notes} (Future months advance)`
        : "Future months advance payment"
      : notes;

    const payload = {
      customerId: customer._id,
      amount: Number(amount),
      paymentDate,
      paymentMode: mode,
      notes: finalNotes,
      allowDuplicate: Boolean(options.allowDuplicate),
      isAdvance: Boolean(options.isAdvance),
    };

    // If device is offline, queue directly into Outbox
    if (!navigator.onLine) {
      saveOfflinePayment(payload);
      return;
    }

    try {
      const res = await api.post("/payments", payload);
      setDuplicateInfo(null);
      onSaved(res.data);
    } catch (err) {
      const isNetworkError = !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network Error");

      if (isNetworkError) {
        // Network failed during request - save to offline outbox
        saveOfflinePayment(payload);
        return;
      }

      const dupData = err.response?.data;
      if (dupData?.isDuplicate || err.response?.status === 409) {
        setDuplicateInfo({
          recentPayment: dupData?.recentPayment,
          updatedBilling: dupData?.updatedBilling,
          message:
            dupData?.message ||
            `A payment of ${formatCurrency(Number(amount))} was already recorded just now.`,
        });
        setError("");
      } else {
        setError(err.response?.data?.error || "Could not save payment.");
      }
      setSaving(false);
    }
  }

  function saveOfflinePayment(payload) {
    const currentDue = dueInfo?.arrears || 0;
    const numAmount = Number(amount) || 0;
    const appliedToArrears = Math.min(numAmount, currentDue);
    const advanceAmount = Math.max(0, numAmount - appliedToArrears);
    const remainingDue = Math.max(0, currentDue - numAmount);
    const tempReceipt = `OFFLINE-${Date.now().toString().slice(-4)}`;

    const offlinePayment = {
      _id: `offline_${Date.now()}`,
      customerId: customer._id,
      amount: numAmount,
      paymentDate,
      paymentMode: mode,
      notes: payload.notes,
      receiptNumber: tempReceipt,
      allocatedToArrears: appliedToArrears,
      allocatedToAdvance: advanceAmount,
      remainingDue,
      createdAt: new Date().toISOString(),
      isOffline: true,
    };

    // Enqueue in Outbox
    enqueueOutbox({
      type: "CREATE_PAYMENT",
      label: `Payment ${formatCurrency(numAmount)} - ${customer.name}`,
      payload,
      tempId: offlinePayment._id,
    });

    // Update local cache optimistically
    applyOfflinePaymentToCache(offlinePayment);

    // Toast notification
    window.dispatchEvent(
      new CustomEvent("cablesync:toast", {
        detail: {
          message: `Payment of ${formatCurrency(numAmount)} saved offline. Will sync automatically when connected!`,
          type: "success",
        },
      })
    );

    setSaving(false);
    onSaved({
      payment: offlinePayment,
      updatedBilling: {
        status: remainingDue === 0 ? "PAID" : "PARTIAL",
        arrears: remainingDue,
        totalPaid: (dueInfo?.totalPaid || 0) + numAmount,
      },
    });
  }

  const currentDue = dueInfo?.arrears || 0;
  const collectingAmount = Number(amount) || 0;
  const remainingDue = preview
    ? preview.arrears
    : Math.max(0, currentDue - collectingAmount);
  const appliedToArrears = Math.min(collectingAmount, currentDue);
  const advanceAmount = Math.max(0, collectingAmount - appliedToArrears);

  const InfoRow = ({ label, value, className = "text-ink" }) => (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className={`text-right font-semibold ${className}`}>{value}</span>
    </div>
  );

  return (
    <Modal title="Record payment" onClose={onClose}>
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="rounded-xl bg-paper p-3">
          <p className="font-semibold text-ink">{customer.name}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            Outstanding balance:{" "}
            <span className="font-mono font-semibold text-due">
              {formatCurrency(currentDue)}
            </span>
          </p>
        </div>

        {/* Payment date */}
        <div>
          <label
            htmlFor="paymentDate"
            className="text-xs uppercase tracking-wide text-ink-soft"
          >
            Payment date
          </label>
          <div className="relative mt-1">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              max={getTodayInputValue()}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-paper py-3 pl-10 pr-3 font-medium text-ink focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40"
            />
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            When all dues are cleared, service is paid through 29 days after
            this date; the next due date is 30 days after it.
          </p>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="text-xs uppercase tracking-wide text-ink-soft"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline bg-paper p-3 text-2xl font-semibold text-ink focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40"
            autoFocus
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setAmount(String(currentDue || customer.monthlyFee))
              }
              className="btn-quiet px-2 py-2 text-xs"
            >
              Full {formatCurrency(currentDue || customer.monthlyFee)}
            </button>
            <button
              type="button"
              onClick={() => setAmount("500")}
              className="btn-orbit px-2 py-2 text-xs"
            >
              ₹500
            </button>
            <button
              type="button"
              onClick={() => setAmount("1000")}
              className="btn-orbit px-2 py-2 text-xs"
            >
              ₹1,000
            </button>
          </div>
        </div>

        {/* Live billing preview */}
        <div className="space-y-2 rounded-lg bg-paper p-3">
          <InfoRow label="Current Due" value={formatCurrency(currentDue)} />
          <InfoRow
            label="Collecting"
            value={formatCurrency(collectingAmount)}
            className="text-paid"
          />
          <InfoRow label="Applied to arrears" value={formatCurrency(appliedToArrears)} />
          <InfoRow label="Added as advance" value={formatCurrency(advanceAmount)} className="text-paid" />
          <div className="border-t border-hairline" />
          <InfoRow
            label="Remaining Due"
            value={formatCurrency(Math.max(0, remainingDue))}
            className={remainingDue > 0 ? "font-bold text-due" : "text-paid"}
          />

          {preview && (
            <>
              <div className="my-2 border-t border-hairline" />
              <InfoRow
                label="Coverage From"
                value={formatDate(preview.paymentDate)}
              />
              <InfoRow
                label="Paid Till"
                value={formatDate(preview.paidThroughDate, "dd MMM yyyy")}
              />
              <InfoRow
                label="Next Due"
                value={formatDate(preview.nextDueDate, "dd MMM yyyy")}
              />
            </>
          )}

          {isLoadingPreview && (
            <p className="text-center text-xs text-ink-soft">Calculating...</p>
          )}
        </div>

        {/* Payment method */}
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Payment method
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { value: "Cash", icon: Banknote },
              { value: "UPI", icon: Smartphone },
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition-colors ${
                  mode === value
                    ? "border-brass bg-brass/10 text-brass-dark"
                    : "border-hairline bg-paper text-ink-soft hover:border-brass/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="text-xs uppercase tracking-wide text-ink-soft"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-hairline bg-paper p-2.5 text-ink focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>

        {error && <p className="text-sm text-due">{error}</p>}

        {duplicateInfo ? (
          <div className="space-y-3 rounded-xl border border-brass/40 bg-card p-3.5 shadow-sm animate-in fade-in">
            {/* 1. SUCCESS MESSAGE FOR PAYMENT RECORDED JUST NOW */}
            <div className="rounded-lg border border-emerald-300 bg-emerald-50/90 p-3.5 text-emerald-950">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-emerald-900">
                    Payment Recorded Just Now!
                  </p>
                  <p className="mt-1 text-emerald-800">
                    {duplicateInfo.message ||
                      `Payment of ${formatCurrency(collectingAmount)} was recorded successfully.`}
                  </p>
                  {duplicateInfo.updatedBilling?.paidThroughDate && (
                    <p className="mt-1.5 text-xs text-emerald-700">
                      Paid till:{" "}
                      <span className="font-semibold">
                        {formatDate(duplicateInfo.updatedBilling.paidThroughDate)}
                      </span>
                      {duplicateInfo.recentPayment?.receiptNumber && (
                        <span> • Receipt #{duplicateInfo.recentPayment.receiptNumber}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (duplicateInfo.recentPayment && duplicateInfo.updatedBilling) {
                      onSaved({
                        payment: duplicateInfo.recentPayment,
                        updatedBilling: duplicateInfo.updatedBilling,
                      });
                    } else {
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  View Receipt & Done
                </button>
              </div>
            </div>

            {/* 2. ASK FOR FUTURE MONTHS PAYMENT */}
            <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-3.5 text-amber-950">
              <div className="flex items-start gap-2.5">
                <CalendarPlus className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-amber-900">
                    Need to Pay for Future Months?
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Do you want to collect an additional{" "}
                    <span className="font-semibold">{formatCurrency(collectingAmount)}</span> to
                    advance service coverage for upcoming months?
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setDuplicateInfo(null)}
                  className="text-xs text-ink-soft hover:text-ink underline"
                >
                  Edit amount
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    handleSave(null, { allowDuplicate: true, isAdvance: true })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-800 transition disabled:opacity-50"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  {saving
                    ? "Recording..."
                    : `Yes, Pay Future Months (+${formatCurrency(collectingAmount)})`}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={
              saving ||
              isLoadingPreview ||
              !amount ||
              Number(amount) <= 0 ||
              !paymentDate
            }
            className="btn-prism sticky bottom-0 z-10 mt-2 border-t border-hairline bg-card py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : currentDue <= 0
              ? `Collect ${formatCurrency(collectingAmount)} (Future Months)`
              : `Collect ${formatCurrency(collectingAmount)}`}
          </button>
        )}
      </form>
    </Modal>
  );
}
