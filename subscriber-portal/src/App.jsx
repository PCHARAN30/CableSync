import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Payment from './pages/Payment.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import Receipt from './pages/Receipt.jsx';

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const token = localStorage.getItem('cablesync_subscriber_token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        <Route path="/dashboard" element={<ProtectedRoute token={token}><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute token={token}><Profile /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute token={token}><Payment /></ProtectedRoute>} />
        <Route path="/payment-history" element={<ProtectedRoute token={token}><PaymentHistory /></ProtectedRoute>} />
        <Route path="/receipt/:id" element={<ProtectedRoute token={token}><Receipt /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
