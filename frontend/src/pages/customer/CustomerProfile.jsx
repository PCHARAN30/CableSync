import { useQuery } from '@tanstack/react-query';
import customerApi from '../../services/customerApi';
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  Radio,
  FileText,
} from 'lucide-react';

export default function CustomerProfile() {
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer-me'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/me');
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brass border-t-transparent" />
      </div>
    );
  }

  const c = customer || {};

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-6 lg:max-w-4xl">
      {/* Title */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          Subscriber Account
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
        My Profile
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      {/* Personal information */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-brass/10 text-brass-dark flex items-center justify-center font-display font-bold text-2xl">
            {c.name ? c.name.charAt(0) : 'C'}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{c.name}</h2>
            <p className="text-xs font-mono text-ink-soft">{c.cafNumber} • {c.area}</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-paid">
              STATUS: {c.status || 'ACTIVE'}
            </span>
          </div>
        </div>

        <div className="mt-5 divide-y divide-hairline text-xs">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-ink-soft">
              <Phone className="h-3.5 w-3.5" /> Registered Mobile
            </span>
            <span className="shrink-0 font-mono font-semibold text-ink">+91 {c.phone}</span>
          </div>

          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-ink-soft">
              <MapPin className="h-3.5 w-3.5" /> Installation Address
            </span>
            <span className="max-w-[65%] break-words text-right text-ink">{c.address}</span>
          </div>

          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-ink-soft">
              <Radio className="h-3.5 w-3.5" /> Network Distribution Node
            </span>
            <span className="shrink-0 font-mono font-medium text-ink">{c.pon || 'PN-1001'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger sm:p-6">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-brass" />
          <h2 className="text-sm font-bold text-ink">Connection Information</h2>
        </div>
        <div className="mt-5 divide-y divide-hairline text-xs">
          <div className="flex items-start justify-between gap-4 py-2.5"><span className="text-ink-soft">CAF Number</span><span className="font-mono font-semibold text-ink">{c.cafNumber}</span></div>
          <div className="flex items-start justify-between gap-4 py-2.5"><span className="text-ink-soft">Area</span><span className="font-semibold text-ink">{c.area}</span></div>
          <div className="flex items-start justify-between gap-4 py-2.5"><span className="text-ink-soft">Network Node</span><span className="font-mono font-semibold text-ink">{c.pon || 'On record'}</span></div>
          <div className="flex items-start justify-between gap-4 py-2.5"><span className="text-ink-soft">Connection Status</span><span className="font-semibold text-paid">{c.status || 'ACTIVE'}</span></div>
        </div>
      </div>
      </div>

      <div className="flex items-center justify-center gap-1 text-[11px] text-ink-soft pt-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>CableSync Multi-Tenant Cable Platform v2.0</span>
      </div>
    </div>
  );
}
