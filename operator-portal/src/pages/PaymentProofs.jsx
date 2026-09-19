import { useEffect, useState } from 'react';
import api from '../services/api';
import TopBar from '../components/TopBar';

export default function PaymentProofs() {
  const [proofs, setProofs] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/payment-proofs?status=PENDING')
    .then((response) => setProofs(response.data?.data || []))
    .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load payment proofs.'));

  useEffect(() => { load(); }, []);

  const review = async (proof, action) => {
    const reason = action === 'reject' ? window.prompt('Reason for rejection') : '';
    if (action === 'reject' && !reason?.trim()) return;
    try {
      await api.post(`/payment-proofs/${proof._id}/${action}`, action === 'reject' ? { reason } : {});
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to review payment proof.');
    }
  };

  return (
    <div className="app-page">
      <TopBar title="Payment Proofs" backTo="/dashboard" />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brass-dark">Operator review</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Pending Payment Proofs</h1>
          <p className="mt-1 text-sm text-ink-soft">Verify the screenshot and UTR before updating billing.</p>
        </div>
        {error && <p className="mb-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600" role="alert">{error}</p>}
        {proofs.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-card p-8 text-center text-sm text-ink-soft">No pending payment proofs.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {proofs.map((proof) => (
              <article key={proof._id} className="rounded-2xl border border-hairline bg-card p-5 shadow-ledger">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink">{proof.customerId?.name || 'Subscriber'}</h2>
                    <p className="font-mono text-xs text-ink-soft">{proof.customerId?.cafNumber || '—'}</p>
                  </div>
                  <strong className="font-mono text-lg text-ink">₹{proof.amount}</strong>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="text-ink-soft">UTR</dt><dd className="mt-1 font-mono font-semibold text-ink">{proof.transactionId}</dd></div>
                  <div><dt className="text-ink-soft">Payment date</dt><dd className="mt-1 font-semibold text-ink">{new Date(proof.paymentDate).toLocaleDateString()}</dd></div>
                </dl>
                <img src={`/payment-proofs/${proof._id}/screenshot`} alt={`Payment screenshot for ${proof.customerId?.name || 'subscriber'}`} className="mt-4 max-h-56 w-full rounded-xl border border-hairline object-contain bg-paper" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => review(proof, 'approve')} className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Approve</button>
                  <button type="button" onClick={() => review(proof, 'reject')} className="rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-500/10">Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
