import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import useOpenStatus from '../hooks/useOpenStatus.js';
import './Navbar.css';

const links = [
  { label: 'Home', id: 'home' },
  { label: 'Story', id: 'story' },
  { label: 'Menu', id: 'menu' },
  { label: 'Visit Us', id: 'visit' },
];

function LogoMark() {
  const bean = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="6.4" ry="9.4" transform="rotate(-18 12 12)" />
      <path d="M9.5 3.8c3.1 4.1 3.1 12.3 5.1 16.4" />
    </svg>
  );

  return (
    <span className="logo-mark" aria-hidden="true">
      <span className="logo-mark-face logo-mark-front">{bean}</span>
      <span className="logo-mark-face logo-mark-back">{bean}</span>
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
  const status = useOpenStatus();
  const listRef = useRef(null);

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
          <Link to="/" className="logo" aria-label="The Cocoa Bean — home">
            <LogoMark />
            <span className="logo-text">
              <span className="logo-script">the</span> Cocoa Bean
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
