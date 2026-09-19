/**
 * Sequential Outbox Synchronization Engine
 * Listens for network restoration and executes queued offline operations
 * one-by-one in FIFO order with retry safety and cache refresh.
 */

import api from "./api";
import {
  getOutboxQueue,
  removeFromOutbox,
  updateOutboxItem,
} from "./offlineStore";

class SyncEngine {
  constructor() {
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    this.isSyncing = false;
    this.listeners = new Set();
    this.queryClient = null;

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleNetworkChange(true));
      window.addEventListener("offline", () => this.handleNetworkChange(false));
      window.addEventListener("cablesync:outbox_changed", () => this.notify());

      // Periodic health check probe every 15 seconds if online
      setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          const queue = getOutboxQueue();
          if (queue.length > 0) {
            this.processQueue();
          }
        }
      }, 15000);
    }
  }

  setQueryClient(client) {
    this.queryClient = client;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Emit immediate current state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("Error in sync engine listener:", err);
      }
    });
  }

  getState() {
    const queue = getOutboxQueue();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueCount: queue.length,
      queue,
    };
  }

  async handleNetworkChange(online) {
    this.isOnline = online;
    this.notify();

    if (online) {
      // Test real connectivity by probing health endpoint
      try {
        await api.get("/health", { timeout: 4000 });
        this.isOnline = true;
      } catch (e) {
        // Still unreachable
        this.isOnline = false;
        this.notify();
        return;
      }

      // Start sequential background sync
      this.processQueue();
    }
  }

  /**
   * Process all queued operations sequentially (one-by-one FIFO)
   */
  async processQueue() {
    if (this.isSyncing) return;

    const queue = getOutboxQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    this.notify();

    let successCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Skip already failed items unless retried
      if (item.status === "failed") continue;

      updateOutboxItem(item.id, { status: "syncing" });
      this.notify();

      try {
        await this.executeItem(item);
        // Successfully synced on server!
        removeFromOutbox(item.id);
        successCount++;
      } catch (err) {
        console.error(`Sync error on item ${item.id}:`, err);

        // If it's a network disconnect, pause queue until network returns
        if (!navigator.onLine || err.code === "ERR_NETWORK" || !err.response) {
          this.isOnline = false;
          updateOutboxItem(item.id, { status: "pending" });
          break;
        }

        // If server returned 4xx or 5xx error (e.g. invalid format or duplicate)
        updateOutboxItem(item.id, {
          status: "failed",
          error: err.response?.data?.error || err.message || "Failed to sync with server",
        });
      }

      this.notify();
    }

    this.isSyncing = false;
    this.notify();

    if (successCount > 0 && this.queryClient) {
      // Refresh all live caches
      this.queryClient.invalidateQueries();

      // Trigger custom toast
      window.dispatchEvent(
        new CustomEvent("cablesync:toast", {
          detail: {
            message: `Synced ${successCount} offline ${successCount === 1 ? "activity" : "activities"} to server!`,
            type: "success",
          },
        })
      );
    }
  }

  /**
   * Dispatches a single action to the backend API
   */
  async executeItem(item) {
    const { type, payload } = item;

    switch (type) {
      case "CREATE_PAYMENT":
        return api.post("/payments", {
          ...payload,
          allowDuplicate: true, // Allow sync of recorded offline collection
        });

      case "CREATE_CUSTOMER":
        return api.post("/customers", payload);

      case "UPDATE_CUSTOMER":
        return api.put(`/customers/${payload.id || payload._id}`, payload);

      case "CREATE_TICKET":
        return api.post("/customer-api/support", payload);

      default:
        throw new Error(`Unknown outbox operation type: ${type}`);
    }
  }

  /**
   * Manually trigger queue synchronization
   */
  async triggerSync() {
    try {
      await api.get("/health", { timeout: 4000 });
      this.isOnline = true;
    } catch (e) {
      this.isOnline = false;
    }
    this.notify();

    if (this.isOnline) {
      return this.processQueue();
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
