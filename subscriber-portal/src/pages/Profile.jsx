import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function Profile() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    api.get('/customer-api/me').then((res) => setProfile(res.data?.data || {}));
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
        <h2>Customer Profile</h2>
        <p><strong>Name:</strong> {profile.name || '—'}</p>
        <p><strong>Phone:</strong> {profile.phone || '—'}</p>
        <p><strong>CAF Number:</strong> {profile.cafNumber || '—'}</p>
        <p><strong>Address:</strong> {profile.address || '—'}</p>
        <p><strong>Area:</strong> {profile.area || '—'}</p>
      </div>
    </div>
  );
}
