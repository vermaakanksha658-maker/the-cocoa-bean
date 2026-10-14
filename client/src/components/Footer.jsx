import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import useOpenStatus from '../hooks/useOpenStatus.js';
import './Footer.css';

const quickLinks = [
  { label: 'Home', to: { pathname: '/', hash: '#home' } },
  { label: 'Our Story', to: { pathname: '/', hash: '#story' } },
  { label: 'Menu', to: '/menu' },
  { label: 'Visit Us', to: { pathname: '/', hash: '#visit' } },
  { label: 'Reserve', to: { pathname: '/', hash: '#reserve' } },
];

const categories = [
  { label: 'Coffee', to: '/menu' },
  { label: 'Tea', to: '/menu' },
  { label: 'Bakes', to: '/menu' },
  { label: 'Food', to: '/menu' },
  { label: 'Cold', to: '/menu' },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/aliganjcafe/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@Aliganjgrandcafe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M22.5 8.4a3 3 0 0 0-2.1-2.1C18.7 5.8 12 5.8 12 5.8s-6.7 0-8.4.5A3 3 0 0 0 1.5 8.4C1 10.2 1 12 1 12s0 1.8.5 3.6a3 3 0 0 0 2.1 2.1c1.7.5 8.4.5 8.4.5s6.7 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-3.6.5-3.6s0-1.8-.5-3.6z" />
        <path d="M10 8.8l6 3.2-6 3.2z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Google Maps',
    href: 'https://maps.app.goo.gl/SttwDLxifUXjGwUZ9',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.2s7-6.4 7-11.2a7 7 0 1 0-14 0c0 4.8 7 11.2 7 11.2z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
];

const contacts = [
  {
    label: 'Top Floor, Aliganj Plaza, Sector J',
    sub: 'Opp. Danbro, Aliganj, Lucknow — 226024',
    href: 'https://maps.app.goo.gl/SttwDLxifUXjGwUZ9',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.2s7-6.4 7-11.2a7 7 0 1 0-14 0c0 4.8 7 11.2 7 11.2z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
  {
    label: '+91 98XXX XXXXX',
    sub: 'Call to reserve a table',
    href: 'tel:+919876543210',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 3.6h3l1.5 4-2 1.5a11.5 11.5 0 0 0 5.4 5.4l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.5 5.8 2 2 0 0 1 6.5 3.6z" />
      </svg>
    ),
  },
  {
    label: 'hello@example.com',
    sub: 'Official email coming soon',
    href: 'mailto:hello@example.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5.2" width="18" height="13.6" rx="2.6" />
        <path d="m4 7.2 8 5.8 8-5.8" />
      </svg>
    ),
  },
];

export default function Footer() {
  const status = useOpenStatus();

  return (
    <footer className="footer">
      <div className="footer-ambient" aria-hidden="true">
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-bean"></span>
        <span className="footer-amb-sheen"></span>
      </div>

      <div className="footer-inner">
        <div className="container">
          <div className="footer-cta">
            <div className="footer-cta-copy">
              <h3>Reserve your table</h3>
              <p>A warm welcome and your favourite seat — held for 15 minutes.</p>
            </div>
            <div className="footer-cta-actions">
              <Link to={{ pathname: '/', hash: '#reserve' }} className="btn btn-primary footer-cta-btn">
                Reserve a Table
              </Link>
              <a href="tel:+919876543210" className="btn btn-ghost footer-cta-call">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6.5 3.6h3l1.5 4-2 1.5a11.5 11.5 0 0 0 5.4 5.4l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.5 5.8 2 2 0 0 1 6.5 3.6z" />
                </svg>
                Call us
              </a>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo footer-logo">
                <span className="logo-script">Grand</span> Restaurant &amp; Cafe
              </Link>
              <p className="footer-tag">
                <span className="footer-tag-full">
                  Great food, handcrafted drinks and warm moments — a restaurant &amp; cafe in the
                  heart of Lucknow.
                </span>
                <span className="footer-tag-short">
                  Great food, handcrafted drinks and warm moments in Lucknow.
                </span>
              </p>
              <div className="footer-cats">
                {categories.map((c) => (
                  <Link key={c.label} to={c.to}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="footer-contact">
                {contacts.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.external ? '_blank' : undefined}
                      rel={c.external ? 'noreferrer' : undefined}
                    >
                      <span className="footer-contact-icon">{c.icon}</span>
                      <span className="footer-contact-body">
                        <strong>{c.label}</strong>
                        <small>{c.sub}</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col footer-follow">
              <h4>Follow Us</h4>
          <div className="footer-social">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="footer-social-link">
                <span className="footer-social-face">{s.icon}</span>
                <span className="footer-social-face footer-social-back">{s.icon}</span>
              </a>
            ))}
          </div>

              <div className="footer-hours">
                <span className={`footer-hours-dot ${status.open ? 'is-open' : ''}`} aria-hidden="true"></span>
                <span>
                  <strong>{status.text}</strong>
                  <small>{status.sub}</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>&copy; {new Date().getFullYear()} Grand Restaurant &amp; Cafe. All rights reserved.</p>
            <span className="footer-legal">Privacy · Terms · Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
