import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useCustomer } from '../customer/useCustomer.jsx';
import useOpenStatus from '../hooks/useOpenStatus.js';
import './Navbar.css';

const links = [
  { label: 'Home', id: 'home' },
  { label: 'Story', id: 'story' },
  { label: 'Menu', id: 'menu' },
  { label: 'Visit Us', id: 'visit' },
];

function LogoMark() {
  const crown = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 17.2 5.4 9l3.4 3.2L12 5.6l3.2 6.6L18.6 9 20 17.2H4z" />
      <path d="M3.4 19.4h17.2" />
      <circle cx="12" cy="4.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5.4" cy="8" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );

  return (
    <span className="logo-mark" aria-hidden="true">
      <span className="logo-mark-face logo-mark-front">{crown}</span>
      <span className="logo-mark-face logo-mark-back">{crown}</span>
    </span>
  );
}

function ThemeIcon({ dark }) {
  return (
    <svg
      key={dark ? 'moon' : 'sun'}
      className="theme-icon"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dark ? (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.2v2.1M12 19.7v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.2 12h2.1M19.7 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5" />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [indicator, setIndicator] = useState({ left: 0, width: 0, on: false });
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('cocoa-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const location = useLocation();
  const onMenu = location.pathname === '/menu';
  const { count, openCart } = useCart();
  const { customer, openAuth, logout } = useCustomer();
  const [custMenuOpen, setCustMenuOpen] = useState(false);
  const custWrapRef = useRef(null);
  const status = useOpenStatus();
  const listRef = useRef(null);

  useEffect(() => {
    if (!custMenuOpen) return undefined;
    const onDown = (e) => {
      if (!custWrapRef.current?.contains(e.target)) setCustMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setCustMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [custMenuOpen]);

  const initials = (customer?.name || 'G').trim().slice(0, 2).toUpperCase();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('cocoa-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min((y / max) * 100, 100) : 0);

      const moved = Math.abs(y - lastY);
      if (!open) {
        if (y > 260 && y > lastY + 6) setHidden(true);
        else if (y < lastY - 6 || y < 200) setHidden(false);
      }
      lastY = y;

      if (open && moved > 40) setOpen(false);

      if (onMenu) return;
      const offsets = links
        .map((l) => ({ id: l.id, top: document.getElementById(l.id)?.offsetTop ?? 0 }))
        .filter((s) => s.top <= y + 120);
      if (offsets.length) setActive(offsets[offsets.length - 1].id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [open, onMenu]);

  useEffect(() => {
    document.documentElement.classList.toggle('nav-hidden', hidden && !open);
    return () => document.documentElement.classList.remove('nav-hidden');
  }, [hidden, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const solid = scrolled || onMenu;
  const activeMenu = onMenu ? 'menu' : active;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector('.nav-active');
    if (!el) {
      setIndicator({ left: 0, width: 0, on: false });
      return;
    }
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setIndicator({ left: er.left - lr.left, width: er.width, on: true });
  }, [activeMenu, solid, open]);

  useEffect(() => {
    const onResize = () => {
      const list = listRef.current;
      if (!list) return;
      const el = list.querySelector('.nav-active');
      if (!el) return;
      const lr = list.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setIndicator({ left: er.left - lr.left, width: er.width, on: true });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const linkFor = (l) =>
    l.id === 'menu' ? '/menu' : { pathname: '/', hash: `#${l.id}` };

  return (
    <>
      <nav className={`navbar ${solid ? 'navbar-solid' : ''} ${hidden && !open ? 'navbar-hidden' : ''}`}>
        <span className="nav-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }}></span>
        </span>

        <div className="container navbar-inner">
          <Link to="/" className="logo" aria-label="Grand Restaurant & Cafe — home">
            <LogoMark />
            <span className="logo-text">
              <span className="logo-script">Grand</span> Restaurant &amp; Cafe
            </span>
          </Link>

          <ul className={`nav-links ${open ? 'nav-open' : ''}`} ref={listRef}>
            {links.map((l, i) => (
              <li key={l.id} style={{ '--i': i }}>
            {onMenu && l.id === 'menu' ? (
              <span className="nav-active" aria-current="page">
                {l.label}
              </span>
            ) : (
              <Link
                to={linkFor(l)}
                className={activeMenu === l.id ? 'nav-active' : ''}
                aria-current={activeMenu === l.id ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
            <span
              className={`nav-indicator ${indicator.on ? 'is-on' : ''}`}
              style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }}
              aria-hidden="true"
            ></span>

            {open && (
              <li className="nav-drawer-info" style={{ '--i': 4 }}>
                {customer ? (
                  <Link to="/my-orders" className="nav-drawer-reserve" onClick={() => setOpen(false)}>
                    My orders · {customer.name.split(' ')[0]}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="nav-drawer-reserve"
                    onClick={() => {
                      setOpen(false);
                      openAuth({ tab: 'login' });
                    }}
                  >
                    Login / Register
                  </button>
                )}
                <a
                  href="/#reserve"
                  className="nav-drawer-reserve"
                  onClick={() => setOpen(false)}
                >
                  Reserve a Table
                </a>
                <span className={`nav-drawer-status ${status.open ? 'is-open' : ''}`}>
                  <span className="nav-drawer-dot" aria-hidden="true"></span>
                  {status.text}
                </span>
                <span className="nav-drawer-hours">{status.sub}</span>
                <a href="tel:+919876543210" className="nav-drawer-phone">
                  +91 98XXX XXXXX
                </a>
                <button
                  type="button"
                  className="nav-drawer-theme"
                  onClick={() => setDark(!dark)}
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <ThemeIcon dark={dark} />
                  {dark ? 'Light mode' : 'Dark mode'}
                </button>
              </li>
            )}
          </ul>

          <div className="nav-right">
            {customer ? (
              <div className="cust-chip-wrap" ref={custWrapRef} style={{ position: 'relative' }}>
                <button
                  className="cust-chip"
                  onClick={() => setCustMenuOpen((v) => !v)}
                  aria-expanded={custMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Your account"
                >
                  <span className="cust-avatar">{initials}</span>
                  <span className="cust-chip-name">{customer.name.split(' ')[0]}</span>
                </button>
                {custMenuOpen && (
                  <div className="cust-menu" role="menu">
                    <div className="cust-menu-head">
                      <span className="cust-menu-name">{customer.name}</span>
                      <span className="cust-menu-mail">{customer.email}</span>
                      {!customer.emailVerified && (
                        <span className="cust-verify-note">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </svg>
                          Email not verified
                        </span>
                      )}
                    </div>
                    <Link to="/my-orders" className="cust-menu-item" onClick={() => setCustMenuOpen(false)} role="menuitem">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      My orders
                    </Link>
                    <button
                      className="cust-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setCustMenuOpen(false);
                        logout();
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="cust-login-btn" onClick={() => openAuth({ tab: 'login' })}>
                Login
              </button>
            )}

            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              <ThemeIcon dark={dark} />
            </button>

            <button className="cart-toggle" onClick={openCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              {count > 0 && (
                <span key={count} className="cart-badge">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            {onMenu ? (
              <Link to="/#reserve" className="btn btn-primary btn-nav">
                Reserve
              </Link>
            ) : (
              <a href="#reserve" className="btn btn-primary btn-nav">
                Reserve
              </a>
            )}

            <button
              className={`hamburger ${open ? 'hamburger-open' : ''}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <span
        className={`nav-backdrop ${open ? 'nav-backdrop-on' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      ></span>
    </>
  );
}
