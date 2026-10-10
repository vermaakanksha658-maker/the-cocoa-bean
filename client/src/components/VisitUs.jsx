import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView.js';
import './VisitUs.css';

const hours = [
  { days: [1, 2, 3, 4, 5], open: 8, close: 21.5, label: 'Monday – Friday' },
  { days: [6], open: 9, close: 23, label: 'Saturday' },
  { days: [0], open: 9, close: 22, label: 'Sunday' },
];

const ADDRESS = 'The Cocoa Bean, 24 Mocha Lane, Brewery District, City Center — 400001';
const MAPS_URL = 'https://maps.google.com/maps?q=Brewery+District+City+Center';

const shots = [
  {
    src: 'https://images.unsplash.com/photo-1777451441095-c7ef2f875929?fm=jpg&q=80&w=400&auto=format&fit=crop',
    caption: 'Plant-filled corners',
  },
  {
    src: 'https://images.unsplash.com/photo-1752757257738-9a4f136b3f87?fm=jpg&q=80&w=400&auto=format&fit=crop',
    caption: 'Wooden warmth',
  },
  {
    src: 'https://images.unsplash.com/photo-1757010055832-de355d2f8f06?fm=jpg&q=80&w=400&auto=format&fit=crop',
    caption: 'Warm afternoon light',
  },
];

const amenities = [
  {
    label: 'Free Wi-Fi',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        <path d="M4.5 12.2a10.5 10.5 0 0 1 15 0M7.8 15.4a6 6 0 0 1 8.4 0" />
        <circle cx="12" cy="18.6" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Pet friendly',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="7" cy="9.6" r="1.7" />
        <circle cx="11" cy="7.4" r="1.7" />
        <circle cx="15.2" cy="7.4" r="1.7" />
        <circle cx="17.6" cy="10.4" r="1.7" />
        <path d="M12.4 12.2c2.2 0 3.8 1.6 3.8 3.2 0 1.5-1.6 2.6-3.8 2.6s-3.8-1.1-3.8-2.6c0-1.6 1.6-3.2 3.8-3.2z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Outdoor seating',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M3.5 12a8.5 8.5 0 0 1 17 0z" />
        <path d="M12 12v6.5a2 2 0 0 0 4 0" />
        <path d="M12 12V3.2" />
      </svg>
    ),
  },
  {
    label: 'Parking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <path d="M9.6 17V7.4h3.3a2.7 2.7 0 0 1 0 5.4H9.6" />
      </svg>
    ),
  },
  {
    label: 'Laptop friendly',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4.5" y="6" width="15" height="9.5" rx="1.8" />
        <path d="M2.5 19h19" />
      </svg>
    ),
  },
];

const contacts = [
  {
    label: 'Call us',
    href: 'tel:+919876543210',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 3.6h3l1.5 4-2 1.5a11.5 11.5 0 0 0 5.4 5.4l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.5 5.8 2 2 0 0 1 6.5 3.6z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@thecocoabean.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5.2" width="18" height="13.6" rx="2.6" />
        <path d="m4 7.2 8 5.8 8-5.8" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919876543210',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.8a8.6 8.6 0 0 1-12.6 7.6L4 20.8l1.4-4.3A8.6 8.6 0 1 1 21 11.8z" />
        <path d="M9.2 10h5.6M9.2 13.4h3.6" />
      </svg>
    ),
  },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function hm(x) {
  const hh = Math.floor(x);
  const mm = Math.round((x - hh) * 60);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
}

