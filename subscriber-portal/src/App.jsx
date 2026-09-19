import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Payment from './pages/Payment.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import Receipt from './pages/Receipt.jsx';
import CustomerEntry from './pages/CustomerEntry.jsx';
import CustomerHome from './pages/CustomerHome.jsx';
import CustomerPayments from './pages/CustomerPayments.jsx';
import CustomerSupport from './pages/CustomerSupport.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';

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
        <Route path="/customer" element={<CustomerEntry />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/payments" element={<CustomerPayments />} />
        <Route path="/customer/support" element={<CustomerSupport />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/customer'} replace />} />
        <Route path="/dashboard" element={<ProtectedRoute token={token}><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute token={token}><Profile /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute token={token}><Payment /></ProtectedRoute>} />
        <Route path="/payment-history" element={<ProtectedRoute token={token}><PaymentHistory /></ProtectedRoute>} />
        <Route path="/receipt/:id" element={<ProtectedRoute token={token}><Receipt /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/customer'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
