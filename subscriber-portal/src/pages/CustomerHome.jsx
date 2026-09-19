import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('cablesync_customer_profile') || 'null');
  } catch {
    return null;
  }
}

export default function CustomerHome() {
  const [profile, setProfile] = useState(() => getProfile());
  const [data, setData] = useState({ customer: {}, billing: {}, operator: {}, recentPayments: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const currentProfile = getProfile();
    if (!currentProfile?.id) {
      setError('No customer selected.');
      return;
    }
    setProfile(currentProfile);

    api.get('/customer-api/dashboard')
      .then((res) => setData(res.data?.data || {}))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard.'));
  }, []);

  if (!profile?.id) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f4f5f7', color: '#111827' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32 }}>No customer selected.</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ width: '100%', borderBottom: '1px solid #e5e7eb', background: 'rgba(255,255,255,0.9)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: '#2563eb', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>C</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>CableSync</div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: '#2563eb' }}>Subscriber App</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/customer/home" style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <Link to="/customer/payments" style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>Payments</Link>
            <Link to="/customer/support" style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>Support</Link>
            <Link to="/customer/profile" style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>Profile</Link>
            <button
              onClick={() => {
                localStorage.removeItem('cablesync_customer_profile');
                window.location.href = '/customer';
              }}
              style={{ border: '1px solid #d1d5db', borderRadius: 10, background: '#fff', padding: '8px 12px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 48px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Subscriber Portal</div>
              <h1 style={{ margin: '8px 0 0', fontSize: 38, lineHeight: 1.1 }}>Hello, {data.customer?.name || profile.name || 'Customer'}</h1>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, letterSpacing: 0.8 }}>{data.customer?.cafNumber || profile.cafNumber || 'CAF'}</div>
          </div>

          {error && <p style={{ color: '#b91c1c', marginBottom: 18 }}>{error}</p>}

          <section style={{ border: '1px solid #d1fae5', borderRadius: 16, background: '#f0fdf4', padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <strong style={{ fontSize: 18 }}>Paid</strong>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginTop: 18 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Cable Box</div>
                <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>{data.customer?.boxNumber || '4'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Area</div>
                <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>{data.customer?.area || 'OC Street'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Plan</div>
                <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>₹{data.customer?.monthlyFee || 370} / 30 days</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280' }}>Paid Till</div>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>{data.billing?.paidThroughDate || '18 Oct 2026'}</div>
              </div>
            </div>
          </section>

          <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Current Bill</div>
                <div style={{ fontSize: 52, fontWeight: 800, marginTop: 8 }}>₹{data.billing?.arrears || 370}</div>
                <div style={{ color: '#6b7280', marginTop: 4 }}>Next renewal amount</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Due date</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>{data.billing?.nextDueDate || '19 Oct 2026'}</div>
              </div>
            </div>
            <button style={{ width: '100%', marginTop: 18, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, height: 52, fontWeight: 700, cursor: 'pointer' }}>Pay Now →</button>
            <div style={{ marginTop: 12, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>30 days remaining</div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Recent Payment</div>
              <div style={{ fontSize: 42, fontWeight: 800, marginTop: 12 }}>₹{data.recentPayments?.[0]?.amount || 370}</div>
              <div style={{ color: '#6b7280', marginTop: 8 }}>{data.recentPayments?.[0]?.paymentDate ? new Date(data.recentPayments[0].paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '19 Sept 2026'} · Cash</div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Need Help?</div>
              <p style={{ margin: '16px 0 0', color: '#4b5563' }}>Contact your cable operator for connection support.</p>
              <Link to="/customer/home" style={{ display: 'inline-block', marginTop: 18, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Open Support →</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
