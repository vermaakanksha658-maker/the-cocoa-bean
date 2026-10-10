import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe, login } from './api.js';
import { useAdminTheme } from './adminTheme.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme } = useAdminTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => setChecking(false));
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="admin-page admin-loading" data-theme={theme}>
        <span className="admin-pulse-dot"></span>
        <p>Checking session…</p>
      </div>
    );
  }

  return (
    <div className="admin-page admin-login-page" data-theme={theme}>
      <div className="admin-login-card">
        <Link to="/" className="admin-login-brand">
          <span className="admin-logo-script">the</span> Cocoa Bean
        </Link>
        <p className="admin-login-sub">admin portal</p>

        <form onSubmit={onSubmit} noValidate>
          <label className="admin-field">
            <span>Username</span>
            <input
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="admin-error">{error}</p>}

          <button className="admin-btn admin-btn-primary admin-btn-block" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className="admin-login-back">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}