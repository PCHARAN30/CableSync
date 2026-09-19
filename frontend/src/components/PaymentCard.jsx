import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Calendar,
  Wallet,
  MessageSquare,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime, monthName } from "../utils/format";

function PaymentCard({ payment }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPartial = Boolean(
    payment.isPartial ||
    (payment.remainingDue != null && Number(payment.remainingDue) > 0) ||
    (payment.previousDue != null &&
      Number(payment.previousDue) > 0 &&
      Number(payment.allocatedToArrears ?? payment.amount) < Number(payment.previousDue)) ||
    (typeof payment.notes === "string" && payment.notes.toLowerCase().includes("partial"))
  );

  const DetailRow = ({ icon: Icon, label, value, highlight }) => (
    <div className={`flex items-start justify-between text-sm ${highlight ? "font-semibold text-orange-700" : ""}`}>
      <div className={`flex items-center gap-2 ${highlight ? "text-orange-700" : "text-ink-soft"}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={`text-right font-medium ${highlight ? "text-orange-700 font-mono" : "text-ink"}`}>{value}</span>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-ledger transition-all duration-300">
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3.5">
          {isPartial ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-300">
              <Clock className="h-4 w-4" />
            </div>
          ) : (
            <CheckCircle2 className="h-7 w-7 shrink-0 text-paid" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">
                {monthName(payment.paidMonth)} {payment.paidYear}
              </p>
              {isPartial && (
                <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Partial
                </span>
              )}
            </div>
            <p className="text-sm text-ink-soft">
              Collected on {formatDate(payment.paymentDate, "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`font-mono text-lg font-semibold ${isPartial ? "text-orange-600" : "text-paid"}`}>
              {formatCurrency(payment.amount)}
            </p>
            <p className="text-sm text-ink-soft">{payment.paymentMode}</p>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded View */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-hairline p-4">
            {isPartial && payment.remainingDue != null && Number(payment.remainingDue) > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-orange-50 border border-orange-200 px-3.5 py-2 text-sm text-orange-900">
                <span className="font-semibold flex items-center gap-1.5 text-orange-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                  Partial payment • Due remaining:
                </span>
                <span className="font-mono font-bold text-orange-700">
                  {formatCurrency(payment.remainingDue)}
                </span>
              </div>
            )}
            <DetailRow
              icon={Calendar}
              label="Payment Date"
              value={formatDate(payment.paymentDate, "E, dd MMM yyyy")}
            />
            <DetailRow icon={Wallet} label="Payment Mode" value={payment.paymentMode} />
            <DetailRow icon={Wallet} label="Due before payment" value={formatCurrency(payment.previousDue)} />
            <DetailRow icon={CheckCircle2} label="Applied to arrears" value={formatCurrency(payment.allocatedToArrears)} />
            <DetailRow icon={Wallet} label="Advance credited" value={formatCurrency(payment.allocatedToAdvance)} />
            <DetailRow
              icon={CheckCircle2}
              label="Due remaining"
              value={formatCurrency(payment.remainingDue)}
              highlight={isPartial}
            />
            {payment.resultingPaidThrough && (
              <DetailRow
                icon={Calendar}
                label="Paid till after payment"
                value={formatDate(payment.resultingPaidThrough, "dd MMM yyyy")}
              />
            )}
            <DetailRow icon={Clock} label="Entry Time" value={formatDateTime(payment.createdAt)} />
            {payment.notes && (
              <DetailRow icon={MessageSquare} label="Notes" value={payment.notes} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentCard;
