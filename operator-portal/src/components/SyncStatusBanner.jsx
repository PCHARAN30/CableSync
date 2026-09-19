import { useState, useEffect } from "react";
import syncEngine from "../services/syncEngine";
import OutboxModal from "./OutboxModal";
import {
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Wifi,
} from "lucide-react";

export default function SyncStatusBanner() {
  const [syncState, setSyncState] = useState(() => syncEngine.getState());
  const [showOutbox, setShowOutbox] = useState(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const { isOnline, isSyncing, queueCount, queue } = syncState;

  // If online and no queued items, don't show an obtrusive banner
  if (isOnline && !isSyncing && queueCount === 0) {
    return null;
  }

  return (
    <>
      <aside
        aria-label="Offline and Synchronization Status"
        className={`w-full border-b px-4 py-2 text-xs font-semibold transition-all select-none ${
          !isOnline
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : isSyncing
            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="flex items-center gap-1.5">
                <CloudOff className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="font-bold">Offline Mode:</strong> No internet connection. You can continue recording collections offline.
                </span>
              </span>
            ) : isSyncing ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                <span>
                  <strong className="font-bold">Syncing:</strong> Applying offline activities to server one-by-one...
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="font-bold">Connection Restored:</strong> {queueCount} offline {queueCount === 1 ? "action" : "actions"} pending sync.
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {queueCount > 0 && (
              <button
                onClick={() => setShowOutbox(true)}
                className="inline-flex items-center gap-1 rounded-md border border-current/30 px-2 py-0.5 text-[11px] font-bold hover:bg-white/10 transition-colors"
              >
                <Layers className="h-3 w-3" />
                <span>Outbox ({queueCount})</span>
              </button>
            )}

            {isOnline && !isSyncing && queueCount > 0 && (
              <button
                onClick={() => syncEngine.processQueue()}
                className="inline-flex items-center gap-1 rounded-md bg-brass px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-brass-dark transition-colors shadow-xs"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {showOutbox && (
        <OutboxModal
          queue={queue}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onClose={() => setShowOutbox(false)}
        />
      )}
    </>
  );
}
