import { useCallback, useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView.js';
import './Gallery.css';

const shots = [
  {
    src: 'https://images.unsplash.com/photo-1777451441095-c7ef2f875929?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Plant-filled corners',
    tag: 'Cozy',
  },
  {
    src: 'https://images.unsplash.com/photo-1752757257738-9a4f136b3f87?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Wooden warmth',
    tag: 'Cozy',
  },
  {
    src: 'https://images.unsplash.com/photo-1770123024494-776bc2d3836b?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Poured with love',
    tag: 'Coffee',
  },
  {
    src: 'https://images.unsplash.com/photo-1769138885118-c1261518414d?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Breakfast moments',
    tag: 'Food',
  },
  {
    src: 'https://images.unsplash.com/photo-1759566926659-b1a9ec89cc82?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Golden pastries',
    tag: 'Pastries',
  },
  {
    src: 'https://images.unsplash.com/photo-1757010055832-de355d2f8f06?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Warm lighting',
    tag: 'Coffee',
  },
];

const TAGS = ['All', 'Cozy', 'Coffee', 'Pastries', 'Food'];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

function SocialIcon({ kind }) {
  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 8.5V6.8c0-.8.5-1.3 1.4-1.3H17.5V2.6h-2.4c-2.5 0-4 1.5-4 4v1.9H8.5v3h2.6v9.9h3.4v-9.9h2.7l.6-3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" />
    </svg>
  );
}

function Lightbox({ shots: list, index, onClose, onStep }) {
  const item = list[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'ArrowRight') onStep(1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onStep]);

  return (
    <div className="lb-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${item.caption} — image ${index + 1} of ${list.length}`}>
      <div className="lb-shell" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose} aria-label="Close gallery viewer">
          <CloseIcon />
        </button>

        <figure className="lb-figure">
          <img src={item.src} alt={item.caption} />
          <figcaption>
            <span className="lb-index">
              {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
            </span>
            <span className="lb-caption">{item.caption}</span>
            <span className="lb-tag">{item.tag}</span>
          </figcaption>
        </figure>

        {list.length > 1 && (
          <>
            <button className="lb-arrow lb-prev" onClick={() => onStep(-1)} aria-label="Previous image">
              <Chevron dir="prev" />
            </button>
            <button className="lb-arrow lb-next" onClick={() => onStep(1)} aria-label="Next image">
              <Chevron dir="next" />
            </button>

            <div className="lb-dots">
              {list.map((s, i) => (
                <button
                  key={s.src}
                  className={`lb-dot ${i === index ? 'lb-dot-active' : ''}`}
                  onClick={() => onStep(i - index)}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Gallery() {
  const [headRef, headIn] = useInView();
  const [stripRef, stripIn] = useInView();
  const [tag, setTag] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [loaded, setLoaded] = useState({});
  const [dragging, setDragging] = useState(false);
  const elRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const visible = tag === 'All' ? shots : shots.filter((s) => s.tag === tag);

  useEffect(() => {
    if (lightbox !== null && lightbox >= visible.length) setLightbox(visible.length - 1);
  }, [visible.length, lightbox]);

  const markLoaded = (src) => setLoaded((p) => (p[src] ? p : { ...p, [src]: true }));

  const openLightbox = (i) => {
    if (drag.current.moved > 8) return;
    setLightbox(i);
  };

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const step = useCallback(
    (n) => {
      setLightbox((i) => {
        if (i === null) return i;
        const len = visible.length;
        return (i + n + len) % len;
      });
    },
    [visible.length]
  );

  const onPointerDown = (e) => {
    const el = elRef.current;
    if (!el || e.pointerType === 'touch') return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    const el = elRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.abs(dx);
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
    setDragging(false);
  };

  const onMove = (e) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--px', `${(px - 0.5) * 16}px`);
    card.style.setProperty('--py', `${(py - 0.5) * 16}px`);
  };

  const onLeaveCard = (e) => {
    e.currentTarget.style.setProperty('--px', '0px');
    e.currentTarget.style.setProperty('--py', '0px');
  };

  const onStripScroll = () => {
    const el = elRef.current;
    if (!el || window.innerWidth >= 1000) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = null;
    let bestD = Infinity;
    Array.from(el.children).forEach((child) => {
      const c = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestD) {
        bestD = d;
        best = child;
      }
    });
    Array.from(el.children).forEach((child) => child.classList.toggle('is-center', child === best));
  };

  const nudge = (dir) => {
    const el = elRef.current;
    if (!el) return;
    const card = el.querySelector('.gallery-item');
    const amount = card ? card.getBoundingClientRect().width + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="section-pad gallery" aria-label="Cafe gallery">
      <div className="container">
        <div className={`section-head reveal ${headIn ? 'in-view' : ''}`} ref={headRef}>
          <span className="kicker">a peek inside</span>
          <h2 className="section-title">Moments at The Cocoa Bean</h2>
          <div className="divider"></div>
        </div>

        <div className="gallery-chips" role="group" aria-label="Filter gallery">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={`gallery-chip ${tag === t ? 'gallery-chip-active' : ''}`}
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-frame">
        <div
          className={`gallery-strip ${stripIn ? 'gallery-in' : ''} ${dragging ? 'is-dragging' : ''}`}
          ref={(el) => {
            elRef.current = el;
            stripRef.current = el;
          }}
          onScroll={onStripScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {visible.map((s, i) => (
            <figure
              className={`gallery-item ${loaded[s.src] ? 'is-loaded' : ''}`}
              key={s.src}
              onMouseMove={onMove}
              onMouseLeave={onLeaveCard}
            >
              <span className="gallery-tag">{s.tag}</span>
              <img
                src={s.src}
                alt={s.caption}
                loading="lazy"
                decoding="async"
                onLoad={() => markLoaded(s.src)}
                onClick={() => openLightbox(i)}
              />
              <figcaption>
                <span>{String(shots.indexOf(s) + 1).padStart(2, '0')}</span>
                {s.caption}
              </figcaption>
              <button
                type="button"
                className="gallery-zoom"
                onClick={() => openLightbox(i)}
                aria-label={`Open ${s.caption} full screen`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                </svg>
              </button>
            </figure>
          ))}
        </div>

        <div className="gallery-controls">
          <button className="gallery-rail gallery-rail-prev" onClick={() => nudge(-1)} aria-label="Scroll gallery left">
            <Chevron dir="prev" />
          </button>
          <span className="gallery-hint">Swipe or drag</span>
          <button className="gallery-rail gallery-rail-next" onClick={() => nudge(1)} aria-label="Scroll gallery right">
            <Chevron dir="next" />
          </button>
        </div>
      </div>

      <div className="container">
        <div className="gallery-social">
          <span className="gallery-handle">@thecocoabean</span>
          <span className="gallery-note">Tag us in your cup — we repost our favourites</span>
          <span className="gallery-links">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <SocialIcon kind="instagram" />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <SocialIcon kind="facebook" />
            </a>
            <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
              <SocialIcon kind="x" />
            </a>
          </span>
        </div>
      </div>

      {lightbox !== null && visible[lightbox] && (
        <Lightbox shots={visible} index={lightbox} onClose={closeLightbox} onStep={step} />
      )}
    </section>
  );
}
