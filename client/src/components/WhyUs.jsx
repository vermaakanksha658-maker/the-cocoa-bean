import { useRef } from 'react';
import './WhyUs.css';
import useInView from '../hooks/useInView.js';

const features = [
  {
    num: '01',
    title: 'Roasted In-House',
    desc: 'Small-batch single-origin beans, roasted fresh every week so every cup keeps its aroma.',
    more: 'Each batch is cupped and logged before it ever reaches the grinder.',
    badges: ['Single origin', 'Roasted weekly', 'Cup-tested'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M30 6c6 4 7 10 4 15l-8 13H22l-8-13c-3-5-2-11 4-15l2 4c6-1 8 1 10-4z" />
        <path d="M16 34c-3 2-6 6-6 10 6-1 10-3 12-7M32 34c3 2 6 6 6 10-6-1-10-3-12-7" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Barista Craft',
    desc: 'Latte art, precise temperatures — every shot considered.',
    more: 'Dialled in each morning: dose, yield and temperature checked twice.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22h22v10a11 11 0 01-22 0z" />
        <path d="M34 26h4a5 5 0 010 10h-4M18 18c0-4-3-5-2-9M27 18c1-4-2-5-1-9" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Cozy Corners',
    desc: 'Warm lights, soft seats and your own quiet nook.',
    more: 'Corner seats, warm lamps and power points that actually work.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 40l6-14h16l6 14H10z" />
        <path d="M16 26l8-16 8 16M24 10V6M14 14h4M30 14h4" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Quick & Warm Service',
    desc: 'Smiles first, coffee second — served in minutes, never rushed.',
    more: 'Order at the counter or your table, we will bring it over.',
    wide: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="24" cy="24" r="17" />
        <path d="M14 30c3 4 6 6 10 6s7-2 10-6M18 20h.01M30 20h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

const DOTS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function WhyUs() {
  const sectionRef = useRef(null);
  const [gridRef, gridIn] = useInView();

  const onCardMove = (e) => {
    if (reduced()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
    card.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
    card.style.setProperty('--gloss', '1');
  };

  const onCardLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--gloss', '0');
  };

  const onSectionMove = (e) => {
    if (reduced()) return;
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };

  const onSectionLeave = () => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty('--sx', '50%');
    el.style.setProperty('--sy', '35%');
  };

  return (
    <section className="section-pad why" ref={sectionRef} onMouseMove={onSectionMove} onMouseLeave={onSectionLeave}>
      <span className="why-fx" aria-hidden="true">
        {DOTS.map((_, i) => (
          <span key={i} style={{ '--i': i }}></span>
        ))}
      </span>

      <div className="container">
        <div className="section-head">
          <span className="kicker">why cocoa bean</span>
          <h2 className="section-title why-title">Brewed to Be Memorable</h2>
          <div className="divider"></div>
        </div>

        <div className="why-grid" ref={gridRef}>
          {features.map((f, i) => (
            <div
              className={`why-card ${f.wide ? 'why-card-wide' : ''}`}
              key={f.title}
              onMouseMove={onCardMove}
              onMouseLeave={onCardLeave}
              style={{ '--d': `${i * 0.1}s` }}
            >
              <div className={`why-card-inner ${gridIn ? 'in-view' : ''}`}>
                <span className="why-num" aria-hidden="true">
                  {f.num}
                </span>

                <div className="why-icon">
                  <svg className="why-ring" viewBox="0 0 100 100" aria-hidden="true">
                    <circle className="why-ring-draw" cx="50" cy="50" r="46" />
                  </svg>
                  <span className="why-icon-glyph">{f.icon}</span>
                </div>

                <div className="why-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <span className="why-more">{f.more}</span>
                  {f.badges && (
                    <span className="why-badges">
                      {f.badges.map((b) => (
                        <span className="why-badge" key={b}>
                          {b}
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                <span className="why-watermark" aria-hidden="true">
                  {f.icon}
                </span>
              </div>
              <span className="why-border" aria-hidden="true"></span>
            </div>
          ))}
        </div>
      </div>

      <span className="why-spot" aria-hidden="true"></span>
    </section>
  );
}
