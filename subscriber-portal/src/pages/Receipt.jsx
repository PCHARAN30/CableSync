import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';

export default function Receipt() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState({});

  useEffect(() => {
    api.get(`/customer-api/receipts/${id}`).then((res) => setReceipt(res.data?.data || {}));
  }, [id]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/payment">Pay Now</Link>
        <Link to="/payment-history">Payment History</Link>
      </div>
      <div className="card">
        <h2>Receipt</h2>
        <p><strong>Receipt Number:</strong> {receipt.receiptNumber || '—'}</p>
        <p><strong>Amount:</strong> ₹{receipt.amount || 0}</p>
        <p><strong>Mode:</strong> {receipt.paymentMode || '—'}</p>
        <p><strong>Customer:</strong> {receipt.customerName || '—'}</p>
      </div>
    </div>
  );
}
