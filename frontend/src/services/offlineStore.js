/**
 * Offline Store Module
 * Manages persistent local Outbox queue and cached customer/dashboard data
 * using localStorage for seamless offline accessibility.
 */

const OUTBOX_KEY = "cablesync_outbox_queue";
const CACHED_CUSTOMERS_KEY = "cablesync_cached_customers";
const CACHED_DASHBOARD_KEY = "cablesync_cached_dashboard";
const CACHED_PAYMENTS_KEY = "cablesync_cached_payments";

// --- Outbox Queue Operations ---

export function getOutboxQueue() {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading outbox queue:", err);
    return [];
  }
}

export function saveOutboxQueue(queue) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
    // Dispatch custom event for reactive UI updates
    window.dispatchEvent(new CustomEvent("cablesync:outbox_changed", { detail: { count: queue.length } }));
  } catch (err) {
    console.error("Error saving outbox queue:", err);
  }
}

export function enqueueOutbox({ type, payload, tempId, label }) {
  const queue = getOutboxQueue();
  const id = tempId || `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const item = {
    id,
    type, // 'CREATE_PAYMENT' | 'CREATE_CUSTOMER' | 'UPDATE_CUSTOMER' | 'CREATE_TICKET'
    label: label || type,
    payload,
    status: "pending", // 'pending' | 'syncing' | 'failed'
    retryCount: 0,
    error: null,
    createdAt: new Date().toISOString(),
  };

  queue.push(item);
  saveOutboxQueue(queue);
  return item;
}

export function updateOutboxItem(id, updates) {
  const queue = getOutboxQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index !== -1) {
    queue[index] = { ...queue[index], ...updates };
    saveOutboxQueue(queue);
  }
}

export function removeFromOutbox(id) {
  const queue = getOutboxQueue();
  const updated = queue.filter((item) => item.id !== id);
  saveOutboxQueue(updated);
}

export function clearOutbox() {
  saveOutboxQueue([]);
}

// --- Customer Cache & Optimistic Local Updates ---

export function cacheCustomers(customers = []) {
  try {
    if (Array.isArray(customers) && customers.length > 0) {
      localStorage.setItem(CACHED_CUSTOMERS_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: customers,
      }));
    }
  } catch (err) {
    console.warn("Could not cache customers:", err);
  }
}

export function getCachedCustomers() {
  try {
    const raw = localStorage.getItem(CACHED_CUSTOMERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data || null;
  } catch (err) {
    return null;
  }
}

export function getCachedCustomerById(id) {
  const list = getCachedCustomers();
  if (!list) return null;
  return list.find((c) => String(c._id) === String(id) || String(c.serialNumber) === String(id));
}

/**
 * Optimistically applies an offline payment to the local customer cache
 * so dues and paid statuses update immediately in the UI.
 */
export function applyOfflinePaymentToCache(payment) {
  try {
    const cached = getCachedCustomers();
    if (!cached) return;

    const index = cached.findIndex((c) => String(c._id) === String(payment.customerId));
    if (index !== -1) {
      const cust = cached[index];
      const snap = cust.billingSnapshot || {};
      const amount = Number(payment.amount) || 0;
      const currentArrears = snap.arrears ?? cust.monthlyFee ?? 0;
      const newArrears = Math.max(0, currentArrears - amount);

      const updatedSnapshot = {
        ...snap,
        arrears: newArrears,
        status: newArrears === 0 ? "PAID" : "PARTIAL",
        totalPaid: (snap.totalPaid || 0) + amount,
        lastPaymentDate: payment.paymentDate || new Date().toISOString(),
      };

      cached[index] = {
        ...cust,
        status: updatedSnapshot.status,
        billingSnapshot: updatedSnapshot,
      };

      cacheCustomers(cached);
    }
  } catch (err) {
    console.warn("Failed to apply offline payment to local cache:", err);
  }
}

// --- Dashboard Cache ---

export function cacheDashboardSummary(summary) {
  try {
    if (summary) {
      localStorage.setItem(CACHED_DASHBOARD_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: summary,
      }));
    }
  } catch (err) {}
}

export function getCachedDashboardSummary() {
  try {
    const raw = localStorage.getItem(CACHED_DASHBOARD_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.data || null;
  } catch (err) {
    return null;
  }
}

// --- Payments Ledger Cache ---

export function cachePayments(payments = []) {
  try {
    if (Array.isArray(payments)) {
      localStorage.setItem(CACHED_PAYMENTS_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: payments,
      }));
    }
  } catch (err) {}
}

export function getCachedPayments() {
  try {
    const raw = localStorage.getItem(CACHED_PAYMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw)?.data || [];
  } catch (err) {
    return [];
  }
}
