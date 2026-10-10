import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useInView from '../hooks/useInView.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import './MenuPanel.css';

const categories = [
  {
    label: 'All',
    value: 'all',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="6" cy="6" r="1.6" />
        <circle cx="12" cy="6" r="1.6" />
        <circle cx="18" cy="6" r="1.6" />
        <circle cx="6" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="18" cy="12" r="1.6" />
        <circle cx="6" cy="18" r="1.6" />
        <circle cx="12" cy="18" r="1.6" />
        <circle cx="18" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    label: 'Coffee',
    value: 'coffee',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
        <path d="M17 9h1.8a2.7 2.7 0 0 1 0 5.4H17" />
        <path d="M8 4.6c0 1-.9 1.1-.9 2M12 4.4c0 1-.9 1.1-.9 2" />
      </svg>
    ),
  },
  {
    label: 'Tea',
    value: 'tea',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
        <path d="M17 10h1.5a2.3 2.3 0 0 1 0 4.6H17" />
        <path d="M12 3v3M9 4.4l1 1.8M15 4.4l-1 1.8" />
      </svg>
    ),
  },
  {
    label: 'Bakes',
    value: 'bakes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15c1.5-3 4-4.6 7-4.6S16.5 12 18 15v3H3z" />
        <path d="M7 10.4c1-2 2.6-3.2 4.5-3.2M14.6 6.2c1.6.5 2.8 1.8 3.4 3.4" />
        <path d="M8 18v1.6M12 18v1.6M16 18v1.6" />
      </svg>
    ),
  },
  {
    label: 'Food',
    value: 'food',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8z" />
        <path d="M9 7.5c0-1.5 1.5-1.6 1.5-3M13.5 7.5c0-1.5 1.5-1.6 1.5-3" />
        <path d="M2 21h20" />
      </svg>
    ),
  },
  {
    label: 'Cold',
    value: 'cold',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10l-1.2 14a2.6 2.6 0 0 1-2.6 2.4h-2.4A2.6 2.6 0 0 1 8.2 18z" />
        <path d="M7.6 10h8.8" />
        <path d="M14 4l3.5-1.6" />
      </svg>
    ),
  },
];

const SORTS = [
  { key: 'default', label: 'Featured' },
  { key: 'low', label: 'Price: Low to High' },
  { key: 'high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
];

const VIEW_KEY = 'cocoa-menu-view';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
}

function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <span className="menu-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'menu-star-on' : 'menu-star-off'}>
          <Star filled={n <= rating} />
        </span>
      ))}
    </span>
  );
}

function MenuThumb({ item }) {
  if (item.image) return <img src={item.image} alt={item.name} loading="lazy" decoding="async" />;
  return (
    <div className="menu-img-fallback">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    </div>
  );
}

