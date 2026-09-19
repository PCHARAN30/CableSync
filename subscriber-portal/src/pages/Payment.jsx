import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function Payment() {
  const [amount, setAmount] = useState('370');
  const [message, setMessage] = useState('');

  async function payNow() {
    try {
      const res = await api.post('/customer-api/payment-intents', { amount, paymentMode: 'UPI' });
      setMessage(res.data?.message || 'Payment created successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed.');
    }
  }

  return (
    <div className="container">
      <div className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/payment">Pay Now</Link>
        <Link to="/payment-history">Payment History</Link>
      </div>
      <div className="card">
        <h2>Pay Now</h2>
        <label style={{ display: 'block', marginBottom: 8 }}>Amount</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginBottom: 12 }} />
        <button onClick={payNow} style={{ width: '100%', padding: 12, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8 }}>Confirm UPI payment</button>
        {message && <p style={{ marginTop: 16 }}>{message}</p>}
      </div>
    </div>
  );
}
