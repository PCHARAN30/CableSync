import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function PaymentHistory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/customer-api/payments')
      .then((res) => setItems(res.data?.data || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/payment">Pay Now</Link>
        <Link to="/payment-history">Payment History</Link>
      </div>
      <div className="card">
        <h2>Payment History</h2>
        {items.length === 0 ? <p>No payments yet.</p> : items.map((payment) => (
          <div key={payment._id} style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}>
            <p><strong>₹{payment.amount}</strong> — {new Date(payment.paymentDate).toLocaleDateString()}</p>
            <Link to={`/receipt/${payment._id}`}>View receipt</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
