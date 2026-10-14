import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../customer/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message || 'If an account exists for that email, a reset link is on its way.');
      if (res.devResetLink) setDevLink(res.devResetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="myorders-wrap" style={{ maxWidth: 460 }}>
      <h1 className="myorders-title">Forgot password</h1>
      <p className="myorders-sub">Enter your account email and we&rsquo;ll send a reset link.</p>
      <form className="cust-auth-form" onSubmit={submit}>
        <label className="cust-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        {error && <p className="cust-auth-error">{error}</p>}
        {message && (
          <p className="cust-auth-notice">
            {message}
            {devLink && (
              <>
                {' '}
                <a href={devLink}>Open reset link (dev)</a>
              </>
            )}
          </p>
        )}
        <button className="btn btn-primary cust-auth-submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link to="/" className="cust-auth-switch">← Back to the cafe</Link>
      </p>
    </div>
  );
}