function EmptyArt() {
  return (
    <svg className="menu-empty-art" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="104" rx="34" ry="6" fill="rgba(43,26,18,0.08)" />
      <path d="M32 56h56v26a22 22 0 0 1-22 22H54a22 22 0 0 1-22-22z" stroke="currentColor" strokeWidth="3" />
      <path d="M88 64h7a9 9 0 0 1 0 18h-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M50 46c-5-6 4-8-1-15M66 44c-5-6 4-8-1-15" />
      </g>
      <circle cx="60" cy="70" r="9" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

function ViewModal({ item, rating, reviews, onClose, onReview }) {
  const { add } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const addToCart = () => {
    add(item, qty);
    toast.push(`${item.name} added to your order.`);
  };

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submitReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItem: item._id,
          name: form.name.trim(),
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not submit your review.');
      setForm({ name: '', rating: 5, comment: '' });
      onReview(data);
      toast.push('Thanks! Your review will go live once we approve it.', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const itemReviews = reviews.filter((r) => r.menuItem === item._id);

  return (
    <div className="qv-overlay" onClick={onClose}>
      <div className="qv-card" role="dialog" aria-modal="true" aria-label={`${item.name} details`} onClick={(e) => e.stopPropagation()}>
        <button className="qv-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="qv-top">
          <div className="qv-img">
            <MenuThumb item={item} />
            {item.tag && <span className="menu-tag">{item.tag}</span>}
          </div>
          <div className="qv-head">
            <span className="qv-category">{item.category}</span>
            <h3>{item.name}</h3>
            {rating.count > 0 && (
              <div className="qv-rating">
                <Stars rating={Math.round(rating.avg)} />
                <span className="qv-rating-text">
                  {rating.avg.toFixed(1)} · {rating.count} review{rating.count === 1 ? '' : 's'}
                </span>
              </div>
            )}
            <p className="qv-desc">{item.description}</p>
            <div className="qv-price">₹{item.price}</div>

            <div className="qv-actions">
              <div className="qv-qty">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty((n) => Math.min(99, n + 1))} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-primary qv-add" onClick={addToCart}>
                Add to order · ₹{item.price * qty}
              </button>
            </div>
          </div>
        </div>

        <div className="qv-reviews">
          <h4>
            Reviews
            {rating.count > 0 && <span className="qv-reviews-count"> ({rating.count})</span>}
          </h4>

          {itemReviews.length === 0 && (
            <p className="qv-no-reviews">No reviews yet — be the first to share your taste.</p>
          )}
          {itemReviews.length > 0 && (
            <ul className="qv-review-list">
              {itemReviews.map((r) => (
                <li key={r._id}>
                  <div className="qv-review-head">
                    <strong>{r.name}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}

          <form className="qv-review-form" onSubmit={submitReview}>
            <h5>Leave a review</h5>
            <div className="qv-review-row">
              <label>
                <span>Name</span>
                <input type="text" required value={form.name} onChange={setField('name')} placeholder="Your name" />
              </label>
              <label>
                <span>Rating</span>
                <select value={form.rating} onChange={setField('rating')}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option value={n} key={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>Your thoughts</span>
              <textarea rows="3" value={form.comment} onChange={setField('comment')} placeholder="How was it? (optional)" />
            </label>
            {error && <p className="qv-error">{error}</p>}
            <button type="submit" className="btn btn-ghost qv-review-btn" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MenuPanel({ variant = 'full', limit = 6 }) {
  const isPreview = variant === 'preview';
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('default');
  const [view, setView] = useState(readView);
  const [viewing, setViewing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tried, setTried] = useState(0);
  const [pickIdx, setPickIdx] = useState(0);
  const [pickHover, setPickHover] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const addedTimer = useRef(null);
  const [ref, inView] = useInView();
  const { add } = useCart();
  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable */
    }
  }, [view]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const load = useCallback(() => {
    let cancelled = false;
    setState('loading');
    Promise.all([
      fetch('/api/menu').then((res) => {
        if (!res.ok) throw new Error('Failed to load menu');
        return res.json();
      }),
      fetch('/api/reviews').then((res) => (res.ok ? res.json() : [])).catch(() => []),
    ])
      .then(([menu, rev]) => {
        if (!cancelled) {
          setItems(menu);
          setReviews(rev);
          setState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (state !== 'error' || tried >= 3) return;
    const id = setTimeout(() => {
      setTried((t) => t + 1);
      loadRef.current();
    }, 3000);
    return () => clearTimeout(id);
  }, [state, tried]);

  useEffect(() => {
    const onFocus = () => {
      if (state !== 'error') return;
      setTried(0);
      loadRef.current();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [state]);

  const retry = () => {
    setTried(0);
    loadRef.current();
  };

  const ratingFor = (id) => {
    const list = reviews.filter((r) => r.menuItem === id);
    if (list.length === 0) return { avg: 0, count: 0 };
    return { avg: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length };
  };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = needle || tab === 'all' ? items : items.filter((i) => i.category === tab);
    if (needle) {
      rows = rows.filter(
        (i) => i.name.toLowerCase().includes(needle) || (i.description || '').toLowerCase().includes(needle)
      );
    }
    if (sort === 'low') rows = [...rows].sort((a, b) => a.price - b.price);
    else if (sort === 'high') rows = [...rows].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') rows = [...rows].sort((a, b) => ratingFor(b._id).avg - ratingFor(a._id).avg);
    if (isPreview) rows = rows.slice(0, limit);
    return rows;
  }, [items, tab, q, sort, reviews, isPreview, limit]);

  const picks = useMemo(() => {
    const names = ['Golden Mocha', 'Royal Masala Chai', 'Pearl Milk Tea'];
    const found = names.map((n) => items.find((i) => i.name === n)).filter(Boolean);
    return found.length > 0 ? found : items.slice(0, 3);
  }, [items]);

  const pick = picks[Math.min(pickIdx, Math.max(picks.length - 1, 0))];

  useEffect(() => {
    if (picks.length < 2 || pickHover) return;
    const id = setTimeout(() => setPickIdx((i) => (i + 1) % picks.length), 4500);
    return () => clearTimeout(id);
  }, [picks, pickHover, pickIdx]);

  useEffect(() => {
    if (pickIdx >= picks.length) setPickIdx(0);
  }, [picks, pickIdx]);

  const gotoPick = (n) => {
    if (picks.length < 2) return;
    setPickIdx(((n % picks.length) + picks.length) % picks.length);
  };

  const countFor = (cat) => items.filter((i) => i.category === cat).length;

  const flyToCart = (item, fromEl) => {
    if (prefersReducedMotion() || !fromEl) return;
    const targetEl = document.querySelector('.cart-toggle');
    if (!targetEl) return;
    const from = fromEl.getBoundingClientRect();
    const to = targetEl.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'fly-ghost';
    if (item.image) {
      ghost.style.backgroundImage = `url(${item.image})`;
    } else {
      ghost.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="1.6" style="width:26px;height:26px;margin:11px"><ellipse cx="12" cy="12" rx="6.5" ry="9.5" transform="rotate(-18 12 12)"/><path d="M9.5 3.8c3.1 4.1 3.1 12.3 5.1 16.4" stroke-linecap="round"/></svg>';
    }
    ghost.style.transform = `translate(${from.left + from.width / 2 - 26}px, ${from.top + from.height / 2 - 26}px) scale(1)`;
    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${to.left + to.width / 2 - 26}px, ${to.top + to.height / 2 - 26}px) scale(0.14)`;
      ghost.style.opacity = '0.25';
    });
    setTimeout(() => ghost.remove(), 780);
  };

  const addOne = (item, fromEl) => {
    add(item, 1);
    toast.push(`${item.name} added to your order.`);
    flyToCart(item, fromEl || null);
    setAddedId(item._id);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAddedId(null), 1300);
  };

  const onAddClick = (item, e) => {
    const holder = e.currentTarget.closest('.meal-row, .menu-card');
    const img = holder ? holder.querySelector('img') : null;
    addOne(item, img);
  };

  const onSpotMove = (e) => {
    if (prefersReducedMotion()) return;
    const spot = e.currentTarget;
    const r = spot.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    spot.style.setProperty('--ry', `${(px - 0.5) * 6}deg`);
    spot.style.setProperty('--rx', `${(0.5 - py) * 5}deg`);
    spot.style.setProperty('--mx', px.toFixed(3));
    spot.style.setProperty('--my', py.toFixed(3));
  };

  const onSpotLeave = (e) => {
    const spot = e.currentTarget;
    spot.style.setProperty('--rx', '0deg');
    spot.style.setProperty('--ry', '0deg');
    spot.style.setProperty('--mx', '0.5');
    spot.style.setProperty('--my', '0.5');
  };

  const onListMove = (e) => {
    if (prefersReducedMotion()) return;
    const row = e.target.closest('.meal-row, .menu-card');
    if (!row) return;
    const r = row.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    row.style.setProperty('--ry', `${(px - 0.5) * 4}deg`);
    row.style.setProperty('--rx', `${(0.5 - py) * 3}deg`);
  };

  const onListLeave = (e) => {
    e.currentTarget.querySelectorAll('.meal-row, .menu-card').forEach((el) => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  };

  const suggestions = useMemo(() => {
    const words = new Set();
    items.forEach((i) => {
      const first = (i.name || '').split(/\s+/)[0];
      if (first && first.length > 2) words.add(first);
    });
    const needle = q.trim().toLowerCase();
    return [...words].filter((w) => w.toLowerCase() !== needle).slice(0, 5);
  }, [items, q]);

  const hasSearch = q.trim() !== '';
  const listKey = `${tab}|${q}|${sort}|${view}`;

  return (
    <section id="menu" className="section-pad menu-section">
      <div className="container">
        {isPreview && (
          <div className={`section-head reveal ${inView ? 'in-view' : ''}`} ref={ref}>
            <span className="kicker">what we pour</span>
            <h2 className="section-title">Featured From the Menu</h2>
            <div className="divider"></div>
          </div>
        )}

        {state === 'ready' && pick && (
          <div
            className="spot"
            onMouseEnter={() => setPickHover(true)}
            onMouseLeave={(e) => {
              setPickHover(false);
              onSpotLeave(e);
            }}
            onMouseMove={onSpotMove}
          >
            <div className="spot-media">
              <MenuThumb item={pick} />
              {pick.tag && <span className="menu-tag">{pick.tag}</span>}
              {picks.length > 1 && (
                <>
                  <button className="spot-arrow spot-prev" onClick={() => gotoPick(pickIdx - 1)} aria-label="Previous pick">
                    ‹
                  </button>
                  <button className="spot-arrow spot-next" onClick={() => gotoPick(pickIdx + 1)} aria-label="Next pick">
                    ›
                  </button>
                </>
              )}
              {picks.length > 1 && (
                <span className="spot-progress" key={pick._id} aria-hidden="true">
                  <span className="spot-progress-bar"></span>
                </span>
              )}
            </div>
            <div className="spot-body" key={pick._id}>
              <span className="spot-kicker">
                Barista&apos;s Pick
                {picks.length > 1 && <em className="spot-index">0{pickIdx + 1} / 0{picks.length}</em>}
              </span>
              <h3>{pick.name}</h3>
              {ratingFor(pick._id).count > 0 && (
                <div className="spot-rating">
                  <Stars rating={Math.round(ratingFor(pick._id).avg)} />
                  <span>
                    {ratingFor(pick._id).count} review{ratingFor(pick._id).count === 1 ? '' : 's'}
                  </span>
                </div>
              )}
              <p className="spot-desc">{pick.description}</p>
              <span className="spot-price">₹{pick.price}</span>
              <div className="spot-actions">
                <button type="button" className="btn btn-primary" onClick={() => addOne(pick)}>
                  Add to order
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setViewing(pick)}>
                  Quick view
                </button>
              </div>
              {picks.length > 1 && (
                <div className="spot-dots">
                  {picks.map((p, i) => (
                    <button
                      key={p._id}
                      className={`spot-dot ${i === pickIdx ? 'spot-dot-active' : ''}`}
                      onClick={() => setPickIdx(i)}
                      aria-label={`Show ${p.name}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="menu-layout">
          <nav className="meal-nav" aria-label="Menu categories">
            <span className="meal-nav-title">Menu</span>
            {categories.map((c) => (
              <button
                key={c.value}
                className={`meal-nav-link ${tab === c.value ? 'menu-tab-active' : ''}`}
                onClick={() => setTab(c.value)}
              >
                <span className="meal-nav-icon" aria-hidden="true">
                  {c.icon}
                </span>
                <span className="meal-nav-label">{c.label}</span>
                <span className="meal-nav-count">{c.value === 'all' ? items.length : countFor(c.value)}</span>
              </button>
            ))}
          </nav>

          <div className="menu-content">
            {!isPreview && state === 'ready' && items.length > 0 && (
              <div className="menu-toolbar">
                <div className="menu-search">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search the menu…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Search the menu"
                  />
                </div>
                <label className="menu-sort">
                  <span>Sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort menu items">
                    {SORTS.map((s) => (
                      <option value={s.key} key={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="menu-view" role="group" aria-label="Menu layout">
                  <button
                    type="button"
                    className={`menu-view-btn ${view === 'list' ? 'menu-view-active' : ''}`}
                    onClick={() => setView('list')}
                    aria-pressed={view === 'list'}
                    aria-label="List view"
                    title="List view"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d="M9 6h11M9 12h11M9 18h11" />
                      <circle cx="5" cy="6" r="1.3" fill="currentColor" stroke="none" />
                      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
                      <circle cx="5" cy="18" r="1.3" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`menu-view-btn ${view === 'grid' ? 'menu-view-active' : ''}`}
                    onClick={() => setView('grid')}
                    aria-pressed={view === 'grid'}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
                      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
                      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
                      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {state === 'loading' && (
              <>
                <span className="menu-sr">Loading the menu…</span>
                <ul className="menu-list menu-skeleton" aria-hidden="true">
                  {Array.from({ length: isPreview ? Math.min(limit, 4) : 6 }).map((_, i) => (
                    <li className="meal-row skeleton-row" key={i}>
                      <span className="skeleton-thumb"></span>
                      <span className="skeleton-lines">
                        <span className="skeleton-line skeleton-line-1"></span>
                        <span className="skeleton-line skeleton-line-2"></span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {state === 'error' && (
              <div className="menu-status menu-status-error">
                <span>The menu is temporarily unavailable — please try again later.</span>
                <button type="button" className="btn btn-ghost menu-retry" onClick={retry}>
                  Retry
                </button>
              </div>
            )}

            {state === 'ready' && visible.length > 0 && view === 'grid' && (
              <ul className="menu-grid" key={`grid-${listKey}`} onMouseMove={onListMove} onMouseLeave={onListLeave}>
                {visible.map((item, i) => {
                  const rating = ratingFor(item._id);
                  return (
                    <li className="menu-card" key={item._id} style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}>
                      <button
                        type="button"
                        className="menu-card-media"
                        onClick={() => setViewing(item)}
                        aria-label={`View ${item.name}`}
                      >
                        <MenuThumb item={item} />
                        {item.tag && <span className="menu-tag">{item.tag}</span>}
                      </button>
                      <div className="menu-card-body">
                        <span className="menu-card-name">
                          <h3>{item.name}</h3>
                          {rating.count > 0 && (
                            <span className="meal-rating">
                              <Stars rating={Math.round(rating.avg)} />
                              <span>({rating.count})</span>
                            </span>
                          )}
                        </span>
                        <span className="menu-card-desc">{item.description}</span>
                        <span className="menu-card-foot">
                          <span className="meal-price">₹{item.price}</span>
                          <button
                            type="button"
                            className={`meal-add ${addedId === item._id ? 'meal-add-done' : ''}`}
                            onClick={(e) => onAddClick(item, e)}
                            aria-label={`Add ${item.name} to order`}
                          >
                            {addedId === item._id ? '✓' : '+'}
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {state === 'ready' && visible.length > 0 && view === 'list' && (
              <ul className="menu-list" key={`list-${listKey}`} onMouseMove={onListMove} onMouseLeave={onListLeave}>
                {visible.map((item, i) => {
                  const rating = ratingFor(item._id);
                  return (
                    <li
                      className="meal-row"
                      key={item._id}
                      style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
                    >
                      <button
                        type="button"
                        className="meal-main"
                        onClick={() => setViewing(item)}
                        aria-label={`View ${item.name}`}
                      >
                        <span className="meal-thumb">
                          <MenuThumb item={item} />
                        </span>
                        <span className="meal-info">
                          <span className="meal-name-line">
                            <h3>{item.name}</h3>
                            {item.tag && <span className="meal-tag-pill">{item.tag}</span>}
                            {rating.count > 0 && (
                              <span className="meal-rating">
                                <Stars rating={Math.round(rating.avg)} />
                                <span>({rating.count})</span>
                              </span>
                            )}
                          </span>
                          <span className="meal-desc">{item.description}</span>
                        </span>
                      </button>
                      <span className="meal-price">₹{item.price}</span>
                      <button
                        type="button"
                        className={`meal-add ${addedId === item._id ? 'meal-add-done' : ''}`}
                        onClick={(e) => onAddClick(item, e)}
                        aria-label={`Add ${item.name} to order`}
                      >
                        {addedId === item._id ? '✓' : '+'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {state === 'ready' && visible.length === 0 && (
              <div className="menu-empty">
                <EmptyArt />
                <h4>{hasSearch ? 'Nothing matched that search' : 'This shelf is empty'}</h4>
                <p>
                  {hasSearch
                    ? 'Try a shorter word, or jump straight to one of these:'
                    : 'Try another category — something is always brewing.'}
                </p>
                {hasSearch && suggestions.length > 0 && (
                  <div className="menu-empty-chips">
                    {suggestions.map((s) => (
                      <button
                        type="button"
                        className="menu-empty-chip"
                        key={s}
                        onClick={() => setQ(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {!hasSearch && (
                  <button type="button" className="btn btn-ghost menu-empty-btn" onClick={() => setTab('all')}>
                    Show the whole menu
                  </button>
                )}
              </div>
            )}

            {isPreview && (
              <div className="menu-cta">
                <Link to="/menu" className="btn btn-ghost">
                  View Full Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewing && (
        <ViewModal
          item={viewing}
          rating={ratingFor(viewing._id)}
          reviews={reviews}
          onClose={() => setViewing(null)}
          onReview={(r) => setReviews((prev) => [...prev, r])}
        />
      )}
    </section>
  );
}
