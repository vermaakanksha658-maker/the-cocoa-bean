import { useEffect, useRef, useState } from 'react';
import './Hero.css';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1670523685691-c1f01daa090b?fm=jpg&q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?fm=jpg&q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?fm=jpg&q=80&w=1920&auto=format&fit=crop',
];

const ROTATE_WORDS = ['Warm', 'Cozy', 'Sweet', 'Golden', 'Velvet'];
const PARTICLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 22) return 'Good Evening';
  return 'Welcome';
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function Saucer() {
  return (
    <svg viewBox="0 0 140 150" fill="none" aria-hidden="true">
      <ellipse cx="70" cy="126" rx="40" ry="8" stroke="#C9A227" strokeWidth="2.4" fill="rgba(201,162,39,0.08)" />
      <path d="M30 122h80" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function CupBody() {
  return (
    <svg viewBox="0 0 140 150" fill="none" aria-hidden="true">
      <path
        d="M44 62h56v40a28 28 0 0 1-28 28 28 28 0 0 1-28-28z"
        fill="rgba(255,250,244,0.1)"
        stroke="#C9A227"
        strokeWidth="2.6"
      />
      <path d="M100 72h10a11 11 0 0 1 0 22h-9" stroke="#C9A227" strokeWidth="2.6" />
      <path d="M108 50v-7M95 50v-6M121 50v-6" stroke="#A9714B" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="72" cy="82" rx="20" ry="9" stroke="#C9A227" strokeWidth="2" fill="rgba(169,113,75,0.4)" />
      <path d="M62 80c4-3 10-3 14 0-3 3-11 3-14 0z" stroke="#C9A227" strokeWidth="1.4" opacity="0.8" />
    </svg>
  );
}

function CupSteam() {
  return (
    <svg viewBox="0 0 140 150" fill="none" aria-hidden="true">
      <g className="steam steam-1">
        <path d="M64 58c-5-9 5-11 0-22M84 62c-5-9 5-11 0-22" stroke="#E7D3C1" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="steam steam-2">
        <path d="M72 46c-4-8 4-9 0-18M91 50c-4-8 4-9 0-18" stroke="#E7D3C1" strokeWidth="2.6" strokeLinecap="round" opacity="0.75" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [bgIdx, setBgIdx] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATE_WORDS.length);
        setFading(false);
      }, 450);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slideshow = setInterval(() => setBgIdx((i) => (i + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(slideshow);
  }, []);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onScrollTop = () => setAtTop(window.scrollY < 30);
    window.addEventListener('scroll', onScrollTop, { passive: true });

    if (prefersReducedMotion()) {
      el.style.setProperty('--sd', '0');
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
      return () => window.removeEventListener('scroll', onScrollTop);
    }

    let raf = null;

    const updateScroll = () => {
      raf = null;
      const h = window.innerHeight || 1;
      const d = Math.min(Math.max(window.scrollY / h, 0), 1);
      el.style.setProperty('--sd', d.toFixed(4));
    };

    const onScrollMove = () => {
      if (raf) return;
      raf = requestAnimationFrame(updateScroll);
    };

    const onMouseMove = (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--mx', mx.toFixed(4));
      el.style.setProperty('--my', my.toFixed(4));
    };

    const onMouseLeave = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };

    window.addEventListener('scroll', onScrollMove, { passive: true });
    window.addEventListener('resize', onScrollMove);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    updateScroll();

    return () => {
      window.removeEventListener('scroll', onScrollMove);
      window.removeEventListener('scroll', onScrollTop);
      window.removeEventListener('resize', onScrollMove);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header id="home" className="hero" ref={heroRef}>
      <div className="hero-bg-wrap" aria-hidden="true">
        {BG_IMAGES.map((url, i) => (
          <div
            key={url}
            className={`hero-bg ${i === bgIdx ? 'is-active' : ''}`}
            style={{ backgroundImage: `url(${url})` }}
          ></div>
        ))}
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-fx" aria-hidden="true">
        {PARTICLES.map((n) => (
          <span key={n} style={{ '--i': n }}></span>
        ))}
      </div>

      <div className="hero-content container">
        <span className="hero-script hero-anim-1">
          {getGreeting()} &middot; freshly brewed, with love
        </span>
        <h1 className="hero-title">
          <span className="hero-line hero-anim-2">
            <span className="hero-word" style={{ '--w': 0 }}>
              Rich
            </span>{' '}
            <span className="hero-word" style={{ '--w': 1 }}>
              Coffee,
            </span>
          </span>
          <span className="hero-line hero-anim-3">
            <em
              className={`hero-rotate ${fading ? 'hero-word-out' : ''}`}
              key={wordIdx}
            >
              {ROTATE_WORDS[wordIdx]}
            </em>{' '}
            Moments
          </span>
        </h1>
        <p className="hero-sub hero-anim-4">
          Slow-roasted single-origin beans, handcrafted drinks and cozy corners — brewed daily at{' '}
          <strong>The Cocoa Bean</strong>.
        </p>
        <div className="hero-cta hero-anim-5">
          <a href="#menu" className="btn btn-primary">
            Explore Menu
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a href="#reserve" className="btn btn-outline">
            Reserve a Table
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </a>
        </div>
        <div className="hero-trust hero-anim-6">
          <span className="hero-stars" aria-hidden="true">★★★★★</span>
          <span>4.9 &middot; 200+ Google Reviews</span>
          <span className="hero-trust-dot">&middot;</span>
          <span>Fresh Daily</span>
        </div>
      </div>

      <div className="hero-cup-parallax" aria-hidden="true">
        <div className="hero-cup">
          <span className="hero-halo"></span>
          <div className="hero-cup-tilt">
            <span className="hero-cup-layer hero-cup-saucer">
              <Saucer />
            </span>
            <span className="hero-cup-layer hero-cup-body">
              <CupBody />
            </span>
            <span className="hero-cup-layer hero-cup-steam">
              <CupSteam />
            </span>
          </div>
          <span className="hero-chip">
            <span className="hero-chip-dot"></span>
            Open Today &middot; 8 AM – 8 PM
          </span>
        </div>
      </div>

      <span className="hero-stamp" aria-hidden="true">
        <span className="hero-stamp-over">new</span>
        <span className="hero-stamp-main">Coffee Club</span>
      </span>

      <a href="#story" className={`hero-scroll ${atTop ? 'is-shown' : ''}`} aria-label="Scroll down">
        <span></span>
      </a>
    </header>
  );
}
