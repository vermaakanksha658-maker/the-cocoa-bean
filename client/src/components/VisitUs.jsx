import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView.js';
import './VisitUs.css';

const hours = [
  { days: [1, 2, 3, 4, 5], open: 8, close: 21.5, label: 'Monday – Friday' },
  { days: [6], open: 9, close: 23, label: 'Saturday' },
  { days: [0], open: 9, close: 22, label: 'Sunday' },
];

function useOpenStatus() {
  const [status, setStatus] = useState({ open: false, text: '' });

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const mins = now.getHours() + now.getMinutes() / 60;
      const day = now.getDay();
      const today = hours.find((h) => h.days.includes(day));
      if (!today) return setStatus({ open: false, text: 'Open breakfast till late' });
      const isOpen = mins >= today.open && mins < today.close;
      setStatus({
        open: isOpen,
        text: isOpen ? "We're open" : `Opens ${today.label} ${today.open}:00`,
      });
    };
    compute();
    const t = setInterval(compute, 60000);
    return () => clearInterval(t);
  }, []);

  return status;
}

export default function VisitUs() {
  const [leftRef, leftIn] = useInView();
  const [rightRef, rightIn] = useInView();
  const status = useOpenStatus();

  const timeLabel = (h) => {
    const hm = (x) => {
      const hh = Math.floor(x);
      const mm = Math.round((x - hh) * 60);
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
    };
    return `${hm(h.open)} — ${hm(h.close)}`;
  };

  return (
    <section id="visit" className="section-pad visit">
      <div className="container visit-grid">
        <div className={`visit-map reveal reveal-left ${leftIn ? 'in-view' : ''}`} ref={leftRef}>
          <iframe
            title="The Cocoa Bean location"
            src="https://maps.google.com/maps?q=Brewery%20District%20City%20Center&t=&z=14&ie=UTF8&iwloc=B&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className={`visit-info reveal reveal-right ${rightIn ? 'in-view' : ''}`} ref={rightRef}>
          <span className="kicker">find us</span>
          <h2 className="section-title">Visit The Cocoa Bean</h2>

          <div className={`visit-status ${status.open ? 'visit-open' : 'visit-closed'}`}>
            <span className="visit-status-dot">●</span>
            {status.text}
          </div>

          <div className="visit-block">
            <h3>Opening Hours</h3>
            <ul className="hours">
              {hours.map((h) => (
                <li key={h.label}>
                  <span>{h.label}</span>
                  <span className="hours-time">{timeLabel(h)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="visit-block address-block">
            <h3>Address</h3>
            <p>
              24 Mocha Lane, Brewery District,
              <br />
              City Center — 400001
            </p>
            <a
              href="https://maps.google.com/maps?q=Brewery+District+City+Center"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary visit-btn"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}