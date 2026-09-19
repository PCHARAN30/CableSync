import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import TopBar from '../components/TopBar';
import { formatDate } from '../utils/formatters';
import { showToast } from './Toast';
import {
  Headphones,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Filter,
  Save,
  X,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function OperatorTickets() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const { data: tickets = [], isLoading, isError } = useQuery({
    queryKey: ['operator-tickets'],
    queryFn: async () => {
      const res = await api.get('/support');
      return res.data?.data || [];
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, operatorNotes }) => {
      const res = await api.patch(`/support/${id}`, { status, operatorNotes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-tickets'] });
      setSelectedTicket(null);
      showToast('Ticket updated successfully', 'success');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to update ticket', 'error');
    },
  });

  const handleOpenEdit = (t) => {
    setSelectedTicket(t);
    setEditStatus(t.status);
    setEditNotes(t.operatorNotes || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    updateTicketMutation.mutate({
      id: selectedTicket._id,
      status: editStatus,
      operatorNotes: editNotes.trim(),
    });
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-paper pb-24 md:pb-12 text-ink">
      <TopBar title="Support Tickets" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Subscriber Complaints & Tickets
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              Manage incoming customer issues, technician assignments, and resolutions.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All (${tickets.length})` },
              { id: 'OPEN', label: `Open (${openCount})` },
              { id: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { id: 'RESOLVED', label: `Resolved (${resolvedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-ink text-paper'
                    : 'bg-card border border-hairline text-ink-soft hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brass border-t-transparent mx-auto" />
            <p className="text-xs text-ink-soft mt-2">Loading tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-card p-12 text-center shadow-ledger">
            <CheckCircle2 className="h-10 w-10 text-paid mx-auto mb-2" />
            <h3 className="font-display text-base font-bold text-ink">No tickets found</h3>
            <p className="text-xs text-ink-soft mt-1">There are no complaints matching the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((t) => (
              <div
                key={t._id}
                className="rounded-3xl border border-hairline bg-card p-5 shadow-ledger flex flex-col justify-between hover:border-brass/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink bg-paper px-2 py-0.5 rounded border border-hairline">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-500/10 text-paid'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.priority && t.priority !== 'NORMAL' && (
                        <span className="bg-rose-500/10 text-due text-[10px] font-bold font-mono px-1.5 py-0.5 rounded">
                          {t.priority}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-ink-soft">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>

                  {/* Customer context */}
                  <div className="mt-3 flex items-center justify-between text-xs border-b border-hairline pb-2.5">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-brass" />
                      <span className="font-bold text-ink">{t.customer?.name || 'Subscriber'}</span>
                      <span className="text-[11px] font-mono text-ink-soft">({t.customer?.cafNumber})</span>
                    </div>
                    {t.customer?.phone && (
                      <a
                        href={`tel:${t.customer.phone}`}
                        className="flex items-center gap-1 font-mono text-brass hover:underline"
                      >
                        <Phone className="h-3 w-3" /> {t.customer.phone}
                      </a>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-soft block">
                      {t.category?.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-ink mt-0.5">{t.title}</h3>
                    <p className="text-xs text-ink-soft mt-1 leading-relaxed bg-paper/60 p-2.5 rounded-xl border border-hairline">
                      {t.description}
                    </p>
                  </div>

                  {/* Operator Notes if present */}
                  {t.operatorNotes && (
                    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-2.5 text-xs">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 block text-[11px]">
                        Technician / Operator Note:
                      </span>
                      <p className="text-ink text-xs mt-0.5">{t.operatorNotes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
                  <span className="text-[11px] text-ink-soft">
                    {t.customer?.area || 'Area not specified'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="rounded-xl border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-card hover:border-brass/40 transition-all"
                  >
                    Update Status & Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Ticket Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-hairline bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-hairline bg-paper/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-brass" />
                  <h3 className="font-display text-sm font-bold text-ink">
                    Update Ticket: {selectedTicket.ticketNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                <div>
                  <span className="text-[11px] text-ink-soft block">Subscriber:</span>
                  <p className="text-xs font-bold text-ink">
                    {selectedTicket.customer?.name} ({selectedTicket.customer?.cafNumber}) • {selectedTicket.customer?.phone}
                  </p>
                  <p className="text-xs text-ink-soft mt-1">{selectedTicket.title}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                    Ticket Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditStatus(s)}
                        className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                          editStatus === s
                            ? 'border-brass bg-brass/10 text-brass-dark'
                            : 'border-hairline bg-paper text-ink-soft'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                    Operator / Technician Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Technician deployed, smart card authorization re-triggered, customer confirmed clear signal."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-paper p-3 text-xs text-ink placeholder:text-ink-soft/40 focus:border-brass focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="rounded-xl border border-hairline px-3.5 py-2 text-xs font-semibold text-ink hover:bg-paper"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTicketMutation.isPending}
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-ink/90 transition-all flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5 text-brass" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
