import { useQuery } from '@tanstack/react-query';
import customerApi from '../../services/customerApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Tv, CheckCircle2, AlertTriangle, Cpu, Radio, MapPin, Calendar, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerPlan() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-service'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/service');
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

  const s = data || {};

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-6">
      {/* Title */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          Subscription & Hardware
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
          My Plan & Connection
        </h1>
      </div>

      {/* Signal & Service Status */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger lg:max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
              s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-paid' : 'bg-rose-500/10 text-due'
            }`}>
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-ink block">Transmission Health</span>
              <span className="text-[11px] font-mono text-ink-soft">{s.signalHealth || 'Good'}</span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
            s.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-paid border border-emerald-500/20'
              : 'bg-rose-500/10 text-due border border-rose-500/20'
          }`}>
            {s.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Current Plan Specs */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger space-y-3 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
        <div className="flex items-center gap-2">
          <Tv className="h-4 w-4 text-brass" />
          <h2 className="font-display text-sm font-bold text-ink">Active Plan Details</h2>
        </div>

        <div className="rounded-2xl border border-hairline bg-paper/60 p-4 space-y-3 text-xs lg:col-span-2">
          <div className="flex justify-between items-baseline border-b border-hairline pb-2.5">
            <div>
              <span className="font-bold text-ink text-sm block">{s.planName}</span>
              <span className="text-[11px] text-ink-soft">{s.billingCycle}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold text-ink">{formatCurrency(s.monthlyFee || 370)}</span>
              <span className="text-[10px] text-ink-soft block">/ month</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-ink-soft">Billing Type:</span>
              <span className="text-ink font-medium">30-Day Rolling Cycle</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Activation Date:</span>
              <span className="font-mono text-ink">{formatDate(s.activationDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Assigned Area:</span>
              <span className="font-semibold text-ink">{s.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware & Authorization */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger space-y-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-brass" />
          <h2 className="font-display text-sm font-bold text-ink">Hardware & Decryption Unit</h2>
        </div>

        <div className="rounded-2xl border border-hairline bg-paper/60 p-4 space-y-2.5 text-xs lg:col-span-2">
          <div className="flex justify-between">
            <span className="text-ink-soft">STB Serial Number:</span>
            <span className="font-mono font-semibold text-ink">{s.stbSerialNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Smart Card (SC) Number:</span>
            <span className="font-mono font-semibold text-ink">{s.smartCardNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Subscriber CAF Code:</span>
            <span className="font-mono font-bold text-ink">{s.cafNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Network Distribution Node:</span>
            <span className="font-mono font-semibold text-ink">{s.ponNode}</span>
          </div>
        </div>
      </div>

      {/* Installation Address */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger space-y-2 lg:max-w-3xl">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brass" />
          <h2 className="font-display text-sm font-bold text-ink">Installation Premises</h2>
        </div>
        <p className="text-xs text-ink bg-paper/60 p-3 rounded-2xl border border-hairline leading-relaxed">
          {s.installationAddress || 'Address on record with operator'}
        </p>
      </div>

      {/* Help Link */}
      <div className="text-center pt-2">
        <Link
          to="/customer/home/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brass hover:underline"
        >
          <HelpCircle className="h-3.5 w-3.5" /> Have issues with your Set-Top Box or channels?
        </Link>
      </div>
    </div>
  );
}