function useOpenStatus() {
  const [status, setStatus] = useState({ open: false, text: 'Checking today’s hours…', day: new Date().getDay() });

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const mins = now.getHours() + now.getMinutes() / 60;
      const day = now.getDay();
      const today = hours.find((h) => h.days.includes(day));

      if (today && mins >= today.open && mins < today.close) {
        setStatus({ open: true, text: `Open now · closes ${hm(today.close)}`, day });
        return;
      }

      for (let d = 0; d < 8; d++) {
        const checkDay = (day + d) % 7;
        const slot = hours.find((h) => h.days.includes(checkDay));
        if (!slot) continue;
        if (d === 0 && mins >= slot.close) continue;

        const inMinutes = d * 1440 + slot.open * 60 - Math.round(mins * 60);
        const label = DAY_NAMES[checkDay];
        const text =
          inMinutes < 60
            ? `Opens in ${inMinutes} min`
            : d === 0
              ? `Opens today at ${hm(slot.open)}`
              : `Opens ${label} at ${hm(slot.open)}`;
        setStatus({ open: false, text, day });
        return;
      }

      setStatus({ open: false, text: 'Hours vary on holidays', day });
    };

    compute();
    const t = setInterval(compute, 30000);
    return () => clearInterval(t);
  }, []);

  return status;
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21.2s7-6.4 7-11.2a7 7 0 1 0-14 0c0 4.8 7 11.2 7 11.2z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6.5 9.2 17.3 4 12.1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 6.2A2.2 2.2 0 0 0 12.8 4H6.2A2.2 2.2 0 0 0 4 6.2v6.6A2.2 2.2 0 0 0 6.2 15" />
    </svg>
  );
}

export default function VisitUs() {
  const [leftRef, leftIn] = useInView();
  const [rightRef, rightIn] = useInView();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);
  const status = useOpenStatus();

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const timeLabel = (h) => `${hm(h.open)} — ${hm(h.close)}`;

  const copyAddress = async () => {
    const flash = () => {
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1800);
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(ADDRESS);
        flash();
        return;
      }
      throw new Error('clipboard api unavailable');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = ADDRESS;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) throw new Error('copy failed');
        flash();
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <section id="visit" className="section-pad visit">
      <div className="container visit-grid">
        <div className={`visit-col reveal reveal-left ${leftIn ? 'in-view' : ''}`} ref={leftRef}>
          <div className="visit-map">
            <iframe
              title="The Cocoa Bean location"
              src="https://maps.google.com/maps?q=Brewery%20District%20City%20Center&t=&z=14&ie=UTF8&iwloc=B&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            <span className="visit-map-pin" aria-hidden="true">
              <PinIcon />
            </span>

            <div className="visit-map-card">
              <strong>The Cocoa Bean</strong>
              <span>24 Mocha Lane, Brewery District</span>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="visit-map-link">
                Open in Maps
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </div>

          <div className="visit-shots">
            {shots.map((s) => (
              <img key={s.src} src={s.src} alt={s.caption} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>

        <div className={`visit-info reveal reveal-right ${rightIn ? 'in-view' : ''}`} ref={rightRef}>
          <span className="kicker">find us</span>
          <h2 className="section-title">Visit The Cocoa Bean</h2>

          <div className={`visit-status ${status.open ? 'visit-open' : 'visit-closed'}`} role="status">
            <span className="visit-status-dot" aria-hidden="true"></span>
            <span className="visit-status-text">{status.text}</span>
            <span className="visit-status-sub">{status.sub}</span>
          </div>

          <div className="visit-block">
            <h3>Opening Hours</h3>
            <ul className="hours">
              {hours.map((h) => {
                const isToday = h.days.includes(status.day);
                return (
                  <li key={h.label} className={isToday ? 'is-today' : ''}>
                    <span className="hours-label">
                      {h.label}
                      {isToday && <span className="hours-today-pill">Today</span>}
                    </span>
                    <span className="hours-time">{timeLabel(h)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="visit-block address-block">
            <h3>Find Us</h3>
            <p>
              24 Mocha Lane, Brewery District,
              <br />
              City Center — 400001
            </p>
            <p className="visit-note">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
              Nearest metro: City Center · 3 min walk
            </p>
            <p className="visit-note">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path d="M9.6 17V7.4h3.3a2.7 2.7 0 0 1 0 5.4H9.6" />
              </svg>
              Street parking · free after 6 PM
            </p>
            <div className="visit-actions">
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="btn btn-primary visit-btn">
                Get Directions
              </a>
              <button
                type="button"
                className={`btn btn-outline visit-copy ${copied ? 'is-copied' : ''}`}
                onClick={copyAddress}
              >
                {copied ? (
                  <>
                    <CheckIcon />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon />
                    Copy address
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="visit-block">
            <h3>Good to know</h3>
            <div className="visit-amenities">
              {amenities.map((a) => (
                <span className="visit-amenity" key={a.label}>
                  {a.icon}
                  {a.label}
                </span>
              ))}
            </div>
          </div>

          <div className="visit-contacts">
            {contacts.map((c) => (
              <a className="visit-contact" key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {c.icon}
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
