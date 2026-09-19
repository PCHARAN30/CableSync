import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import syncEngine from './services/syncEngine';

// Apply saved theme
try {
  if (localStorage.getItem('cablesync_theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
} catch (e) {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection / persist
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

syncEngine.setQueryClient(queryClient);

// Register Service Worker for offline capability
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[CableSync] Service Worker active, offline capability ready');
      })
      .catch((err) => {
        console.warn('[CableSync] Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
