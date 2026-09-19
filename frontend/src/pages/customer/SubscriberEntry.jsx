import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tv } from 'lucide-react';
import customerApi from '../../services/customerApi';

export default function SubscriberEntry() {
  const navigate = useNavigate();
  const [lookup, setLookup] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectCustomer = async (event) => {
    event.preventDefault();
    const value = lookup.trim();
    if (!value) return;
    setIsSelecting(true);
    setLookupError('');

    try {
      const params = /^\d+$/.test(value) ? { phone: value } : { cafNumber: value };
      const res = await customerApi.get('/customer-api/me', { params });
      const selected = res.data?.data;
      const profile = {
        id: selected.id || selected._id,
        name: selected.name,
        cafNumber: selected.cafNumber,
      };
      localStorage.setItem('cablesync_customer_profile', JSON.stringify(profile));
      navigate('/customer/home');
    } catch (error) {
      setLookupError(error.response?.data?.message || 'Customer not found. Check the phone number or CAF number.');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-hairline bg-card/95">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-brass text-white shadow-sm">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-display text-base font-bold leading-none">CableSync</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brass-dark">Subscriber App</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-md rounded-3xl border border-hairline bg-card p-6 text-center shadow-ledger sm:p-8">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brass/10 text-brass-dark">
            <Tv className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Open Subscriber Portal</h1>
          <p className="mt-1 text-sm text-ink-soft">Enter your registered phone number or CAF number to continue.</p>
          <form onSubmit={handleSelectCustomer} className="mt-5 space-y-3 text-left">
            <label htmlFor="customer-lookup" className="sr-only">Phone number or CAF number</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                id="customer-lookup"
                name="customerLookup"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                placeholder="Phone number or CAF number…"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-hairline bg-paper pl-9 pr-3 text-sm text-ink outline-none focus:border-brass focus:ring-2 focus:ring-brass/20"
              />
            </div>
            {lookupError && <p className="text-xs text-due" role="alert">{lookupError}</p>}
            <button type="submit" disabled={isSelecting || !lookup.trim()} className="h-11 w-full rounded-xl bg-brass text-sm font-semibold text-white transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-50">
              {isSelecting ? 'Finding account…' : 'Continue'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
