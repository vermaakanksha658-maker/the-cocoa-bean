import { useRef } from 'react';
import './WhyUs.css';
import useInView from '../hooks/useInView.js';

const features = [
  {
    num: '01',
    title: 'Delicious Food',
    desc: 'Freshly cooked, generously served — every plate made to please.',
    more: 'From quick bites to full meals, the kitchen cooks to order.',
    badges: ['Cooked fresh', 'Generous portions', 'Made to share'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 26a16 16 0 0 1 32 0z" />
        <path d="M6 26h36" />
        <circle cx="24" cy="15" r="2" fill="currentColor" stroke="none" />
        <path d="M14 26v8M34 26v8M24 26v10" />
        <ellipse cx="24" cy="41" rx="14" ry="3" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Café Special',
    desc: 'Handcrafted drinks and café favourites, poured with care.',
    more: 'Cold coffee, mocktails, chai and more — your café corner.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20h24v10a12 12 0 0 1-24 0z" />
        <path d="M34 23h4a5 5 0 0 1 0 10h-4" />
        <path d="M17 15c0-4-3-5-2-9M26 15c1-4-2-5-1-9" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Family Friendly',
    desc: 'A warm room where every generation feels at home.',
    more: 'Space for family dinners, get-togethers and big celebrations.',
    badges: ['Family dinners', 'Room for groups', 'All generations'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="17" cy="15" r="5" />
        <circle cx="32" cy="18" r="4" />
        <path d="M8 38c0-6 4-10 9-10s9 4 9 10" />
        <path d="M27 38c0-5 3-8 7-8 4 0 7 3 7 8" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Cosy Ambience',
    desc: 'Soft lights, comfy seating and a mood made for lingering.',
    more: 'Warm interiors that make every meal feel a little special.',
    wide: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 40l3-14h18l3 14H12z" />
        <path d="M17 26l7-14 7 14" />
        <path d="M24 12V7M14 16h4M30 16h4" />
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
          <span className="kicker">why grand</span>
          <h2 className="section-title why-title">Made to Be Memorable</h2>
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

      <div className="why-ambient" aria-hidden="true">
        <span className="why-amb-stain"></span>
        <span className="why-amb-stain why-amb-stain-2"></span>
        <span className="why-amb-glow"></span>
        <span className="why-amb-glow why-amb-glow-2"></span>
        <span className="why-amb-wisp"></span>
        <span className="why-amb-wisp"></span>
        <span className="why-amb-wisp"></span>
        <span className="why-amb-wisp"></span>
        <span className="why-amb-bean"></span>
        <span className="why-amb-bean"></span>
        <span className="why-amb-bean"></span>
        <span className="why-amb-bean"></span>
        <span className="why-amb-bean"></span>
        <span className="why-amb-bean"></span>
      </div>
    </section>
  );
}
