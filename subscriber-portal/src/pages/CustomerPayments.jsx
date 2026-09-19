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

export default function CustomerPayments() {
  const [profile, setProfile] = useState(() => getProfile());
  const [data, setData] = useState({ customer: {}, billing: {}, recentPayments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentProfile = getProfile();
    if (!currentProfile?.id) {
      setLoading(false);
      return;
    }
    setProfile(currentProfile);
    api.get('/customer-api/dashboard')
      .then((res) => setData(res.data?.data || {}))
      .finally(() => setLoading(false));
  }, []);

  if (!profile?.id) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#111827' }}>No customer selected.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', color: '#111827', display: 'flex', justifyContent: 'center', padding: '28px 20px 48px' }}>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      <div style={{ width: '100%', maxWidth: 1100, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Financial ledger</div>
            <h1 style={{ margin: '8px 0 0', fontSize: 38 }}>Payments</h1>
          </div>
          <button style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, height: 42, padding: '0 18px', fontWeight: 700, cursor: 'pointer' }}>Renew Plan</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#2563eb', animation: 'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginBottom: 20 }}>
              <div style={{ border: '1px solid #fecaca', borderRadius: 16, background: '#fff7f7', padding: 20 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Current Due</div>
                <div style={{ marginTop: 12, fontSize: 42, fontWeight: 800 }}>₹0</div>
                <div style={{ marginTop: 8, color: '#6b7280' }}>Status: Paid</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 20 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Paid Till</div>
                <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700 }}>{data.billing?.paidThroughDate || '18 Oct 2026'}</div>
                <div style={{ marginTop: 8, color: '#6b7280' }}>Service validity</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 20 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Lifetime Paid</div>
                <div style={{ marginTop: 12, fontSize: 42, fontWeight: 800 }}>₹{data.billing?.totalPaid || 370}</div>
                <div style={{ marginTop: 8, color: '#6b7280' }}>{data.recentPayments?.length || 1} transactions recorded</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Payment History</h2>
                <div style={{ color: '#6b7280', fontSize: 12 }}>1 total</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Receipt #1</div>
                    <div style={{ color: '#6b7280', marginTop: 4 }}>{new Date(data.recentPayments?.[0]?.paymentDate || '2026-09-19').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · Cash</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 30, fontWeight: 800 }}>₹{data.recentPayments?.[0]?.amount || 370}</span>
                    <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700 }}>Settled</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
