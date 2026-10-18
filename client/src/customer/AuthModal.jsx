import { useEffect, useRef, useState } from 'react';
import { useCustomer } from './useCustomer.jsx';
import { forgotPassword, resendVerification } from './api.js';
import { useToast } from '../context/ToastContext.jsx';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8v3.1h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3.1c-1 .7-2.4 1.2-4 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.2C3.3 21.4 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.2c-.2-.7-.4-1.5-.4-2.2s.1-1.5.4-2.2V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.2z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l4 3.2c.9-2.9 3.6-5 6.7-5z" />
    </svg>
  );
}

const BENEFITS = ['Faster checkout', 'Order & booking history', 'Priority on popular time slots'];

export default function AuthModal() {
  const { authOpen, closeAuth, authTab, authReason, login, register, loginWithGoogle } = useCustomer();
  const toast = useToast();
  const cardRef = useRef(null);

  const [view, setView] = useState('login'); // login | register | forgot | sent
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [devLink, setDevLink] = useState('');
  const [devPreview, setDevPreview] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (authOpen) {
      setView(authTab || 'login');
      setError('');
      setNotice('');
      setDevLink('');
      setDevPreview('');
      setNeedsVerify(false);
      setTimeout(() => cardRef.current?.focus(), 30);
    }
  }, [authOpen, authTab]);

  useEffect(() => {
    if (!authOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setError('');
  };

  const switchView = (v) => {
    setView(v);
    setError('');
    setNotice('');
    setDevLink('');
    setDevPreview('');
    setNeedsVerify(false);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNeedsVerify(false);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.push(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      closeAuth();
    } catch (err) {
      if (err.status === 403) {
        setNeedsVerify(true);
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const submitResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await resendVerification(form.email.trim());
      setNotice(res.message || 'Verification email sent — please check your inbox.');
      if (res.devVerifyLink) setDevLink(res.devVerifyLink);
      if (res.devPreviewUrl) setDevPreview(res.devPreviewUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      setNotice(res.message || 'Verification email sent — please check your inbox.');
      if (res.devVerifyLink) setDevLink(res.devVerifyLink);
      if (res.devPreviewUrl) setDevPreview(res.devPreviewUrl);
      setView('sent');
      toast.push('Verification email sent — check your inbox!', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await forgotPassword(form.email.trim());
      setNotice(res.message || 'If an account exists, a reset link is on its way.');
      if (res.devResetLink) setDevLink(res.devResetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cust-auth-overlay" onClick={closeAuth}>
      <div
        className="cust-auth-card"
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        tabIndex={-1}
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cust-auth-close" onClick={closeAuth} aria-label="Close">
          ×
        </button>

        <div className="cust-auth-brand">
          <span className="cust-auth-script">Grand</span> Restaurant &amp; Cafe
        </div>

        {authReason && <p className="cust-auth-reason">{authReason}</p>}

        {view === 'sent' ? (
          <div className="cust-auth-form">
            <h3 className="cust-auth-title">Check your email</h3>
            <p className="cust-auth-sub">
              We sent a verification link to <strong>{form.email}</strong>. Click the link in that
              email to activate your account, then log in.
            </p>
            {notice && <p className="cust-auth-notice">{notice}</p>}
            {(devLink || devPreview) && (
              <p className="cust-auth-notice" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                (Dev mode — email preview:{' '}
                {devPreview && <a href={devPreview} target="_blank" rel="noreferrer">open sent email</a>}
                {devPreview && devLink && ' · '}
                {devLink && <a href={devLink}>click here to verify directly</a>})
              </p>
            )}
            <button
              className="btn btn-primary cust-auth-submit"
              onClick={() => switchView('login')}
            >
              Back to login
            </button>
            <button
              type="button"
              className="cust-auth-switch"
              onClick={submitResend}
              disabled={resending}
            >
              {resending ? 'Resending…' : 'Resend verification email'}
            </button>
          </div>
        ) : view === 'forgot' ? (
          <form className="cust-auth-form" onSubmit={submitForgot}>
            <h3 className="cust-auth-title">Reset your password</h3>
            <p className="cust-auth-sub">We&rsquo;ll email you a link to set a new password.</p>
            <label className="cust-field">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
              />
            </label>
            {error && <p className="cust-auth-error">{error}</p>}
            {notice && (
              <p className="cust-auth-notice">
                {notice}
                {devLink && (
                  <>
                    {' '}
                    <a href={devLink} onClick={closeAuth}>
                      Open reset link (dev)
                    </a>
                  </>
                )}
              </p>
            )}
            <button className="btn btn-primary cust-auth-submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" className="cust-auth-switch" onClick={() => switchView('login')}>
              ← Back to login
            </button>
          </form>
        ) : (
          <>
            <div className="cust-auth-tabs">
              <button
                className={`cust-auth-tab ${view === 'login' ? 'is-active' : ''}`}
                onClick={() => switchView('login')}
                type="button"
              >
                Login
              </button>
              <button
                className={`cust-auth-tab ${view === 'register' ? 'is-active' : ''}`}
                onClick={() => switchView('register')}
                type="button"
              >
                Register
              </button>
            </div>

            <button className="cust-google-btn" type="button" onClick={() => loginWithGoogle()}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="cust-auth-divider">
              <span>or with email</span>
            </div>

            {view === 'login' ? (
              <form className="cust-auth-form" onSubmit={submitLogin}>
                <label className="cust-field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="cust-field">
                  <span>Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Your password"
                  />
                </label>
                {error && <p className="cust-auth-error">{error}</p>}
                {needsVerify && (
                  <div className="cust-auth-notice">
                    <button
                      type="button"
                      className="cust-auth-switch"
                      onClick={submitResend}
                      disabled={resending}
                      style={{ padding: 0, marginBottom: 8 }}
                    >
                      {resending ? 'Resending…' : 'Resend verification email'}
                    </button>
                    {notice && <p style={{ marginTop: 6 }}>{notice}</p>}
                    {(devLink || devPreview) && (
                      <p style={{ fontSize: '0.8rem', wordBreak: 'break-all', marginTop: 6 }}>
                        (Dev mode:{' '}
                        {devPreview && <a href={devPreview} target="_blank" rel="noreferrer">open sent email</a>}
                        {devPreview && devLink && ' · '}
                        {devLink && <a href={devLink}>verify directly</a>})
                      </p>
                    )}
                  </div>
                )}
                <button className="btn btn-primary cust-auth-submit" disabled={busy}>
                  {busy ? 'Signing in…' : 'Login'}
                </button>
                <button type="button" className="cust-auth-switch" onClick={() => switchView('forgot')}>
                  Forgot password?
                </button>
              </form>
            ) : (
              <form className="cust-auth-form" onSubmit={submitRegister}>
                <label className="cust-field">
                  <span>Name</span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                  />
                </label>
                <label className="cust-field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="cust-field">
                  <span>Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="At least 8 characters"
                  />
                </label>
                {error && <p className="cust-auth-error">{error}</p>}
                <button className="btn btn-primary cust-auth-submit" disabled={busy}>
                  {busy ? 'Creating account…' : 'Create account'}
                </button>
                <p className="cust-auth-fine">We&rsquo;ll email you a verification link — click it to activate your account.</p>
              </form>
            )}
          </>
        )}

        <ul className="cust-auth-benefits">
          {BENEFITS.map((b) => (
            <li key={b}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6.5 9.2 17.3 4 12.1" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
