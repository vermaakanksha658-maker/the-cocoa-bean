import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe, login } from './api.js';
import { useAdminTheme } from './adminTheme.js';

const LOGIN_BG =
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?fm=jpg&q=80&w=1200&auto=format&fit=crop';

const LOGIN_PLATES = [
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?fm=jpg&q=80&w=680&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?fm=jpg&q=80&w=640&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?fm=jpg&q=80&w=620&auto=format&fit=crop',
];

function LoginCup() {
  return (
    <div className="admin-login-cup-stage" aria-hidden="true">
      <div className="admin-login-cup-tilt">
        <svg viewBox="0 0 140 150" fill="none">
          <g className="admin-login-steam" stroke="#E7D3C1" strokeWidth="3" strokeLinecap="round">
            <path d="M60 58c-5-9 5-11 0-22M78 62c-5-9 5-11 0-22" />
          </g>
          <ellipse cx="70" cy="128" rx="36" ry="7" stroke="#C9A227" strokeWidth="2.4" fill="rgba(201,162,39,0.08)" />
          <path d="M42 66h62v40a31 31 0 0 1-62 0z" stroke="#C9A227" strokeWidth="3" fill="rgba(201,162,39,0.1)" />
          <path d="M104 76h10a12 12 0 0 1 0 24h-9" stroke="#C9A227" strokeWidth="3" />
          <path d="M108 46v-7M94 46v-5M122 46v-5" stroke="#A9714B" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="73" cy="92" rx="17" ry="20" stroke="#C9A227" strokeWidth="2.2" fill="rgba(169,113,75,0.35)" />
        </svg>
      </div>
    </div>
  );
}

function FloatBean({ top, left, size, delay }) {
  return (
    <svg
      className="admin-login-bean"
      style={{ top, left, width: size, height: size, animationDelay: `${delay}s` }}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="20" rx="12" ry="17" fill="rgba(23,16,11,0.5)" transform="rotate(-22 20 20)" />
      <path d="M20 4c-6 8-6 24 0 32" fill="none" stroke="rgba(247,240,230,0.4)" strokeWidth="1.7" transform="rotate(-22 20 20)" />
    </svg>
  );
}

function LoginStage() {
  return (
    <div className="admin-login-stage" aria-hidden="true">
      <div className="admin-login-stack">
        {LOGIN_PLATES.map((src, i) => (
          <div className={`admin-login-plate admin-login-plate-${i + 1}`} key={src}>
            <img src={src} alt="" loading="eager" />
          </div>
        ))}
      </div>
      <span className="admin-login-stage-glow"></span>
    </div>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme } = useAdminTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const rectRef = useRef(null);

  useEffect(() => {
    getMe()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => setChecking(false));
  }, [navigate]);

  useEffect(() => {
    const el = rectRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--mx', x.toFixed(3));
      el.style.setProperty('--my', y.toFixed(3));
    };
    const reset = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', reset);
    };
  }, [checking]);

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
        <p>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="admin-page admin-login-page" data-theme={theme}>
      <div className="admin-login-bg" aria-hidden="true">
        <span className="admin-login-blob admin-login-blob-1"></span>
        <span className="admin-login-blob admin-login-blob-2"></span>
        <span className="admin-login-blob admin-login-blob-3"></span>
        <span className="admin-login-orb admin-login-orb-1"></span>
        <span className="admin-login-orb admin-login-orb-2"></span>
        <span className="admin-login-grid"></span>
        <span className="admin-login-noise"></span>
      </div>

      <div className="admin-login-rect" ref={rectRef}>
        <div className="admin-login-rect-left">
          <div
            className="admin-login-visual-bg"
            style={{ backgroundImage: `url(${LOGIN_BG})` }}
            aria-hidden="true"
          ></div>
          <div className="admin-login-visual-wash" aria-hidden="true"></div>
          <div className="admin-login-rays" aria-hidden="true">
            <span></span>
            <span></span>
          </div>

          <LoginStage />

          <LoginCup />
          <FloatBean top="20%" left="10%" size={24} delay={0} />
          <FloatBean top="70%" left="8%" size={18} delay={1.2} />
          <FloatBean top="40%" left="86%" size={22} delay={2} />
          <FloatBean top="78%" left="78%" size={16} delay={2.8} />
          <FloatBean top="16%" left="60%" size={14} delay={3.6} />
          <FloatBean top="58%" left="90%" size={20} delay={4.4} />

          <div className="admin-login-visual-copy">
            <span className="admin-login-script">Grand Restaurant &amp; Cafe</span>
            <h2>Great food, warm service, managed with care.</h2>
            <p>Menu, orders, reservations and reviews - one warm place.</p>
          </div>
        </div>

        <div className="admin-login-rect-right">
          <div className="admin-login-card">
            <Link to="/" className="admin-login-brand">
              <span className="admin-logo-script">Grand</span> Restaurant &amp; Cafe
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
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <Link to="/" className="admin-login-back">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
