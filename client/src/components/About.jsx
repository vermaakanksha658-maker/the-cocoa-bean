import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView.js';
import './About.css';

const MAIN_IMG =
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?fm=jpg&q=80&w=900&auto=format&fit=crop';
const POLAROID_IMG =
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?fm=jpg&q=80&w=600&auto=format&fit=crop';
const FOUNDER_IMG =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?fm=jpg&q=80&w=400&auto=format&fit=crop';

const LIST = [
  'Fresh food, cooked to order',
  'Handcrafted drinks & desserts',
  'A warm room for every occasion',
];

const TIMELINE = [
  { year: 'Daily', text: 'Fresh cooking, every single day' },
  { year: 'Always', text: 'Handcrafted drinks, made to order' },
  { year: 'For all', text: 'A table for every occasion — family, friends, celebrations' },
  { year: 'Now', text: 'Serving Lucknow with warmth' },
];

const STATS = [
  { value: 100, suffix: '%', label: 'made with care' },
  { value: 1, suffix: '', label: 'warm welcome, every time' },
  { value: 100, suffix: '%', label: 'hospitality, always' },
];

const MARQUEE_WORDS = ['Fresh daily', 'Made to order', 'Family friendly', 'Celebrations', 'Served warm'];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function BeanIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="6.4" ry="9.4" transform="rotate(-18 12 12)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 3.8c3.1 4.1 3.1 12.3 5.1 16.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BigBean() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="13.5" transform="rotate(-18 12 12)" stroke="currentColor" strokeWidth="1" />
      <path d="M9 3.2c4.4 5.8 4.4 17.2 7.2 23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function StatChip({ value, suffix, label, inView, index = 0 }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setN(value);
      return;
    }
    let raf;
    const startedAt = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const p = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div className="about-stat" style={{ '--i': index }}>
      <span className="about-stat-num">
        {n}
        {suffix}
      </span>
      <span className="about-stat-label">{label}</span>
    </div>
  );
}

