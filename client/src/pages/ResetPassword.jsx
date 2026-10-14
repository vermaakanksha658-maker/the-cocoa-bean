import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../customer/api.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message || 'Password updated.');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="myorders-wrap" style={{ maxWidth: 460 }}>
      <h1 className="myorders-title">Set a new password</h1>
      <p className="myorders-sub">Choose a new password for your account.</p>
      <form className="cust-auth-form" onSubmit={submit}>
        <label className="cust-field">
          <span>New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>
        {error && <p className="cust-auth-error">{error}</p>}
        {message && <p className="cust-auth-notice">{message}</p>}
        <button className="btn btn-primary cust-auth-submit" disabled={busy || !token}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link to="/" className="cust-auth-switch">← Back to the cafe</Link>
      </p>
    </div>
  );
}
