import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('cablesync_customer_profile') || 'null');
  } catch {
    return null;
  }
}

export default function CustomerProfile() {
  const [profile, setProfile] = useState(() => getProfile());
  const [data, setData] = useState({ customer: {} });
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
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', background: '#f4f5f7', padding: '32px 20px' }}>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Subscriber account</div>
        <h1 style={{ margin: 0, fontSize: 38 }}>My Profile</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#2563eb', animation: 'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, marginTop: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 24 }}>{(data.customer?.name || profile.name || 'C').charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{data.customer?.name || profile.name || 'Customer'}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{data.customer?.cafNumber || profile.cafNumber || 'CAF'}</div>
                </div>
              </div>

              <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>Registered Mobile</span>
                  <strong>{data.customer?.phone || '+91 9391529371'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>Installation Address</span>
                  <strong>{data.customer?.address || 'BC Palli'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: '#6b7280' }}>Network Distribution Node</span>
                  <strong>{data.customer?.networkNode || '4'}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Connection Information</div>
              </div>
              <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>CAF Number</span>
                  <strong>{data.customer?.cafNumber || profile.cafNumber || 'CAF10001'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>Area</span>
                  <strong>{data.customer?.area || 'OC Street'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>Network Node</span>
                  <strong>{data.customer?.networkNode || '4'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                  <span style={{ color: '#6b7280' }}>Connection Status</span>
                  <strong style={{ color: '#16a34a' }}>PAID</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
