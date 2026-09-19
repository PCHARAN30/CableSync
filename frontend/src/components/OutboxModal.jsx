import { useState } from "react";
import Modal from "./Modal";
import syncEngine from "../services/syncEngine";
import { removeFromOutbox, clearOutbox } from "../services/offlineStore";
import { formatCurrency, formatDateTime } from "../utils/format";
import {
  Layers,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote,
  UserPlus,
  Headphones,
  Smartphone,
  CloudOff,
  Wifi,
} from "lucide-react";

export default function OutboxModal({ queue = [], isOnline, isSyncing, onClose }) {
  const [clearing, setClearing] = useState(false);

  function getActionIcon(type) {
    switch (type) {
      case "CREATE_PAYMENT":
        return <Banknote className="h-4 w-4 text-emerald-400" />;
      case "CREATE_CUSTOMER":
        return <UserPlus className="h-4 w-4 text-brass" />;
      case "CREATE_TICKET":
        return <Headphones className="h-4 w-4 text-indigo-400" />;
      default:
        return <Layers className="h-4 w-4 text-ink-soft" />;
    }
  }

  function handleSyncNow() {
    syncEngine.triggerSync();
  }

  function handleRemoveItem(id) {
    removeFromOutbox(id);
  }

  function handleClearAll() {
    if (window.confirm("Are you sure you want to discard all queued offline actions? This cannot be undone.")) {
      clearOutbox();
      onClose();
    }
  }

  return (
    <Modal title="Offline Outbox Queue" onClose={onClose}>
      <div className="space-y-4 text-ink">
        {/* Network status header */}
        <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper p-3 text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Wifi className="h-4 w-4" />
                <span>Online & Connected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <CloudOff className="h-4 w-4" />
                <span>Working Offline</span>
              </span>
            )}
          </div>
          <span className="font-mono text-xs font-bold text-ink-soft">
            {queue.length} {queue.length === 1 ? "action" : "actions"} in queue
          </span>
        </div>

        {/* Queued Items List */}
        {queue.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400/80 mb-2" />
            <p className="font-semibold text-ink">Outbox is completely synced!</p>
            <p className="text-xs text-ink-soft mt-1">All offline collections and edits have been applied to the server.</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline/60 rounded-xl border border-hairline bg-card max-h-80 overflow-y-auto">
            {queue.map((item, index) => {
              const p = item.payload || {};
              const isPayment = item.type === "CREATE_PAYMENT";

              return (
                <div key={item.id} className="p-3 text-xs space-y-1.5 hover:bg-paper/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-paper border border-hairline">
                        {getActionIcon(item.type)}
                      </span>
                      <span className="font-semibold text-ink">
                        {isPayment ? `Record Payment • ${formatCurrency(p.amount)}` : item.label || item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      {item.status === "syncing" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          Syncing
                        </span>
                      ) : item.status === "failed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                          <AlertCircle className="h-2.5 w-2.5" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                          <Clock className="h-2.5 w-2.5" />
                          Queued #{index + 1}
                        </span>
                      )}

                      {/* Remove item button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        title="Discard this offline action"
                        className="text-ink-soft hover:text-rose-500 p-1 rounded hover:bg-paper transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="pl-8 text-[11px] text-ink-soft flex flex-wrap items-center gap-3">
                    <span>Date: {formatDateTime(item.createdAt)}</span>
                    {p.paymentMode && <span>Mode: {p.paymentMode}</span>}
                    {p.notes && <span className="truncate max-w-[200px]">Notes: {p.notes}</span>}
                  </div>

                  {item.error && (
                    <div className="pl-8 text-[11px] text-rose-400 font-mono">
                      Error: {item.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 border-t border-hairline/80 pt-3">
          {queue.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard All</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-hairline bg-paper px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-card transition-all"
            >
              Close
            </button>

            {queue.length > 0 && (
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brass px-4 py-1.5 text-xs font-semibold text-white hover:bg-brass-dark disabled:opacity-50 transition-all shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync All Now"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
