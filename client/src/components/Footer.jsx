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
    href: 'https://www.instagram.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 8h3V5h-3a4 4 0 00-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
      </svg>
    ),
  },
];

const contacts = [
  {
    label: '24 Mocha Lane, Brewery District',
    sub: 'City Center — 400001',
    href: 'https://maps.google.com/maps?q=Brewery+District+City+Center',
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
    label: 'hello@cocoabean.cafe',
    sub: 'We reply within a day',
    href: 'mailto:hello@cocoabean.cafe',
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
      <div className="footer-inner">
        <div className="container">
          <div className="footer-cta">
            <div className="footer-cta-copy">
              <h3>Reserve your corner</h3>
              <p>Best seat by the window, kettle warm — table held for 15 minutes.</p>
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
                <span className="logo-script">the</span> Cocoa Bean
              </Link>
              <p className="footer-tag">
                <span className="footer-tag-full">
                  Elegant coffee, crafted moments. Brewed with love since 2012 — slow-roasted,
                  hand-poured, always shared.
                </span>
                <span className="footer-tag-short">
                  Elegant coffee, crafted moments. Brewed with love since 2012.
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
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                    {s.icon}
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
            <p>&copy; {new Date().getFullYear()} The Cocoa Bean. All rights reserved.</p>
            <span className="footer-legal">Privacy · Terms · Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