export default function About() {
  const [leftRef, leftIn] = useInView();
  const [rightRef, rightIn] = useInView();
  const [statsRef, statsIn] = useInView();
  const [tlFill, setTlFill] = useState(0);
  const parallaxRef = useRef(null);
  const frameRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let raf = null;
    const update = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const clamped = Math.min(Math.max(progress, 0), 1);
      el.style.setProperty('--parallax', `${(clamped - 0.5) * -26}px`);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.3;
      const p = (start - r.top) / (start - end);
      setTlFill(Math.min(Math.max(p, 0), 1));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const onFounderMove = (e) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
    card.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
    card.style.setProperty('--fx', `${px * 100}%`);
    card.style.setProperty('--fy', `${py * 100}%`);
  };

  const onFounderLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  const onFrameMove = (e) => {
    if (prefersReducedMotion()) return;
    const frame = frameRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    const fx = ((e.clientX - r.left) / r.width - 0.5).toFixed(3);
    const fy = ((e.clientY - r.top) / r.height - 0.5).toFixed(3);
    frame.style.setProperty('--fx', fx);
    frame.style.setProperty('--fy', fy);
  };

  const onFrameLeave = () => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty('--fx', '0');
    frame.style.setProperty('--fy', '0');
  };

  return (
    <section id="story" className="section-pad about">
      <span className="about-fx" aria-hidden="true">
        <BigBean />
      </span>

      <div className="about-ambient" aria-hidden="true">
        <span className="about-wisp"></span>
        <span className="about-wisp"></span>
        <span className="about-wisp"></span>
        <span className="about-wisp"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
        <span className="about-bean"></span>
      </div>

      <div className="container about-grid">
        <div className={`about-media reveal reveal-left ${leftIn ? 'in-view' : ''}`} ref={leftRef}>
          <div
            className="about-media-frame"
            ref={frameRef}
            onMouseMove={onFrameMove}
            onMouseLeave={onFrameLeave}
          >
            <div className="about-media-inner" ref={parallaxRef}>
              <img
                src={MAIN_IMG}
                alt="Warm, cozy cafe interior with soft afternoon light"
                loading="lazy"
              />
            </div>
            <span className="about-grain" aria-hidden="true"></span>
            <span className="about-media-overlay">
              <span className="about-media-caption">Behind the counter</span>
            </span>
            <span className="about-media-glow" aria-hidden="true"></span>
            <span className="about-media-glow-2" aria-hidden="true"></span>

            <div className="about-polaroid">
              <div className="about-polaroid-inner">
                <div className="about-polaroid-face about-polaroid-front">
                  <img
                    src={POLAROID_IMG}
                    alt="A table full of fresh food at Grand Restaurant & Cafe"
                    loading="lazy"
                  />
                  <span className="about-polaroid-cap">Cooked fresh daily</span>
                </div>
                <div className="about-polaroid-face about-polaroid-back">
                  <span className="about-polaroid-back-cap">
                    <BeanIcon className="about-polaroid-back-icon" />
                    Made to order
                  </span>
                </div>
              </div>
            </div>

            <div className="about-badge">
              <span className="about-badge-num">4.9</span>
              <span>
                Google
                <br />
                Rating
              </span>
            </div>
          </div>

          <div
            className={`about-founder ${leftIn ? 'in-view' : ''}`}
            onMouseMove={onFounderMove}
            onMouseLeave={onFounderLeave}
          >
            <img className="about-founder-img" src={FOUNDER_IMG} alt="Our team at Grand Restaurant & Cafe" loading="lazy" />
            <div className="about-founder-body">
              <p className="about-founder-quote">
                &ldquo;Good Food. Good Mood. Great Memories. — that is the promise behind every plate we serve.&rdquo;
              </p>
              <p className="about-founder-name">
                Our Team
                <span>Grand Restaurant &amp; Cafe</span>
              </p>
            </div>
          </div>
        </div>

        <div className={`about-text reveal reveal-right ${rightIn ? 'in-view' : ''}`} ref={rightRef}>
          <span className="kicker">our story</span>
          <h2 className="section-title">A Table That Feels Like Home</h2>
          <blockquote className="about-quote">
            Good food should be warm, generous and shared.
          </blockquote>
          <p className="about-para">
            Grand Restaurant &amp; Cafe brings together fresh cooking, handcrafted drinks and warm
            hospitality under one roof — a place in Lucknow where{' '}
            <mark className="about-hl">every meal feels like a celebration</mark>.
          </p>

          <a href="#menu" className="btn btn-primary about-btn">
            Taste Our Menu
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          <ul className="about-list">
            {LIST.map((item, i) => (
              <li
                className={`about-list-item ${rightIn ? 'in-view' : ''}`}
                style={{ '--d': `${0.1 + i * 0.12}s` }}
                key={item}
              >
                <BeanIcon className="about-list-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="about-timeline" ref={timelineRef}>
            <span className="about-timeline-track" aria-hidden="true"></span>
            <span
              className="about-timeline-fill"
              style={{ transform: `scaleX(${tlFill})` }}
              aria-hidden="true"
            ></span>
            {TIMELINE.map((t, i) => (
              <div
                className={`about-timeline-item ${rightIn ? 'in-view' : ''}`}
                style={{ '--d': `${i * 0.12}s` }}
                key={t.year}
              >
                <span className="about-timeline-dot" aria-hidden="true"></span>
                <span className="about-timeline-year">{t.year}</span>
                <span className="about-timeline-text">{t.text}</span>
              </div>
            ))}
          </div>

          <div className={`about-stats ${statsIn ? 'about-stats-in' : ''}`} ref={statsRef}>
            {STATS.map((s, i) => (
              <StatChip key={s.label} value={s.value} suffix={s.suffix} label={s.label} inView={statsIn} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="about-marquee" aria-hidden="true">
        <div className="about-marquee-track">
          {[0, 1].map((k) => (
            <span className="about-marquee-group" key={k}>
              {MARQUEE_WORDS.map((w) => (
                <span className="about-marquee-item" key={w}>
                  <BeanIcon className="about-marquee-bean" />
                  {w}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line"></span>
        <BeanIcon className="about-divider-icon" />
        <span className="about-divider-line"></span>
      </div>
    </section>
  );
}
