import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('cablesync_customer_profile') || 'null');
  } catch {
    return null;
  }
}

export default function CustomerSupport() {
  const [profile, setProfile] = useState(() => getProfile());
  const [data, setData] = useState({ customer: {}, operator: {} });
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
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f5f7', padding: '40px 20px' }}>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      {loading ? (
        <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#2563eb', animation: 'spin 0.9s linear infinite' }} />
      ) : (
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
          <div style={{ color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>Support</div>
          <h1 style={{ margin: '10px 0 0', fontSize: 38 }}>Need help?</h1>
          <div style={{ marginTop: 20, color: '#4b5563' }}>Contact your cable operator for connection support.</div>
          <button style={{ marginTop: 24, background: '#2563eb', border: 'none', color: '#fff', borderRadius: 12, height: 48, padding: '0 18px', fontWeight: 700, cursor: 'pointer' }}>Open Support →</button>
        </div>
      )}
    </div>
  );
}
