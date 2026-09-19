import axios from 'axios';
import {
  cacheCustomers,
  getCachedCustomers,
  cacheDashboardSummary,
  getCachedDashboardSummary,
  cachePayments,
  getCachedPayments,
  getCachedCustomerById,
} from './offlineStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
});

// Response interceptor: Cache GET queries, fallback to cache on network drop
api.interceptors.response.use(
  (response) => {
    const url = response.config?.url || '';

    // Cache successful queries for offline use
    if (response.config?.method?.toLowerCase() === 'get') {
      if (url.startsWith('/customers')) {
        const data = response.data?.data?.customers || response.data?.customers || (Array.isArray(response.data) ? response.data : null);
        if (data) cacheCustomers(data);
      } else if (url.startsWith('/dashboard/summary')) {
        const data = response.data?.data || response.data;
        if (data) cacheDashboardSummary(data);
      } else if (url.startsWith('/payments') || url.startsWith('/reports/collection-history')) {
        const data = response.data?.data?.payments || response.data?.payments || (Array.isArray(response.data) ? response.data : null);
        if (data) cachePayments(data);
      }
    }

    return response;
  },
  (error) => {
    // Network / Offline Error handling
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    const url = error.config?.url || '';
    const method = error.config?.method?.toLowerCase() || 'get';

    if (isNetworkError && method === 'get') {
      // 1. Fallback for /customers list
      if (url.startsWith('/customers') && !url.match(/\/customers\/[a-zA-Z0-9_-]{10,}/)) {
        const cached = getCachedCustomers();
        if (cached) {
          console.log('[CableSync] Serving customers from offline cache');
          return Promise.resolve({
            status: 200,
            statusText: 'OK (Offline Cache)',
            headers: {},
            config: error.config,
            data: {
              success: true,
              data: {
                customers: cached,
                currentPage: 1,
                totalPages: 1,
                totalCustomers: cached.length,
              },
            },
          });
        }
      }

      // 2. Fallback for single customer /customers/:id
      const matchCust = url.match(/\/customers\/([a-zA-Z0-9_-]+)$/);
      if (matchCust) {
        const custId = matchCust[1];
        const cachedCust = getCachedCustomerById(custId);
        if (cachedCust) {
          return Promise.resolve({
            status: 200,
            statusText: 'OK (Offline Cache)',
            headers: {},
            config: error.config,
            data: cachedCust,
          });
        }
      }

      // 3. Fallback for dashboard summary
      if (url.startsWith('/dashboard/summary')) {
        const cachedDash = getCachedDashboardSummary();
        if (cachedDash) {
          return Promise.resolve({
            status: 200,
            statusText: 'OK (Offline Cache)',
            headers: {},
            config: error.config,
            data: { success: true, data: cachedDash },
          });
        }
      }

      // 4. Fallback for collection history / payments
      if (url.startsWith('/payments') || url.startsWith('/reports/collection-history')) {
        const cachedPayments = getCachedPayments();
        return Promise.resolve({
          status: 200,
          statusText: 'OK (Offline Cache)',
          headers: {},
          config: error.config,
          data: {
            success: true,
            data: {
              payments: cachedPayments,
              pagination: { currentPage: 1, totalPages: 1, totalPayments: cachedPayments.length, limit: 50 },
              summary: {
                totalAmount: cachedPayments.reduce((s, p) => s + (p.amount || 0), 0),
                cashTotal: cachedPayments.filter(p => p.paymentMode === 'Cash').reduce((s, p) => s + (p.amount || 0), 0),
                upiTotal: cachedPayments.filter(p => p.paymentMode === 'UPI').reduce((s, p) => s + (p.amount || 0), 0),
                otherTotal: 0,
                filteredCount: cachedPayments.length,
                todayTotal: 0,
                todayCount: 0,
              },
            },
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
