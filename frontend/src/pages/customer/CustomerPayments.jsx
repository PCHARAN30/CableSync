import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import customerApi from '../../services/customerApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ReceiptModal from '../../components/customer/ReceiptModal';
import PayModal from '../../components/customer/PayModal';
import { Receipt, ShieldCheck, Plus, Clock3 } from 'lucide-react';

export default function CustomerPayments() {
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['customer-payments'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/payments');
      return res.data?.data || [];
    },
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/dashboard');
      return res.data?.data;
    },
  });

  const { data: proofs = [] } = useQuery({
    queryKey: ['customer-payment-proofs'],
    queryFn: async () => (await customerApi.get('/customer-api/payment-proofs')).data?.data || [],
  });

  const handleOpenReceipt = async (payment) => {
    try {
      const res = await customerApi.get(`/customer-api/receipts/${payment._id}`);
      setActiveReceipt(res.data?.data);
    } catch {
      setActiveReceipt({
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        customerName: dashboardData?.customer?.name || 'Subscriber',
        cafNumber: dashboardData?.customer?.cafNumber || '',
        allocatedToArrears: payment.allocatedToArrears || 0,
        allocatedToAdvance: payment.allocatedToAdvance || 0,
        remainingDue: payment.remainingDue || 0,
        resultingPaidThrough: payment.resultingPaidThrough,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brass border-t-transparent" />
      </div>
    );
  }

  const totalAmountPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Financial Ledger
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Payments
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowPayModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-ink/90 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-brass" /> {dashboardData?.billing?.arrears > 0 ? `Pay ${formatCurrency(dashboardData.billing.arrears)}` : 'Renew Plan'}
        </button>
      </div>

      {/* Ledger Overview Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-due/20 bg-due-soft/40 p-4 shadow-ledger">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Current Due</span>
          <p className="mt-1 font-mono text-xl font-bold text-ink">{formatCurrency(dashboardData?.billing?.arrears || 0)}</p>
          <p className="mt-0.5 text-[10px] text-ink-soft">Status: <span className="font-semibold text-ink">{dashboardData?.billing?.status || 'PAID'}</span></p>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-4 shadow-ledger">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Paid Till</span>
          <p className="mt-1 font-mono text-xl font-bold text-ink">{dashboardData?.billing?.paidThroughDate ? formatDate(dashboardData.billing.paidThroughDate) : '—'}</p>
          <p className="mt-0.5 text-[10px] text-ink-soft">Service validity</p>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-4 shadow-ledger">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Lifetime Paid
          </span>
          <p className="font-mono text-xl font-bold text-ink mt-1">
            {formatCurrency(totalAmountPaid)}
          </p>
          <p className="text-[10px] text-ink-soft mt-0.5">{payments.length} transactions recorded</p>
        </div>

      </div>

      {/* Payments List */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brass" />
            <h2 className="font-display text-sm font-bold text-ink">Payment History</h2>
          </div>

          {proofs.length > 0 && (
            <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger">
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-brass" />
                <h2 className="font-display text-sm font-bold text-ink">Payment Proof Status</h2>
              </div>
              <div className="space-y-2">
                {proofs.map((proof) => (
                  <div key={proof._id} className="flex items-center justify-between rounded-xl bg-paper/60 px-3 py-2.5 text-xs">
                    <div>
                      <span className="font-mono font-semibold text-ink">{formatCurrency(proof.amount)}</span>
                      <span className="ml-2 text-ink-soft">{proof.transactionId}</span>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${proof.status === 'APPROVED' ? 'bg-emerald-500/10 text-paid' : proof.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-700'}`}>
                      {proof.status === 'PENDING' ? 'Verification Pending' : proof.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <span className="text-xs text-ink-soft font-mono">{payments.length} total</span>
        </div>

        {payments.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-ink-soft">No payments recorded for this account yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {payments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between py-3.5 transition-colors hover:bg-paper/40 rounded-xl px-2 -mx-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">
                      Receipt #{p.receiptNumber}
                    </span>
                    <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-semibold text-ink-soft border border-hairline">
                      {p.paymentMode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-soft font-mono">
                    <span>{formatDate(p.paymentDate)}</span>
                    {p.allocatedToArrears > 0 && (
                      <span>• Arrears: ₹{p.allocatedToArrears}</span>
                    )}
                    {p.allocatedToAdvance > 0 && (
                      <span>• Advance: ₹{p.allocatedToAdvance}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-paid block">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] font-mono text-ink-soft">Settled</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReceipt(p)}
                    className="p-2 rounded-xl border border-hairline bg-paper/60 text-ink hover:text-brass-dark hover:border-brass/40 transition-all"
                    title="View & Download Receipt"
                  >
                    <Receipt className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 text-[11px] text-ink-soft pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Payment proofs are reviewed before billing is updated</span>
      </div>

      {/* Pay Modal */}
      {showPayModal && dashboardData && (
        <PayModal
          customer={dashboardData.customer}
          billing={dashboardData.billing}
          onClose={() => setShowPayModal(false)}
          onPaymentSuccess={(p) => {
            handleOpenReceipt(p);
          }}
        />
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
