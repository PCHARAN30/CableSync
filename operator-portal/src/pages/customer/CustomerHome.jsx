import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import customerApi from '../../services/customerApi';
import StatusBadge from '../../components/StatusBadge';
import PayModal from '../../components/customer/PayModal';
import ReceiptModal from '../../components/customer/ReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  MapPin,
  Receipt,
  Tv,
} from 'lucide-react';

export default function CustomerHome() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => (await customerApi.get('/customer-api/dashboard')).data?.data,
  });

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-xs text-ink-soft">Loading your connection…</div>;
  }

  if (isError || !data) {
    return (
      <div className="m-auto rounded-3xl border border-hairline bg-card p-6 text-center shadow-ledger">
        <AlertTriangle className="mx-auto h-8 w-8 text-due" />
        <p className="mt-2 text-sm font-semibold text-ink">Unable to load your account</p>
        <button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper">Retry</button>
      </div>
    );
  }

  const { customer, billing, recentPayments = [], openTicketsCount = 0 } = data;
  const amountDue = Math.max(0, billing?.arrears || 0);
  const isPaid = billing?.status === 'PAID';
  const latestPayment = recentPayments[0];

  const openReceipt = async (payment) => {
    try {
      setActiveReceipt((await customerApi.get(`/customer-api/receipts/${payment._id}`)).data?.data);
    } catch {
      setActiveReceipt({
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        customerName: customer.name,
        cafNumber: customer.cafNumber,
        resultingPaidThrough: payment.resultingPaidThrough,
      });
    }
  };

  return (
    <div className="w-full space-y-4 pb-20 lg:mx-auto lg:max-w-5xl lg:pb-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Subscriber Portal</p>
          <h1 className="font-display text-2xl font-bold text-ink">Hello, {customer.name?.split(' ')[0]} <span aria-hidden="true">👋</span></h1>
        </div>
        <span className="rounded-lg border border-hairline bg-card px-2.5 py-1 font-mono text-[11px] font-semibold text-ink">{customer.cafNumber}</span>
      </header>

      <section className={`rounded-3xl border p-5 shadow-ledger ${isPaid ? 'border-paid/30 bg-paid-soft/30' : 'border-due/30 bg-due-soft/40'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Connection Status</p>
            <div className="mt-2 flex items-center gap-2">
              {isPaid ? <CheckCircle2 className="h-5 w-5 text-paid" /> : <AlertTriangle className="h-5 w-5 text-due" />}
              <StatusBadge status={billing.status} size="md" />
            </div>
          </div>
          <Tv className="h-6 w-6 text-brass" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div><p className="text-ink-soft">Cable Box</p><p className="mt-1 font-semibold text-ink">{customer.pon || 'On record'}</p></div>
          <div><p className="text-ink-soft">Area</p><p className="mt-1 font-semibold text-ink">{customer.area || 'On record'}</p></div>
          <div><p className="text-ink-soft">Plan</p><p className="mt-1 font-semibold text-ink">{formatCurrency(customer.monthlyFee)} / 30 days</p></div>
          <div><p className="text-ink-soft">Paid Till</p><p className="mt-1 font-mono font-semibold text-ink">{billing.paidThroughDate ? formatDate(billing.paidThroughDate) : 'Not paid yet'}</p></div>
        </div>
      </section>

      <section className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger">
        <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-brass" /><p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Current Bill</p></div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-mono text-4xl font-bold text-ink">{formatCurrency(amountDue || customer.monthlyFee)}</p><p className="mt-1 text-xs text-ink-soft">{amountDue ? 'Outstanding amount' : 'Next renewal amount'}</p></div>
          <div className="text-right text-xs text-ink-soft"><p className="flex items-center justify-end gap-1"><Calendar className="h-3.5 w-3.5" /> Due date</p><p className="mt-1 font-mono font-semibold text-ink">{billing.nextDueDate ? formatDate(billing.nextDueDate) : 'Due immediately'}</p></div>
        </div>
        <button type="button" onClick={() => setShowPayModal(true)} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-paper transition-colors hover:bg-ink/90"><CreditCard className="h-4 w-4 text-brass" /> Pay Now <ArrowRight className="h-4 w-4 text-brass" /></button>
        {billing.daysRemaining > 0 && <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-paid"><Clock3 className="h-3.5 w-3.5" /> {billing.daysRemaining} days remaining</p>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-brass" /><h2 className="text-sm font-bold text-ink">Recent Payment</h2></div><Link to="/customer/home/payments" className="text-xs font-semibold text-brass">View all</Link></div>
          {latestPayment ? (
            <button type="button" onClick={() => openReceipt(latestPayment)} className="mt-3 flex w-full items-center justify-between rounded-2xl border border-hairline bg-paper/60 p-3 text-left transition-colors hover:bg-paper">
              <span><span className="block font-mono text-sm font-bold text-ink">{formatCurrency(latestPayment.amount)}</span><span className="mt-1 block text-[11px] text-ink-soft">{formatDate(latestPayment.paymentDate)} · {latestPayment.paymentMode}</span></span><ArrowRight className="h-4 w-4 text-ink-soft" />
            </button>
          ) : <p className="mt-3 text-xs text-ink-soft">No payments recorded yet.</p>}
        </section>
        <section className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger">
          <div className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brass" /><h2 className="text-sm font-bold text-ink">Need Help?</h2></div>
          <p className="mt-2 text-xs text-ink-soft">{openTicketsCount ? `${openTicketsCount} open support ticket${openTicketsCount > 1 ? 's' : ''}` : 'Contact your cable operator for connection support.'}</p>
          <Link to="/customer/home/support" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brass">Open Support <ArrowRight className="h-3.5 w-3.5" /></Link>
        </section>
      </div>

      {showPayModal && <PayModal customer={customer} billing={billing} onClose={() => setShowPayModal(false)} onPaymentSuccess={openReceipt} />}
      {activeReceipt && <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />}
    </div>
  );
}
