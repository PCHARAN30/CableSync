import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function CustomerEntry() {
  const navigate = useNavigate();
  const [lookup, setLookup] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = lookup.trim();
    if (!value) {
      setError('Enter your registered phone number or CAF number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = /^\d+$/.test(value) ? { phone: value } : { cafNumber: value };
      const res = await api.get('/customer-api/me', { params });
      const selected = res.data?.data;
      if (!selected) {
        throw new Error('Customer not found.');
      }

      const profile = {
        id: selected.id || selected._id,
        name: selected.name,
        cafNumber: selected.cafNumber,
      };

      localStorage.setItem('cablesync_customer_profile', JSON.stringify(profile));
      navigate('/customer/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Customer not found. Check the phone number or CAF number.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', color: '#111827', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #e5e7eb', background: 'rgba(255,255,255,0.9)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: '#2563eb', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>
            C
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>CableSync</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: '#2563eb' }}>Subscriber App</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <section style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 28, padding: 28, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 16, background: '#eff6ff', color: '#2563eb', margin: '0 auto' }}>📺</div>
          <h1 style={{ margin: '16px 0 8px', fontSize: 28, textAlign: 'center' }}>Open Subscriber Portal</h1>
          <p style={{ margin: 0, color: '#4b5563', textAlign: 'center' }}>Enter your registered phone number or CAF number to continue.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="Phone number or CAF number…"
              autoComplete="off"
              style={{ width: '100%', height: 46, padding: '0 14px 0 40px', borderRadius: 12, border: '2px solid #bfdbfe', outline: 'none', fontSize: 16, boxSizing: 'border-box' }}
            />
            {error && <p style={{ marginTop: 10, color: '#b91c1c', fontSize: 12 }}>{error}</p>}
            <button type="submit" disabled={loading || !lookup.trim()} style={{ width: '100%', marginTop: 16, height: 48, border: 'none', borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading || !lookup.trim() ? 0.7 : 1 }}>
              {loading ? 'Finding account…' : 'Continue'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
