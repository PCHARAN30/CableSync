import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customerApi from '../../services/customerApi';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../pages/Toast';
import { CalendarDays, CheckCircle2, ImagePlus, Upload, X, Smartphone, Copy, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';

function readScreenshot(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: reader.result, contentType: file.type, filename: file.name });
    reader.onerror = () => reject(new Error('Unable to read screenshot'));
    reader.readAsDataURL(file);
  });
}

export default function PayModal({ customer, billing, onClose }) {
  const queryClient = useQueryClient();
  const dueAmount = Math.max(0, billing?.arrears || 0);
  const amount = dueAmount > 0 ? dueAmount : customer?.monthlyFee || 0;
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('pay');
  const [paymentSettings, setPaymentSettings] = useState({ upiId: 'cablesync@upi', displayName: 'CableSync Network' });
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    customerApi.get('/customer-api/payment-settings')
      .then((response) => setPaymentSettings(response.data?.data || paymentSettings))
      .catch(() => {});
  }, []);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentSettings.upiId)}&pn=${encodeURIComponent(paymentSettings.displayName)}&am=${amount}&cu=INR`;

  useEffect(() => {
    QRCode.toDataURL(upiUrl, { width: 180, margin: 1 })
      .then(setQrCode)
      .catch(() => setQrCode(''));
  }, [upiUrl]);

  const submitMutation = useMutation({
    mutationFn: () => customerApi.post('/customer-api/payment-proofs', {
      amount,
      transactionId,
      paymentDate,
      screenshot,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-payment-proofs'] });
      showToast('Payment proof submitted for verification', 'success');
      onClose();
    },
    onError: (requestError) => {
      setError(requestError.response?.data?.message || 'Unable to submit payment proof.');
    },
  });

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Upload a PNG, JPEG, or WebP screenshot.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be smaller than 5 MB.');
      return;
    }
    setError('');
    setScreenshot(await readScreenshot(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!screenshot) return setError('Upload your payment-success screenshot.');
    if (!transactionId.trim()) return setError('Enter the UTR or transaction ID.');
    setError('');
    submitMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-hairline bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Payment Proof</h2>
            <p className="text-[11px] text-ink-soft">Pay through any UPI app, then submit proof.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-paper hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 'pay' ? (
          <div className="space-y-4 p-5 sm:p-6">
          <div className="rounded-2xl border border-hairline bg-paper/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Amount Due</span>
            <p className="mt-1 font-mono text-3xl font-bold text-ink">{formatCurrency(amount)}</p>
            <p className="mt-1 text-[11px] text-ink-soft">{customer?.name} · {customer?.cafNumber}</p>
          </div>

          <div className="rounded-2xl border border-hairline bg-paper p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Pay to</p>
            <p className="mt-1 text-sm font-bold text-ink">{paymentSettings.displayName}</p>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2">
              <span className="font-mono text-sm text-ink">{paymentSettings.upiId}</span>
              <button type="button" onClick={() => navigator.clipboard?.writeText(paymentSettings.upiId)} className="rounded-lg p-1.5 text-ink-soft hover:bg-paper" title="Copy UPI ID"><Copy className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['PhonePe', 'Google Pay', 'Paytm'].map((app) => (
              <a key={app} href={upiUrl} className="inline-flex items-center justify-center gap-1 rounded-xl border border-hairline bg-paper px-2 py-2.5 text-xs font-semibold text-ink hover:border-brass/50 hover:text-brass-dark">
                <Smartphone className="h-3.5 w-3.5 text-brass" /> {app}
              </a>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-brass/50 bg-brass/5 p-4 text-center">
            <p className="text-sm font-semibold text-ink">Or scan with any UPI app</p>
            {qrCode && <img src={qrCode} alt="UPI payment QR code" className="mx-auto mt-3 h-44 w-44 rounded-lg bg-white p-2" />}
            <p className="mt-2 break-all font-mono text-[10px] text-ink-soft">{paymentSettings.upiId}</p>
            <p className="mt-2 text-[11px] text-ink-soft">Complete payment, then return here with your screenshot and UTR.</p>
          </div>
          <button type="button" onClick={() => setStep('proof')} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-paper hover:bg-ink/90">
            I’ve completed payment <ArrowRight className="h-4 w-4 text-brass" />
          </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <button type="button" onClick={() => setStep('pay')} className="text-xs font-semibold text-brass-dark">← Back to payment instructions</button>
          <label className="block cursor-pointer rounded-2xl border border-dashed border-brass/60 bg-brass/5 p-5 text-center hover:bg-brass/10">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleFileChange} />
            {screenshot ? (
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-paid">
                <CheckCircle2 className="h-5 w-5" /> {screenshot.filename}
              </div>
            ) : (
              <>
                <ImagePlus className="mx-auto h-7 w-7 text-brass-dark" />
                <span className="mt-2 block text-sm font-semibold text-ink">Upload payment screenshot</span>
                <span className="mt-1 block text-[11px] text-ink-soft">PhonePe, Google Pay, Paytm, or any UPI app</span>
              </>
            )}
          </label>

          <div>
            <label htmlFor="transaction-id" className="mb-1.5 block text-xs font-semibold text-ink">Transaction / UTR ID</label>
            <input id="transaction-id" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Enter UTR or transaction ID" className="h-11 w-full rounded-xl border border-hairline bg-paper px-3 text-sm outline-none focus:border-brass focus:ring-2 focus:ring-brass/20" />
          </div>

          <div>
            <label htmlFor="payment-date" className="mb-1.5 block text-xs font-semibold text-ink">Payment date</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input id="payment-date" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className="h-11 w-full rounded-xl border border-hairline bg-paper pl-9 pr-3 text-sm outline-none focus:border-brass focus:ring-2 focus:ring-brass/20" />
            </div>
          </div>

          {error && <p className="text-xs text-due" role="alert">{error}</p>}
          <p className="text-[11px] text-ink-soft">Your account will remain unchanged until an operator verifies this payment.</p>
          <button type="submit" disabled={submitMutation.isPending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-paper hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50">
            <Upload className="h-4 w-4 text-brass" />
            {submitMutation.isPending ? 'Submitting proof…' : 'Submit Payment Proof'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
