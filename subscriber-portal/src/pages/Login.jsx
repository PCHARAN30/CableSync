import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
  const [phone, setPhone] = useState('9391529371');
  const [cafNumber, setCafNumber] = useState('CAF100001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/customer-api/auth/customer/login', { phone, cafNumber });
      if (res.data?.success && res.data.token) {
        localStorage.setItem('cablesync_subscriber_token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 80 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Subscriber Portal</h1>
        <p>Sign in with your registered mobile number and CAF number.</p>

        <label style={{ display: 'block', marginBottom: 8 }}>Mobile Number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginBottom: 14 }} />

        <label style={{ display: 'block', marginBottom: 8 }}>CAF Number</label>
        <input value={cafNumber} onChange={(e) => setCafNumber(e.target.value)} style={{ marginBottom: 14 }} />

        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        <button onClick={handleLogin} style={{ width: '100%', padding: 12, border: 'none', borderRadius: 10, background: '#0f172a', color: '#fff' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </div>
    </div>
  );
}
