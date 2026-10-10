import { useEffect, useRef, useState } from 'react';
import './Stats.css';

const stats = [
  { value: 12, suffix: '+', label: 'Years of Brewing', icon: 'cup', dots: 12 },
  { value: 40, suffix: '+', label: 'Drinks on Menu', icon: 'menu', dots: 8 },
  { value: 25, suffix: 'K+', label: 'Happy Sips Served', icon: 'smile', dots: 8 },
  { value: 4.9, suffix: '', label: 'Average Rating', icon: 'star', decimals: 1, dots: 5 },
];

const ICONS = {
  cup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 4.2c0 1.1-1.2 1.3-1.2 2.4M12 3.8c0 1.1-1.2 1.3-1.2 2.4" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8.5 6h11M8.5 12h11M8.5 18h11" />
      <circle cx="4.6" cy="6" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="4.6" cy="12" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="4.6" cy="18" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  ),
  smile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.4 13.8a4.6 4.6 0 0 0 7.2 0" />
      <circle cx="9.2" cy="9.6" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="9.6" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.85z" />
    </svg>
  ),
};

function useCountProgress(target, runKey, duration = 1800) {
  const [p, setP] = useState(0);

  useEffect(() => {
    if (!runKey) return;
    setP(0);
    let raf;
    let t0 = null;
    const tick = (ts) => {
      if (t0 === null) t0 = ts;
      const prog = Math.min((ts - t0) / duration, 1);
      setP(1 - Math.pow(1 - prog, 3));
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [runKey, duration]);

  return p;
}

function useRepeatInView(options = {}) {
  const ref = useRef(null);
  const [runKey, setRunKey] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setRunKey(1);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setVisible(isVisible);
        if (isVisible) setRunKey((k) => k + 1);
      },
      { threshold: options.threshold ?? 0.35, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, runKey, visible];
}

function Ring({ p }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <span className="stat-ring-wrap" aria-hidden="true">
      <svg className="stat-ring" viewBox="0 0 120 120">
        <circle className="stat-ring-bg" cx="60" cy="60" r={r} />
        <circle
          className="stat-ring-fill"
          cx="60"
          cy="60"
          r={r}
          style={{ strokeDasharray: c, strokeDashoffset: c * (1 - p) }}
        />
      </svg>
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Odometer({ value }) {
  const chars = String(value).split('');
  return (
    <span className="stat-odo">
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="stat-odo-digit" key={i} style={{ '--n': Number(ch) }}>
            <span className="stat-odo-slide">
              <span className="stat-odo-drum">
                {DIGITS.map((d) => (
                  <span className="stat-odo-cell" key={d}>
                    {d}
                  </span>
                ))}
              </span>
            </span>
          </span>
        ) : (
          <span className="stat-odo-plain" key={i}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

function Stat({ stat, runKey, index }) {
  const p = useCountProgress(stat.value, runKey);
  const display = stat.decimals ? (stat.value * p).toFixed(stat.decimals) : Math.round(stat.value * p);
  const filled = Math.round(p * stat.dots);

  return (
    <div className="stat" style={{ '--d': `${index * 0.12}s`, '--i': index }}>
      <div className="stat-head">
        <Ring p={p} />
        <span className="stat-icon">{ICONS[stat.icon]}</span>
        <span className="stat-num">
          <Odometer value={display} />
          <span className="stat-suffix">{stat.suffix}</span>
        </span>
      </div>
      <span className="stat-label">{stat.label}</span>
      <span className="stat-dots" aria-hidden="true">
        {Array.from({ length: stat.dots }, (_, i) => (
          <span key={i} className={i < filled ? 'on' : ''} style={{ '--i': i }}></span>
        ))}
      </span>
    </div>
  );
}

export default function Stats() {
  const [ref, runKey, visible] = useRepeatInView({ threshold: 0.35 });
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (visible) setEntered(true);
  }, [visible]);

  return (
    <section className="stats" aria-label="The Cocoa Bean in numbers">
      <div className="container">
        <div className={`stats-inner ${entered ? 'stats-in-view' : ''}`} ref={ref}>
          <span className="kicker stats-kicker">the numbers say it</span>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <Stat key={s.label} stat={s} runKey={runKey} index={i} />
            ))}
          </div>
        </div>
      </div>

      <svg className="stats-curve" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path className="stats-curve-fill" d="M0,0 C220,46 460,64 730,50 C1010,35 1230,44 1440,14 L1440,70 L0,70 Z" />
        <path
          className="stats-curve-line"
          d="M0,0 C220,46 460,64 730,50 C1010,35 1230,44 1440,14"
        />
      </svg>
    </section>
  );
}
