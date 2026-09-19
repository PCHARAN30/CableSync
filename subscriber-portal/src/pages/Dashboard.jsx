import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function Dashboard() {
  const [data, setData] = useState({ customer: {}, billing: {}, operator: {}, recentPayments: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/customer-api/dashboard')
      .then((res) => setData(res.data?.data || {}))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard.'));
  }, []);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/payment">Pay Now</Link>
        <Link to="/payment-history">Payment History</Link>
        <button onClick={() => { localStorage.removeItem('cablesync_subscriber_token'); window.location.href = '/login'; }}>Logout</button>
      </div>
      <div className="card">
        <h2>My Account</h2>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <p><strong>Name:</strong> {data.customer?.name || '—'}</p>
        <p><strong>CAF:</strong> {data.customer?.cafNumber || '—'}</p>
        <p><strong>Current Plan:</strong> {data.customer?.planName || '—'}</p>
        <p><strong>Amount Due:</strong> ₹{data.billing?.arrears || 0}</p>
      </div>
    </div>
  );
}
