import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerApi from '../../services/customerApi';
import { formatDate } from '../../utils/formatters';
import { showToast } from '../Toast';
import {
  Headphones,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  PhoneCall,
  Tv,
  MessageSquare,
  ShieldAlert,
  Send,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'NO_SIGNAL', label: 'No Signal / Black Screen' },
  { value: 'SET_TOP_BOX', label: 'Set-Top Box Error (E016/E017)' },
  { value: 'WIRE_CUT', label: 'Loose / Broken Cable Wire' },
  { value: 'BILLING_ISSUE', label: 'Billing / Receipt Discrepancy' },
  { value: 'SLOW_SPEED', label: 'Broadband Slow Speed / Fiber Loss' },
  { value: 'CHANNEL_ISSUE', label: 'Specific Channels Missing' },
  { value: 'OTHER', label: 'General Service Request' },
];

export default function CustomerSupport() {
  const queryClient = useQueryClient();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [category, setCategory] = useState('NO_SIGNAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['customer-tickets'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/support');
      return res.data?.data || [];
    },
  });

  const { data: operator = {} } = useQuery({
    queryKey: ['operator-details'],
    queryFn: async () => (await customerApi.get('/operator')).data?.data || {},
  });

  const createTicketMutation = useMutation({
    mutationFn: async (newTicket) => {
      const res = await customerApi.post('/customer-api/support', newTicket);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      setShowNewTicketForm(false);
      setTitle('');
      setDescription('');
      showToast(data.message || 'Support ticket submitted successfully!', 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to submit support ticket';
      showToast(msg, 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide both title and details', 'error');
      return;
    }
    createTicketMutation.mutate({
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brass border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Helpdesk & Service
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Customer Support
          </h1>
        </div>

        {!showNewTicketForm && (
          <button
            type="button"
            onClick={() => setShowNewTicketForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-ink/90 transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-brass" /> Report Issue
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      {/* Emergency Helpline Strip */}
      <div className="rounded-2xl border border-brass/30 bg-brass/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-brass text-white flex items-center justify-center shrink-0">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-ink block leading-tight">Operator Fast Support Hotline</span>
            <span className="text-[11px] font-mono text-brass-dark">{operator.supportPhone || "Support"} · {operator.officeHours || "Office hours available"}</span>
          </div>
        </div>
        <a
          href={`tel:${String(operator.supportPhone || "").replace(/\D/g, "")}`}
          className="rounded-xl bg-card border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper transition-all"
        >
          Call
        </a>
      </div>

      {/* Raise Ticket Form */}
      {showNewTicketForm && (
        <div className="rounded-3xl border border-hairline bg-card p-5 sm:p-6 shadow-ledger animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brass" />
              <h2 className="font-display text-sm font-bold text-ink">Register New Service Complaint</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowNewTicketForm(false)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-paper px-3 py-2.5 text-xs text-ink focus:border-brass focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Summary / Error Code
              </label>
              <input
                type="text"
                placeholder="e.g. Set-top Box shows Error E016 on all channels"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-paper px-3 py-2.5 text-xs text-ink placeholder:text-ink-soft/50 focus:border-brass focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Description of Problem
              </label>
              <textarea
                rows={3}
                placeholder="Please describe what happened, when it started, and your availability for a technician visit…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-soft/50 focus:border-brass focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['NORMAL', 'HIGH', 'URGENT'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                      priority === p
                        ? 'border-brass bg-brass/10 text-brass-dark'
                        : 'border-hairline bg-paper text-ink-soft'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="w-full rounded-xl bg-ink py-3 text-xs font-semibold text-paper shadow-sm hover:bg-ink/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-3.5 w-3.5 text-brass" />
              <span>{createTicketMutation.isPending ? 'Registering Ticket…' : 'Submit Service Ticket'}</span>
            </button>
          </form>
        </div>
      )}
      </div>

      {/* Tickets List */}
      <div className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger lg:mt-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-brass" />
            <h2 className="font-display text-sm font-bold text-ink">My Service Complaints</h2>
          </div>
          <span className="text-xs text-ink-soft font-mono">{tickets.length} total</span>
        </div>

        {tickets.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-paid mx-auto" />
            <p className="text-xs font-semibold text-ink">No complaints logged</p>
            <p className="text-[11px] text-ink-soft">Your connection has no active complaints registered.</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {tickets.map((t) => (
              <div key={t._id} className="py-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink">{t.ticketNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-ink mt-1">{t.title}</p>
                    <p className="text-[11px] text-ink-soft mt-0.5 leading-relaxed">{t.description}</p>
                  </div>

                  <span className="text-[10px] font-mono text-ink-soft shrink-0">
                    {formatDate(t.createdAt)}
                  </span>
                </div>

                {t.operatorNotes && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-2.5 text-[11px]">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 block">
                      Operator / Technician Update:
                    </span>
                    <p className="text-ink mt-0.5">{t.operatorNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
