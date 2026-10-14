import { useCallback, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  deleteMenuItem,
  getMenuItems,
  getReservations,
  getReviews,
  getStats,
  getMe,
  getOrders,
  logout,
  createMenuItem,
  updateMenuItem,
  updateOrderStatus,
  updateReservationStatus,
  updateReviewStatus,
  deleteReview,
} from './api.js';
import './Admin.css';
import { useAdminTheme } from './adminTheme.js';

const MENU_CATEGORIES = ['coffee', 'tea', 'food', 'dessert', 'beverage', 'bakes', 'cold'];

const AVAILABILITY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'unavailable', label: 'Unavailable' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  menu: 'Menu items',
  reservations: 'Reservations',
  orders: 'Orders',
  reviews: 'Reviews',
};

const INr = (n) => `₹${Number(n || 0)}`;

function formatDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function toTime12(raw) {
  if (!raw) return '—';
  const m = String(raw).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const icons = {
    coffee: (
      <>
        <path d="M4 9h14v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Z" />
        <path d="M18 11h1.5a1.5 1.5 0 0 1 0 3H18" />
        <path d="M5 21h14" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </>
    ),
    chart: (
      <>
        <path d="M3 21h18" />
        <path d="M7 16v-5" />
        <path d="M12 16V8" />
        <path d="M17 16v-3" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21c0-3 3-5 7-5s7 2 7 5" />
        <path d="M17 7a3 3 0 0 1 0 6" />
      </>
    ),
    logout: (
      <>
        <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
        <path d="M10 17 5 12l5-5" />
        <path d="M5 12h11" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    edit: (
      <>
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
        <path d="m15 5 4 4" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
    moon: (
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    ),
    cart: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </>
    ),
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    cash: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M6 12h12" />
        <path d="m6 12 4-9" />
        <path d="m12 6 3 6" />
        <path d="m12 6-3 6" />
        <path d="m5 12 3 9" />
        <path d="m19 12-2.5 7.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </>
    ),
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    command: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
      </>
    ),
    chevron: <path d="m15 18-6-6 6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    check: <path d="M20 6 9 17l-5-5" />,
    trendUp: (
      <>
        <path d="M16 7h6v6" />
        <path d="M22 7l-8.5 8.5-4-4L2 19" />
      </>
    ),
    trendFlat: <path d="M3 12h18" />,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function CountUp({ value, format = (n) => n, duration = 900 }) {
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(numeric);
  const fromRef = useRef(numeric);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduce || from === numeric) {
      fromRef.current = numeric;
      setDisplay(numeric);
      return undefined;
    }
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (numeric - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = numeric;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric, duration]);

  return <>{format(Math.round(display))}</>;
}

function Sparkline({ values }) {
  if (!values || values.length < 2) return null;
  const w = 100;
  const h = 26;
  const pad = 2;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = `M${pts.join(' L')}`;
  const area = `${line} L${w - pad} ${h} L${pad} ${h} Z`;
  return (
    <svg className="admin-stat-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="admin-stat-spark-area" d={area} fill="rgba(169, 113, 75, 0.14)" />
      <path className="admin-stat-spark-line" d={line} />
    </svg>
  );
}

function Trend({ values }) {
  if (!values || values.length < 2) return null;
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const up = last > prev;
  return (
    <span className={`admin-stat-trend ${up ? 'admin-stat-trend-up' : 'admin-stat-trend-flat'}`}>
      <Icon name={up ? 'trendUp' : 'trendFlat'} size={12} />
      {up ? 'up' : 'flat'}
    </span>
  );
}

function MiniBars({ values }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="admin-mini-bars" aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className="admin-mini-bar"
          style={{
            height: `${Math.max(10, Math.round((v / max) * 100))}%`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressRing({ value, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((Number(value) / Number(total)) * 100)) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="admin-ring" role="img" aria-label={`${value} of ${total}`}>
      <svg viewBox="0 0 36 36" width="38" height="38">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--line)" strokeWidth="3.5" />
        <circle
          className="admin-ring-fill"
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="admin-ring-label">{pct}%</span>
    </div>
  );
}

function DonutRing({ segments }) {
  const total = (segments || []).reduce((s, x) => s + (x.count || 0), 0);
  if (!total) return null;
  const palette = ['#c9a227', '#a9714b', '#6f4e37', '#e7d3c1', '#d3a94f', '#4a2c1d'];
  const r = 15;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((s, i) => {
    const len = c * ((s.count || 0) / total);
    const arc = {
      key: s._id || `seg-${i}`,
      color: palette[i % palette.length],
      dash: `${len} ${c - len}`,
      offset: -offset,
    };
    offset += len;
    return arc;
  });
  return (
    <div
      className="admin-ring"
      role="img"
      aria-label={`${segments.length} categories: ${segments.map((s) => `${s._id} ${s.count}`).join(', ')}`}
    >
      <svg viewBox="0 0 36 36" width="38" height="38">
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="4"
            strokeDasharray={a.dash}
            strokeDashoffset={a.offset}
            transform="rotate(-90 18 18)"
          />
        ))}
      </svg>
      <span className="admin-ring-label">{segments.length}</span>
    </div>
  );
}

function seriesByDate(rows, dateFn, valFn) {
  const map = new Map();
  for (const r of rows || []) {
    const raw = dateFn(r);
    const key = raw ? String(raw).slice(0, 10) : 'unknown';
    map.set(key, (map.get(key) || 0) + (valFn ? valFn(r) : 1));
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-7)
    .map(([, v]) => v);
}

function SkeletonRows({ count = 5 }) {
  return (
    <div className="admin-skel-block">
      <div className="admin-skel admin-skel-toolbar" />
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="admin-skel admin-skel-row" />
      ))}
    </div>
  );
}

function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <th className={active ? 'admin-sort-active' : ''}>
      <button
        type="button"
        className="admin-th-sort"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <span className={`admin-sort-ind ${active && sort.dir === 'desc' ? 'admin-sort-ind-desc' : ''}`}>
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
    </th>
  );
}

function makeSorter(sort, getters) {
  return (rows) => {
    if (!sort || !sort.key || !getters[sort.key]) return rows;
    const get = getters[sort.key];
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  };
}

function toggleSort(sort, key) {
  if (sort.key === key) {
    return { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' };
  }
  return { key, dir: 'asc' };
}

function RowCheck({ checked, onChange, label }) {
  return (
    <label className="admin-check" title={label}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
    </label>
  );
}

function BulkBar({ count, busy, actions, onClear }) {
  if (count === 0) return null;
  return (
    <div className="admin-bulk-bar" role="region" aria-label="Bulk actions">
      <span className="admin-bulk-count">{count} selected</span>
      <div className="admin-bulk-actions">
        {actions.map((a) => (
          <button
            key={a.label}
            className={`admin-btn admin-btn-sm ${a.cls || 'admin-btn-ghost'}`}
            disabled={busy}
            onClick={a.onClick}
          >
            {a.label}
          </button>
        ))}
        <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy} onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

function ExpandChevron({ open, onClick, label }) {
  return (
    <button
      type="button"
      className={`admin-row-expand-btn ${open ? 'admin-row-expand-open' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      title={open ? 'Collapse row' : 'Expand row'}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="admin-empty-3d">
      <div className="admin-empty-3d-cup" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none">
          <g className="admin-empty-3d-steam" stroke="#c9a227" strokeWidth="3" strokeLinecap="round">
            <path d="M50 44c-5-8 5-10 0-20M70 46c-5-8 5-10 0-20" />
          </g>
          <ellipse cx="60" cy="104" rx="30" ry="6" stroke="#c9a227" strokeWidth="2" fill="rgba(201,162,39,0.06)" />
          <path d="M36 52h48v32a24 24 0 0 1-48 0z" stroke="#c9a227" strokeWidth="2.6" fill="rgba(169,113,75,0.14)" />
          <path d="M84 60h8a9 9 0 0 1 0 18h-7" stroke="#c9a227" strokeWidth="2.4" />
          <ellipse cx="60" cy="72" rx="13" ry="15" stroke="#a9714b" strokeWidth="2" fill="rgba(169,113,75,0.35)" />
        </svg>
      </div>
      <p className="admin-empty-3d-title">{title}</p>
      {hint && <p className="admin-empty-3d-hint">{hint}</p>}
    </div>
  );
}

function AdminStars({ rating }) {
  return (
    <span className="admin-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="13"
          height="13"
          aria-hidden="true"
          className={n <= rating ? 'admin-star-on' : 'admin-star-off'}
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={n <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  const cardRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const focusables = card.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    cardRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="admin-modal" onClick={onClose}>
      <div
        className="admin-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button className="admin-icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

const MAX_BARS = 7;

function DashboardTab({ onToast }) {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [flipped, setFlipped] = useState([]);

  const toggleFlip = (label) =>
    setFlipped((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  useEffect(() => {
    Promise.all([getStats(), getReservations(), getOrders()])
      .then(([s, r, o]) => {
        setStats(s);
        setReservations(r);
        setOrders(o);
      })
      .catch((e) => {
        setError(e.message);
        onToast?.(e.message, 'err');
      });
  }, []);

  const chart = useMemo(() => {
    if (!reservations) return [];
    const map = new Map();
    for (const r of reservations) {
      const key = r.date || 'unknown';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => (a.label < b.label ? -1 : 1))
      .slice(-MAX_BARS);
  }, [reservations]);
  const chartMax = Math.max(1, ...chart.map((c) => c.value));

  const recent = useMemo(
    () =>
      reservations
        ? [...reservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        : [],
    [reservations]
  );

  if (error) return <p className="admin-error">{error}</p>;
  if (!stats || !reservations) {
    return (
      <div className="admin-stats-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="admin-skel admin-skel-stat" />
        ))}
      </div>
    );
  }

  const statuses = [
    { key: 'pending', label: 'Pending', count: stats.reservations.pending, cls: 'seg-pending' },
    { key: 'confirmed', label: 'Confirmed', count: stats.reservations.confirmed, cls: 'seg-confirmed' },
    { key: 'cancelled', label: 'Cancelled', count: stats.reservations.cancelled, cls: 'seg-cancelled' },
  ];
  const stTotal = Math.max(1, stats.reservations.total);

  const resSeries = seriesByDate(reservations, (r) => r.date);
  const orderSeries = seriesByDate(orders || [], (o) => o.createdAt);
  const revenueSeries = seriesByDate(orders || [], (o) => o.createdAt, (o) => Number(o.total) || 0);

  const avgOrder = stats.orders.total > 0 ? Math.round(stats.orders.revenue / stats.orders.total) : 0;

  const cards = [
    {
      label: 'Total Menu Items',
      value: stats.menu.total,
      icon: 'list',
      tone: 'gold',
      back: `Across ${MENU_CATEGORIES.length} categories`,
      viz: {
        type: 'donut',
        segments: [...(stats.menu.categories || [])].sort((a, b) => (b.count || 0) - (a.count || 0)),
        note: `${(stats.menu.categories || []).length} categories`,
      },
    },
    {
      label: 'Total Reservations',
      value: stats.reservations.total,
      icon: 'calendar',
      tone: 'brown',
      back: `${stats.reservations.confirmed} confirmed · ${stats.reservations.cancelled} cancelled`,
      viz: { type: 'spark', values: resSeries },
    },
    {
      label: 'Revenue',
      value: stats.orders.revenue,
      icon: 'cash',
      tone: 'green',
      format: (n) => INr(n),
      back: `Average order ${INr(avgOrder)}`,
      viz: { type: 'bars', values: revenueSeries },
    },
    {
      label: 'Total Orders',
      value: stats.orders.total,
      icon: 'cart',
      tone: 'amber',
      back: `${INr(stats.orders.revenue)} lifetime total`,
      viz: { type: 'bars', values: orderSeries },
    },
    {
      label: 'Pending Reservations',
      value: stats.reservations.pending,
      icon: 'users',
      tone: 'brown',
      back: `${stats.reservations.pending} of ${stats.reservations.total} awaiting reply`,
      viz: {
        type: 'progress',
        value: stats.reservations.pending,
        total: stats.reservations.total,
        note: `${stats.reservations.pending} of ${stats.reservations.total} pending`,
      },
    },
    {
      label: 'Pending Reviews',
      value: stats.reviews.pending,
      icon: 'star',
      tone: 'gold',
      back: `${stats.reviews.total} reviews in total`,
      viz: {
        type: 'progress',
        value: stats.reviews.pending,
        total: stats.reviews.total,
        note: `${stats.reviews.pending} of ${stats.reviews.total} pending`,
      },
    },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`admin-stat-flip ${flipped.includes(c.label) ? 'admin-stat-flipped' : ''}`}
          >
            <div
              className={`admin-stat-card admin-stat-${c.tone} admin-stat-face admin-stat-front`}
              role="button"
              tabIndex={0}
              aria-label={`${c.label} — tap to flip`}
              onClick={() => toggleFlip(c.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip(c.label);
                }
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.removeProperty('--gx');
                e.currentTarget.style.removeProperty('--gy');
              }}
            >
              <div className="admin-stat-head">
                <span className={`admin-stat-value admin-stat-val-${c.tone}`}>
                  <CountUp value={c.value} format={c.format} />
                </span>
                <span className="admin-stat-icon">
                  <Icon name={c.icon} />
                </span>
              </div>
              <span className="admin-stat-label">{c.label}</span>
              {c.viz && (
                <div className="admin-stat-foot">
                  {c.viz.type === 'spark' && <Sparkline values={c.viz.values} />}
                  {c.viz.type === 'bars' && <MiniBars values={c.viz.values} />}
                  {c.viz.type === 'donut' && <DonutRing segments={c.viz.segments} />}
                  {c.viz.type === 'progress' && <ProgressRing value={c.viz.value} total={c.viz.total} />}
                  {(c.viz.type === 'spark' || c.viz.type === 'bars') && <Trend values={c.viz.values} />}
                  {c.viz.note && <span className="admin-stat-foot-note">{c.viz.note}</span>}
                </div>
              )}
            </div>
            <div
              className={`admin-stat-card admin-stat-${c.tone} admin-stat-face admin-stat-back`}
              role="button"
              tabIndex={0}
              aria-label={`${c.label} — tap to flip back`}
              onClick={() => toggleFlip(c.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip(c.label);
                }
              }}
            >
              <span className="admin-stat-back-label">{c.label}</span>
              <span className="admin-stat-back-value">{c.back}</span>
              <span className="admin-stat-back-hint">Tap to flip back</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 className="admin-card-title">Reservations by date</h3>
          {chart.length === 0 ? (
            <p className="admin-muted">No reservation data yet.</p>
          ) : (
            <div className="admin-chart">
              {chart.map((c) => (
                <div className="admin-chart-col" key={c.label}>
                  <span className="admin-chart-value">{c.value}</span>
                  <div className="admin-chart-bar-wrap">
                    <div className="admin-chart-bar" style={{ height: `${Math.round((c.value / chartMax) * 100)}%` }} />
                  </div>
                  <span className="admin-chart-label">{c.label.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Status breakdown</h3>
          <div className="admin-stacked" role="img" aria-label="Reservation status distribution">
            {statuses.map((s) => (
              <div
                key={s.key}
                className={`admin-stacked-seg ${s.cls}`}
                style={{ width: `${Math.round((s.count / stTotal) * 100)}%` }}
              />
            ))}
          </div>
          <div className="admin-breakdown">
            {statuses.map((s) => (
              <div className="admin-breakdown-row" key={s.key}>
                <span className={`admin-dot ${s.cls}`}></span>
                <span>{s.label}</span>
                <span className="admin-breakdown-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card admin-mt">
        <h3 className="admin-card-title">Recent reservations</h3>
        {recent.length === 0 ? (
          <p className="admin-muted">No reservations yet.</p>
        ) : (
          <div className="admin-recent">
            {recent.map((r) => (
              <div className="admin-recent-item" key={r._id}>
                <div className="admin-recent-main">
                  <div className="admin-row-title">
                    <span className="admin-name">{r.name}</span>
                    <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                  </div>
                  <div className="admin-row-meta">
                    <span>{r.date}</span>
                    <span>{r.time}</span>
                    <span>{r.guests} guests</span>
                    <span>{r.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const emptyForm = { name: '', description: '', price: '', category: 'coffee', image: '', available: true };

const MENU_GETTERS = {
  name: (i) => i.name,
  category: (i) => i.category,
  price: (i) => Number(i.price) || 0,
  availability: (i) => (i.available !== false ? 1 : 0),
};

const RESERVATION_GETTERS = {
  name: (r) => r.name,
  date: (r) => r.date,
  time: (r) => toTime12(r.time),
  guests: (r) => Number(r.guests) || 0,
  status: (r) => r.status,
};

const ORDER_GETTERS = {
  name: (o) => o.name,
  items: (o) => summaryOf(o.items),
  total: (o) => Number(o.total) || 0,
  status: (o) => o.status,
};

const REVIEW_GETTERS = {
  item: (r) => r.menuItem?.name || '',
  reviewer: (r) => r.name,
  comment: (r) => r.comment || '',
  rating: (r) => Number(r.rating) || 0,
  status: (r) => r.status,
  created: (r) => r.createdAt,
};

const URL_RE = /^https?:\/\/.+/i;

function validateMenuForm(f) {
  if (!f.name || !f.name.trim()) return 'Name is required.';
  if (f.name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (f.price === '' || f.price == null || Number.isNaN(Number(f.price))) return 'Price is required.';
  if (Number(f.price) <= 0) return 'Price must be greater than 0.';
  if (f.image && f.image.trim() && !URL_RE.test(f.image.trim())) {
    return 'Image URL must start with http:// or https://.';
  }
  return '';
}

function MenuTab({ onToast }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [bulk, setBulk] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [priceEdit, setPriceEdit] = useState(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getMenuItems());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const map = { all: items ? items.length : 0 };
    if (items) {
      for (const c of MENU_CATEGORIES) map[c] = items.filter((i) => i.category === c).length;
    }
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const catOk = category === 'all' || i.category === category;
      const availOk =
        availability === 'all' ||
        (availability === 'available' ? i.available !== false : i.available === false);
      const searchOk = !q || i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q);
      return catOk && availOk && searchOk;
    });
  }, [items, search, category, availability]);

  const sorted = useMemo(() => makeSorter(sort, MENU_GETTERS)(filtered), [filtered, sort]);
  const menuSpark = useMemo(() => seriesByDate(sorted, (i) => i.createdAt), [sorted]);

  const startPriceEdit = (item) => {
    setPriceEdit(item._id);
    setPriceDraft(String(item.price ?? ''));
  };

  const cancelPriceEdit = () => {
    setPriceEdit(null);
    setPriceDraft('');
  };

  const savePriceEdit = async (item) => {
    if (priceEdit !== item._id) return;
    const next = Number(priceDraft);
    setPriceEdit(null);
    setPriceDraft('');
    if (!Number.isFinite(next) || next <= 0) {
      setError('Price must be a number greater than 0.');
      onToast?.('Price must be greater than 0.', 'err');
      return;
    }
    if (next === Number(item.price)) return;
    try {
      await updateMenuItem(item._id, { price: next });
      await load();
      onToast?.(`${item.name} price updated to ${INr(next)}`, 'ok');
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setPreviewError(false);
    setEditing('new');
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price ?? ''),
      category: item.category,
      image: item.image || '',
      available: item.available !== false,
    });
    setFormError('');
    setPreviewError(false);
    setEditing(item._id);
  };

  const submit = async (e) => {
    e.preventDefault();
    const message = validateMenuForm(form);
    if (message) {
      setFormError(message);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image: form.image.trim(),
        available: form.available,
      };
      if (editing === 'new') {
        await createMenuItem(payload);
      } else {
        await updateMenuItem(editing, payload);
      }
      setEditing(null);
      await load();
      onToast?.(`Saved “${payload.name}”`, 'ok');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (item) => {
    try {
      await updateMenuItem(item._id, { available: !item.available });
      await load();
      onToast?.(`${item.name} marked ${item.available ? 'unavailable' : 'available'}`, 'ok');
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenuItem(deleteTarget._id);
      setDeleteTarget(null);
      await load();
      onToast?.(`Deleted “${deleteTarget.name}”`, 'ok');
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const toggleBulk = (id) =>
    setBulk((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleBulkAll = () =>
    setBulk((prev) => (prev.length === filtered.length ? [] : filtered.map((i) => i._id)));

  const bulkSetAvailable = async (available) => {
    const targets = (items || []).filter((i) => bulk.includes(i._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(targets.map((i) => updateMenuItem(i._id, { available })));
      await load();
      onToast?.(`${targets.length} item(s) marked ${available ? 'available' : 'unavailable'}`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    const targets = (items || []).filter((i) => bulk.includes(i._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(targets.map((i) => deleteMenuItem(i._id)));
      await load();
      onToast?.(`Deleted ${targets.length} item(s)`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  if (loading) {
    return <SkeletonRows count={5} />;
  }

  if (error) {
    return (
      <div className="admin-alert">
        <span>{error}</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              className="admin-input"
              type="search"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search menu items"
            />
          </div>
          <div className="admin-chips admin-filter">
            {['all', ...MENU_CATEGORIES].map((c) => (
              <button
                key={c}
                className={`admin-chip ${category === c ? 'admin-chip-active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c} · {counts[c] || 0}
              </button>
            ))}
          </div>
          <div className="admin-filter-divider" aria-hidden="true"></div>
          <div className="admin-chips admin-filter">
            {AVAILABILITY_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`admin-chip ${availability === f.key ? 'admin-chip-active' : ''}`}
                onClick={() => setAvailability(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add menu item
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No menu items yet" hint="Click “Add menu item” to create the first one." />
      ) : filtered.length === 0 ? (
        <p className="admin-muted">No items match your search or category filter.</p>
      ) : (
        <>
          <p className="admin-count-line">
            Showing {sorted.length} of {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          {menuSpark.length > 1 && (
            <div className="admin-tab-spark">
              <span>New items / day</span>
              <Sparkline values={menuSpark} />
              <Trend values={menuSpark} />
            </div>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th-check">
                    <RowCheck
                      checked={bulk.length > 0 && bulk.length === filtered.length}
                      onChange={toggleBulkAll}
                      label="Select all items"
                    />
                  </th>
                  <SortHeader label="Item" sortKey="name" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                  <SortHeader label="Category" sortKey="category" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                  <SortHeader label="Price" sortKey="price" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                  <SortHeader label="Availability" sortKey="availability" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                  <th className="admin-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <Fragment key={item._id}>
                    <tr className={bulk.includes(item._id) ? 'admin-row-selected' : ''}>
                      <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                        <RowCheck
                          checked={bulk.includes(item._id)}
                          onChange={() => toggleBulk(item._id)}
                          label={`Select ${item.name}`}
                        />
                      </td>
                      <td data-label="Item">
                        <div className="admin-cell-item">
                          {item.image ? (
                            <img className="admin-thumb" src={item.image} alt="" loading="lazy" />
                          ) : (
                            <div className="admin-thumb admin-thumb-empty">
                            <svg
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M4 9h14v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Z" />
                              <path d="M18 11h1.5a1.5 1.5 0 0 1 0 3H18" />
                              <path d="M5 21h14" />
                            </svg>
                          </div>
                          )}
                          <div className="admin-cell-copy">
                            <div className="admin-name">{item.name}</div>
                            {item.description && <div className="admin-cell-desc">{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className="admin-cat-chip">{item.category}</span>
                      </td>
                      <td data-label="Price">
                        {priceEdit === item._id ? (
                          <form
                            className="admin-inline-edit"
                            onSubmit={(e) => {
                              e.preventDefault();
                              savePriceEdit(item);
                            }}
                          >
                            <input
                              className="admin-input admin-input-sm"
                              value={priceDraft}
                              autoFocus
                              inputMode="decimal"
                              onChange={(e) => setPriceDraft(e.target.value)}
                              onBlur={() => savePriceEdit(item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') cancelPriceEdit();
                              }}
                              aria-label={`Edit price for ${item.name}`}
                            />
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="admin-price-edit"
                            onClick={() => startPriceEdit(item)}
                            title="Edit price"
                          >
                            <span className="admin-price">{INr(item.price)}</span>
                            <span className="admin-price-pen">
                              <Icon name="edit" size={13} />
                            </span>
                          </button>
                        )}
                      </td>
                      <td data-label="Availability">
                        <div className="admin-avail">
                          <button
                            className={`admin-switch ${item.available !== false ? 'admin-switch-on' : ''}`}
                            onClick={() => toggleAvailable(item)}
                            aria-pressed={item.available !== false}
                            title={item.available !== false ? 'Mark unavailable' : 'Mark available'}
                          >
                            <span></span>
                          </button>
                          <span className={`admin-avail-text ${item.available === false ? 'admin-avail-off' : ''}`}>
                            {item.available !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="admin-table-actions">
                          <ExpandChevron
                            open={expanded === item._id}
                            onClick={() => setExpanded((v) => (v === item._id ? null : item._id))}
                            label={`${expanded === item._id ? 'Collapse' : 'Expand'} details for ${item.name}`}
                          />
                          <button
                            className="admin-icon-action"
                            onClick={() => openEdit(item)}
                            title="Edit item"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            className="admin-icon-action admin-icon-action-danger"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete item"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === item._id && (
                      <tr className="admin-row-expand">
                        <td colSpan={6}>
                          <div className="admin-row-expand-inner">
                            <div>
                              <span className="admin-detail-label">Description</span>
                              <p>{item.description || 'No description'}</p>
                            </div>
                            <div>
                              <span className="admin-detail-label">Category</span>
                              <p>{item.category}</p>
                            </div>
                            <div>
                              <span className="admin-detail-label">Availability</span>
                              <p>{item.available !== false ? 'Available' : 'Unavailable'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <BulkBar
        count={bulk.length}
        busy={bulkBusy}
        onClear={() => setBulk([])}
        actions={[
          { label: 'Mark available', onClick: () => bulkSetAvailable(true) },
          { label: 'Mark unavailable', onClick: () => bulkSetAvailable(false) },
          { label: bulkBusy ? 'Working…' : 'Delete', cls: 'admin-btn-danger', onClick: bulkDelete },
        ]}
      />

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add menu item' : 'Edit menu item'} onClose={() => setEditing(null)}>
          <form className="admin-form" onSubmit={submit} noValidate>
            {formError && <p className="admin-error">{formError}</p>}
            <label className="admin-field">
              <span>Name *</span>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Signature Latte"
              />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea
                className="admin-input admin-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </label>
            <div className="admin-field-row">
              <label className="admin-field">
                <span>Price (₨) *</span>
                <input
                  className="admin-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 320"
                />
              </label>
              <label className="admin-field">
                <span>Category *</span>
                <select
                  className="admin-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {MENU_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="admin-field">
              <span>Image URL</span>
              <input
                className="admin-input"
                value={form.image}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value });
                  setPreviewError(false);
                }}
                placeholder="https://…"
              />
            </label>
            {form.image && form.image.trim() && (
              <div className="admin-image-preview">
                {previewError ? (
                  <div className="admin-image-preview-empty">Preview unavailable</div>
                ) : (
                  <img
                    src={form.image.trim()}
                    alt=""
                    loading="lazy"
                    onError={() => setPreviewError(true)}
                    onLoad={() => setPreviewError(false)}
                  />
                )}
              </div>
            )}
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <span>Available for guests</span>
            </label>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" disabled={saving} type="submit">
                {saving ? 'Saving…' : 'Save item'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete menu item" onClose={() => setDeleteTarget(null)}>
          <div className="admin-delete-card">
            <p>
              Are you sure you want to delete <strong>“{deleteTarget.name}”</strong>? This will remove it from the menu
              and cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting…' : 'Delete item'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReservationsTab({ onToast }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [dateF, setDateF] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [bulk, setBulk] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setRows(null);
    setError('');
    getReservations()
      .then((r) => setRows(r))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updateReservationStatus(id, status);
      setRows((prev) => (prev ? prev.map((r) => (r._id === id ? updated : r)) : prev));
      setSelected((sel) => (sel && sel._id === id ? updated : sel));
      onToast?.(`Reservation ${status}`, 'ok');
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBusyId(null);
    }
  };

  const toggleBulk = (id) =>
    setBulk((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bulkStatus = async (status) => {
    const targets = (rows || []).filter((r) => bulk.includes(r._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      const results = await Promise.all(targets.map((r) => updateReservationStatus(r._id, status)));
      const map = new Map(results.map((r) => [r._id, r]));
      setRows((prev) => (prev ? prev.map((r) => (map.has(r._id) ? map.get(r._id) : r)) : prev));
      onToast?.(`${targets.length} reservation(s) ${status}`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  if (!rows && !error) {
    return <SkeletonRows count={5} />;
  }

  if (error) {
    return (
      <div className="admin-alert">
        <span>{error}</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const ql = q.trim().toLowerCase();
  const counts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const shown = rows.filter((r) => {
    if (statusF !== 'all' && r.status !== statusF) return false;
    if (dateF && r.date !== dateF) return false;
    if (ql) {
      const haystack = `${r.name} ${r.phone}`.toLowerCase().replace(/\s/g, '');
      if (!haystack.includes(ql.replace(/\s/g, ''))) return false;
    }
    return true;
  });

  const hasFilters = Boolean(ql || dateF || statusF !== 'all');
  const dropCount = rows.length - shown.length;
  const sorted = makeSorter(sort, RESERVATION_GETTERS)(shown);
  const resSpark = seriesByDate(sorted, (r) => r.date);

  const clearFilters = () => {
    setQ('');
    setDateF('');
    setStatusF('all');
  };

  const statusButtons = (r, inModal) => {
    const busy = busyId === r._id;
    return (
      <div className={`admin-row-status ${inModal ? 'admin-row-status-modal' : ''}`}>
        {r.status !== 'confirmed' && (
          <button
            className="admin-btn admin-btn-sm admin-btn-confirm"
            disabled={busy}
            onClick={() => changeStatus(r._id, 'confirmed')}
          >
            {busy ? 'Updating…' : 'Confirm'}
          </button>
        )}
        {r.status !== 'cancelled' && (
          <button
            className="admin-btn admin-btn-sm admin-btn-cancel"
            disabled={busy}
            onClick={() => changeStatus(r._id, 'cancelled')}
          >
            Cancel
          </button>
        )}
        {r.status === 'confirmed' && (
          <span className="admin-yes-done">Reserved ✓</span>
        )}
        {r.status === 'cancelled' && (
          <span className="admin-no-done">Closed ✕</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              className="admin-input"
              type="search"
              placeholder="Search by name or phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search reservations"
            />
          </div>
          <div className="admin-date-filter">
            <input
              className="admin-input"
              type="date"
              value={dateF}
              onChange={(e) => setDateF(e.target.value)}
              aria-label="Filter by date"
            />
            {dateF && (
              <button className="admin-date-clear" onClick={() => setDateF('')} title="Clear date filter">
                ✕
              </button>
            )}
          </div>
          <div className="admin-chips admin-filter">
            {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
              <button
                key={f}
                className={`admin-chip ${statusF === f ? 'admin-chip-active' : ''}`}
                onClick={() => setStatusF(f)}
              >
                {f} · {f === 'all' ? rows.length : counts[f] || 0}
              </button>
            ))}
          </div>
        </div>
        {(hasFilters || dropCount > 0) && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No reservations yet" hint="New bookings will appear here." />
      ) : shown.length === 0 ? (
        <p className="admin-muted">
          No reservations match your search or filters.
          {ql && <span> Try a different name/phone{dropCount > 0 ? ` (${dropCount} hidden)` : ''}.</span>}
        </p>
      ) : (
        <>
          {resSpark.length > 1 && (
            <div className="admin-tab-spark">
              <span>Bookings / day</span>
              <Sparkline values={resSpark} />
              <Trend values={resSpark} />
            </div>
          )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th-check">
                  <RowCheck
                    checked={bulk.length > 0 && bulk.length === shown.length}
                    onChange={() => setBulk((prev) => (prev.length === shown.length ? [] : shown.map((r) => r._id)))}
                    label="Select all reservations"
                  />
                </th>
                <SortHeader label="Customer" sortKey="name" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Date" sortKey="date" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Time" sortKey="time" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Guests" sortKey="guests" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Status" sortKey="status" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <Fragment key={r._id}>
                  <tr
                    className={`admin-table-row-click ${bulk.includes(r._id) ? 'admin-row-selected' : ''}`}
                    onClick={() => setSelected(r)}
                  >
                    <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                      <RowCheck
                        checked={bulk.includes(r._id)}
                        onChange={() => toggleBulk(r._id)}
                        label={`Select reservation for ${r.name}`}
                      />
                    </td>
                    <td data-label="Customer" className="admin-cell-item">
                      <div className="admin-cell-copy">
                        <div className="admin-name">{r.name}</div>
                        <div className="admin-cell-desc">{r.phone || '—'}</div>
                      </div>
                    </td>
                    <td data-label="Date" className="admin-cell-plain">{r.date}</td>
                    <td data-label="Time" className="admin-cell-plain">{toTime12(r.time)}</td>
                    <td data-label="Guests" className="admin-cell-plain">
                      <span className="admin-guests">{r.guests}{' '}{Number(r.guests) === 1 ? 'guest' : 'guests'}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-table-actions">
                        <ExpandChevron
                          open={expanded === r._id}
                          onClick={() => setExpanded((v) => (v === r._id ? null : r._id))}
                          label={`${expanded === r._id ? 'Collapse' : 'Expand'} details for ${r.name}`}
                        />
                        {statusButtons(r, false)}
                      </div>
                    </td>
                  </tr>
                  {expanded === r._id && (
                    <tr className="admin-row-expand">
                      <td colSpan={7}>
                        <div className="admin-row-expand-inner">
                          <div>
                            <span className="admin-detail-label">Phone</span>
                            <p>{r.phone || '—'}</p>
                          </div>
                          <div>
                            <span className="admin-detail-label">Booked on</span>
                            <p>{formatDate(r.createdAt)}</p>
                          </div>
                          {r.occasion && (
                            <div>
                              <span className="admin-detail-label">Occasion</span>
                              <p>{r.occasion}</p>
                            </div>
                          )}
                          <div>
                            <span className="admin-detail-label">Status</span>
                            <p>
                              <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                            </p>
                          </div>
                        </div>
                        <div className="admin-row-expand-actions">{statusButtons(r, true)}</div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <BulkBar
        count={bulk.length}
        busy={bulkBusy}
        onClear={() => setBulk([])}
        actions={[
          { label: 'Confirm', cls: 'admin-btn-confirm', onClick: () => bulkStatus('confirmed') },
          { label: 'Cancel', cls: 'admin-btn-cancel', onClick: () => bulkStatus('cancelled') },
        ]}
      />

      {selected && (
        <Modal title="Reservation details" onClose={() => setSelected(null)}>
          <div className="admin-detail">
            <div className="admin-detail-row">
              <span>Status</span>
              <span className={`admin-badge admin-badge-${selected.status}`}>{selected.status}</span>
            </div>
            {[
              ['Name', selected.name],
              ['Phone', selected.phone],
              ['Date', selected.date],
              ['Time', toTime12(selected.time)],
              ['Guests', `${selected.guests} ${Number(selected.guests) === 1 ? 'guest' : 'guests'}`],
              ['Occasion', selected.occasion || '—'],
              ['Booked on', formatDate(selected.createdAt)],
            ].map(([k, v]) => (
              <div className="admin-detail-row" key={k}>
                <span>{k}</span>
                <strong>{v || '—'}</strong>
              </div>
            ))}
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-confirm"
                disabled={busyId === selected._id || selected.status === 'confirmed'}
                onClick={() => changeStatus(selected._id, 'confirmed')}
              >
                {busyId === selected._id ? 'Updating…' : 'Confirm booking'}
              </button>
              <button
                className="admin-btn admin-btn-danger"
                disabled={busyId === selected._id || selected.status === 'cancelled'}
                onClick={() => changeStatus(selected._id, 'cancelled')}
              >
                Cancel booking
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const ORDER_STATUSES = ['placed', 'confirmed', 'completed', 'cancelled'];
const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];

function summaryOf(items) {
  return (items || [])
    .map((it) => `${it.qty}× ${it.name}`)
    .join(', ');
}

function OrdersTab({ onToast }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [bulk, setBulk] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setRows(null);
    setError('');
    getOrders()
      .then((r) => setRows(r))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updateOrderStatus(id, status);
      setRows((prev) => (prev ? prev.map((o) => (o._id === id ? updated : o)) : prev));
      setSelected((sel) => (sel && sel._id === id ? updated : sel));
      onToast?.(`Order ${status}`, 'ok');
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBusyId(null);
    }
  };

  const toggleBulk = (id) =>
    setBulk((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bulkStatus = async (status) => {
    const targets = (rows || []).filter((o) => bulk.includes(o._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      const results = await Promise.all(targets.map((o) => updateOrderStatus(o._id, status)));
      const map = new Map(results.map((o) => [o._id, o]));
      setRows((prev) => (prev ? prev.map((o) => (map.has(o._id) ? map.get(o._id) : o)) : prev));
      onToast?.(`${targets.length} order(s) ${status}`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  if (!rows && !error) {
    return <SkeletonRows count={5} />;
  }

  if (error) {
    return (
      <div className="admin-alert">
        <span>{error}</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const ql = q.trim().toLowerCase();
  const counts = rows.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const shown = rows.filter((o) => {
    if (statusF !== 'all' && o.status !== statusF) return false;
    if (ql) {
      const haystack = `${o.name} ${o.phone} ${summaryOf(o.items)}`.toLowerCase().replace(/\s/g, '');
      if (!haystack.includes(ql.replace(/\s/g, ''))) return false;
    }
    return true;
  });

  const dropCount = rows.length - shown.length;
  const sorted = makeSorter(sort, ORDER_GETTERS)(shown);
  const revSpark = seriesByDate(sorted, (o) => o.createdAt, (o) => Number(o.total) || 0);

  const statusButtons = (o) => {
    const busy = busyId === o._id;
    return (
      <div className="admin-row-status">
        {o.status === 'placed' && (
          <button
            className="admin-btn admin-btn-sm admin-btn-confirm"
            disabled={busy}
            onClick={() => changeStatus(o._id, 'confirmed')}
          >
            {busy ? 'Updating…' : 'Confirm'}
          </button>
        )}
        {o.status === 'confirmed' && (
          <button
            className="admin-btn admin-btn-sm admin-btn-complete"
            disabled={busy}
            onClick={() => changeStatus(o._id, 'completed')}
          >
            {busy ? 'Updating…' : 'Complete'}
          </button>
        )}
        {(o.status === 'placed' || o.status === 'confirmed') && (
          <button
            className="admin-btn admin-btn-sm admin-btn-cancel"
            disabled={busy}
            onClick={() => changeStatus(o._id, 'cancelled')}
          >
            Cancel
          </button>
        )}
        {o.status === 'completed' && <span className="admin-yes-done">Done ✓</span>}
        {o.status === 'cancelled' && <span className="admin-no-done">Closed ✕</span>}
      </div>
    );
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              className="admin-input"
              type="search"
              placeholder="Search by name, phone or item…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search orders"
            />
          </div>
          <div className="admin-chips admin-filter">
            {['all', ...ORDER_STATUSES].map((f) => (
              <button
                key={f}
                className={`admin-chip ${statusF === f ? 'admin-chip-active' : ''}`}
                onClick={() => setStatusF(f)}
              >
                {f} · {f === 'all' ? rows.length : counts[f] || 0}
              </button>
            ))}
          </div>
        </div>
        {(ql || statusF !== 'all') && (
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => {
              setQ('');
              setStatusF('all');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No orders yet" hint="New orders will appear here." />
      ) : shown.length === 0 ? (
        <p className="admin-muted">
          No orders match your search or filters.
          {ql && <span> Try a different name/phone{itemDrop(dropCount)}.</span>}
        </p>
      ) : (
        <>
          {revSpark.length > 1 && (
            <div className="admin-tab-spark">
              <span>Revenue / day</span>
              <Sparkline values={revSpark} />
              <Trend values={revSpark} />
            </div>
          )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th-check">
                  <RowCheck
                    checked={bulk.length > 0 && bulk.length === shown.length}
                    onChange={() => setBulk((prev) => (prev.length === shown.length ? [] : shown.map((o) => o._id)))}
                    label="Select all orders"
                  />
                </th>
                <SortHeader label="Customer" sortKey="name" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Items" sortKey="items" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Total" sortKey="total" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Status" sortKey="status" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <Fragment key={o._id}>
                  <tr
                    className={`admin-table-row-click ${bulk.includes(o._id) ? 'admin-row-selected' : ''}`}
                    onClick={() => setSelected(o)}
                  >
                    <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                      <RowCheck
                        checked={bulk.includes(o._id)}
                        onChange={() => toggleBulk(o._id)}
                        label={`Select order for ${o.name}`}
                      />
                    </td>
                    <td data-label="Customer" className="admin-cell-item">
                      <div className="admin-cell-copy">
                        <div className="admin-name">{o.name}</div>
                        <div className="admin-cell-desc">{o.phone || '—'}</div>
                      </div>
                    </td>
                    <td data-label="Items">
                      <span className="admin-cell-wrap">{summaryOf(o.items)}</span>
                    </td>
                    <td data-label="Total" className="admin-cell-plain">
                      <span className="admin-price">{INr(o.total)}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`admin-badge admin-badge-${o.status}`}>{o.status}</span>
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-table-actions">
                        <ExpandChevron
                          open={expanded === o._id}
                          onClick={() => setExpanded((v) => (v === o._id ? null : o._id))}
                          label={`${expanded === o._id ? 'Collapse' : 'Expand'} details for ${o.name}`}
                        />
                        {statusButtons(o)}
                      </div>
                    </td>
                  </tr>
                  {expanded === o._id && (
                    <tr className="admin-row-expand">
                      <td colSpan={6}>
                        <div className="admin-row-expand-inner">
                          <div>
                            <span className="admin-detail-label">Phone</span>
                            <p>{o.phone || '—'}</p>
                          </div>
                          <div>
                            <span className="admin-detail-label">Placed on</span>
                            <p>{formatDate(o.createdAt)}</p>
                          </div>
                          <div>
                            <span className="admin-detail-label">Total</span>
                            <p className="admin-price">{INr(o.total)}</p>
                          </div>
                        </div>
                        <div className="admin-row-expand-actions">{statusButtons(o)}</div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <BulkBar
        count={bulk.length}
        busy={bulkBusy}
        onClear={() => setBulk([])}
        actions={[
          { label: 'Confirm', cls: 'admin-btn-confirm', onClick: () => bulkStatus('confirmed') },
          { label: 'Complete', cls: 'admin-btn-complete', onClick: () => bulkStatus('completed') },
          { label: 'Cancel', cls: 'admin-btn-cancel', onClick: () => bulkStatus('cancelled') },
        ]}
      />

      {selected && (
        <Modal title="Order details" onClose={() => setSelected(null)}>
          <div className="admin-detail">
            <div className="admin-detail-row">
              <span>Status</span>
              <span className={`admin-badge admin-badge-${selected.status}`}>{selected.status}</span>
            </div>
            {[
              ['Name', selected.name],
              ['Phone', selected.phone],
              ['Total', INr(selected.total)],
              ['Placed on', formatDate(selected.createdAt)],
            ].map(([k, v]) => (
              <div className="admin-detail-row" key={k}>
                <span>{k}</span>
                <strong>{v || '—'}</strong>
              </div>
            ))}
            <div className="admin-detail-block">
              <span className="admin-detail-label">Items</span>
              <ul className="admin-order-lines">
                {(selected.items || []).map((it, idx) => (
                  <li key={idx}>
                    <span>
                      {it.qty}× {it.name}
                    </span>
                    <strong>{INr(it.price * it.qty)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-modal-actions">
              {selected.status === 'placed' && (
                <button
                  className="admin-btn admin-btn-confirm"
                  disabled={busyId === selected._id}
                  onClick={() => changeStatus(selected._id, 'confirmed')}
                >
                  {busyId === selected._id ? 'Updating…' : 'Confirm order'}
                </button>
              )}
              {selected.status === 'confirmed' && (
                <button
                  className="admin-btn admin-btn-confirm"
                  disabled={busyId === selected._id}
                  onClick={() => changeStatus(selected._id, 'completed')}
                >
                  {busyId === selected._id ? 'Updating…' : 'Mark completed'}
                </button>
              )}
              {(selected.status === 'placed' || selected.status === 'confirmed') && (
                <button
                  className="admin-btn admin-btn-danger"
                  disabled={busyId === selected._id}
                  onClick={() => changeStatus(selected._id, 'cancelled')}
                >
                  Cancel order
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function itemDrop(n) {
  return n > 0 ? ` (${n} hidden)` : '';
}

function ReviewsTab({ onToast }) {
  const [rows, setRows] = useState(null);
  const [statusF, setStatusF] = useState('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulk, setBulk] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setRows(null);
    setError('');
    getReviews()
      .then((r) => setRows(r))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updateReviewStatus(id, status);
      setRows((prev) => (prev ? prev.map((r) => (r._id === id ? updated : r)) : prev));
      onToast?.(`Review ${status}`, 'ok');
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await deleteReview(id);
      setRows((prev) => (prev ? prev.filter((r) => r._id !== id) : prev));
      onToast?.('Review deleted', 'ok');
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleBulk = (id) =>
    setBulk((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bulkStatus = async (status) => {
    const targets = (rows || []).filter((r) => bulk.includes(r._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      const results = await Promise.all(targets.map((r) => updateReviewStatus(r._id, status)));
      const map = new Map(results.map((r) => [r._id, r]));
      setRows((prev) => (prev ? prev.map((r) => (map.has(r._id) ? map.get(r._id) : r)) : prev));
      onToast?.(`${targets.length} review(s) ${status}`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    const targets = (rows || []).filter((r) => bulk.includes(r._id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(targets.map((r) => deleteReview(r._id)));
      setRows((prev) => (prev ? prev.filter((r) => !bulk.includes(r._id)) : prev));
      onToast?.(`Deleted ${targets.length} review(s)`, 'ok');
      setBulk([]);
    } catch (err) {
      setError(err.message);
      onToast?.(err.message, 'err');
    } finally {
      setBulkBusy(false);
    }
  };

  if (!rows && !error) {
    return <SkeletonRows count={5} />;
  }

  if (error) {
    return (
      <div className="admin-alert">
        <span>{error}</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const counts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const shown = statusF === 'all' ? rows : rows.filter((r) => r.status === statusF);
  const sorted = makeSorter(sort, REVIEW_GETTERS)(shown);
  const revSpark = seriesByDate(sorted, (r) => r.createdAt);

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-chips admin-filter">
            {['all', ...REVIEW_STATUSES].map((f) => (
              <button
                key={f}
                className={`admin-chip ${statusF === f ? 'admin-chip-active' : ''}`}
                onClick={() => setStatusF(f)}
              >
                {f} · {f === 'all' ? rows.length : counts[f] || 0}
              </button>
            ))}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No reviews yet" hint="Customer reviews will appear here." />
      ) : shown.length === 0 ? (
        <p className="admin-muted">No reviews in this state.</p>
      ) : (
        <>
          {revSpark.length > 1 && (
            <div className="admin-tab-spark">
              <span>Reviews / day</span>
              <Sparkline values={revSpark} />
              <Trend values={revSpark} />
            </div>
          )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th-check">
                  <RowCheck
                    checked={bulk.length > 0 && bulk.length === shown.length}
                    onChange={() => setBulk((prev) => (prev.length === shown.length ? [] : shown.map((r) => r._id)))}
                    label="Select all reviews"
                  />
                </th>
                <SortHeader label="Item" sortKey="item" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Reviewer" sortKey="reviewer" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Comment" sortKey="comment" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Rating" sortKey="rating" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <SortHeader label="Status" sortKey="status" sort={sort} onSort={(k) => setSort((s) => toggleSort(s, k))} />
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <Fragment key={r._id}>
                  <tr className={bulk.includes(r._id) ? 'admin-row-selected' : ''}>
                    <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                      <RowCheck
                        checked={bulk.includes(r._id)}
                        onChange={() => toggleBulk(r._id)}
                        label={`Select review by ${r.name}`}
                      />
                    </td>
                    <td data-label="Item" className="admin-cell-item">
                      <div className="admin-cell-copy">
                        <div className="admin-name">{r.menuItem?.name || '—'}</div>
                        <div className="admin-cell-desc">{formatDate(r.createdAt)}</div>
                      </div>
                    </td>
                    <td data-label="Reviewer" className="admin-cell-plain">{r.name}</td>
                    <td data-label="Comment">
                      <span className="admin-cell-wrap">{r.comment || '—'}</span>
                    </td>
                    <td data-label="Rating" className="admin-cell-plain">
                      <AdminStars rating={r.rating} />
                    </td>
                    <td data-label="Status">
                      <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                    </td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <ExpandChevron
                          open={expanded === r._id}
                          onClick={() => setExpanded((v) => (v === r._id ? null : r._id))}
                          label={`${expanded === r._id ? 'Collapse' : 'Expand'} review by ${r.name}`}
                        />
                        {r.status !== 'approved' && (
                          <button
                            className="admin-btn admin-btn-sm admin-btn-confirm"
                            disabled={busyId === r._id}
                            onClick={() => changeStatus(r._id, 'approved')}
                          >
                            {busyId === r._id ? '…' : 'Approve'}
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            className="admin-btn admin-btn-sm admin-btn-cancel"
                            disabled={busyId === r._id}
                            onClick={() => changeStatus(r._id, 'rejected')}
                          >
                            {busyId === r._id ? '…' : 'Reject'}
                          </button>
                        )}
                        <button
                          className="admin-icon-btn admin-icon-btn-danger"
                          disabled={deletingId === r._id}
                          onClick={() => remove(r._id)}
                          aria-label={`Delete review by ${r.name}`}
                          title="Delete review"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === r._id && (
                    <tr className="admin-row-expand">
                      <td colSpan={7}>
                        <div className="admin-row-expand-inner">
                          <div>
                            <span className="admin-detail-label">Reviewer</span>
                            <p>{r.name}</p>
                          </div>
                          <div>
                            <span className="admin-detail-label">Rating</span>
                            <p>
                              <AdminStars rating={r.rating} />
                            </p>
                          </div>
                          <div>
                            <span className="admin-detail-label">Submitted</span>
                            <p>{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                        {r.comment && <p className="admin-row-expand-comment">“{r.comment}”</p>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <BulkBar
        count={bulk.length}
        busy={bulkBusy}
        onClear={() => setBulk([])}
        actions={[
          { label: 'Approve', cls: 'admin-btn-confirm', onClick: () => bulkStatus('approved') },
          { label: 'Reject', cls: 'admin-btn-cancel', onClick: () => bulkStatus('rejected') },
          { label: bulkBusy ? 'Working…' : 'Delete', cls: 'admin-btn-danger', onClick: bulkDelete },
        ]}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAdminTheme();
  const [tab, setTab] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('adminSidebarCollapsed') === '1';
    } catch {
      return false;
    }
  });
  const [density, setDensity] = useState(() => {
    try {
      return localStorage.getItem('adminDensity') || 'cozy';
    } catch {
      return 'cozy';
    }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [popLoading, setPopLoading] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdIndex, setCmdIndex] = useState(0);
  const [toasts, setToasts] = useState([]);
  const shellRef = useRef(null);

  useEffect(() => {
    getMe()
      .then(setAdmin)
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  useEffect(() => {
    getStats()
      .then(setNotifData)
      .catch(() => {});
  }, []);

  const pushToast = useCallback((message, kind = 'ok') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 320);
    }, 2800);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminSidebarCollapsed', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem('adminDensity', density);
    } catch {
      /* ignore */
    }
  }, [density]);

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key?.toLowerCase();
      if (key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCmdOpen((v) => {
          if (!v) {
            setCmdQuery('');
            setCmdIndex(0);
          }
          return !v;
        });
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setNotifOpen(false);
        setActivityOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest?.('.admin-pop-wrap')) {
        setNotifOpen(false);
        setActivityOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;
    const onDown = (e) => {
      const btn = e.target.closest?.(
        '.admin-btn, .admin-icon-btn, .admin-nav-item, .admin-chip, .admin-cmd-trigger, .admin-sidebar-toggle, .admin-theme-toggle'
      );
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'admin-ripple';
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${e.clientX - r.left - size / 2}px`;
      span.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 620);
    };
    shell.addEventListener('mousedown', onDown);
    return () => shell.removeEventListener('mousedown', onDown);
  }, [admin]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const magnets = new Set();
    const onMove = (e) => {
      const btn = e.target.closest?.('.admin-btn-primary');
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.setProperty('--mag-x', `${(dx * 5).toFixed(2)}px`);
      btn.style.setProperty('--mag-y', `${(dy * 4).toFixed(2)}px`);
      magnets.add(btn);
    };
    const onOut = (e) => {
      const btn = e.target.closest?.('.admin-btn-primary');
      if (!btn || btn.contains(e.relatedTarget)) return;
      btn.style.setProperty('--mag-x', '0px');
      btn.style.setProperty('--mag-y', '0px');
      magnets.delete(btn);
    };
    shell.addEventListener('mousemove', onMove);
    shell.addEventListener('mouseout', onOut);
    return () => {
      shell.removeEventListener('mousemove', onMove);
      shell.removeEventListener('mouseout', onOut);
      magnets.forEach((b) => {
        b.style.setProperty('--mag-x', '0px');
        b.style.setProperty('--mag-y', '0px');
      });
      magnets.clear();
    };
  }, [admin]);

  const onLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    navigate('/admin/login', { replace: true });
  };

  const go = (key) => {
    setTab(key);
    setSidebarOpen(false);
  };

  const toggleDensity = () => setDensity((d) => (d === 'compact' ? 'cozy' : 'compact'));

  const openNotif = () => {
    setNotifOpen((v) => !v);
    setActivityOpen(false);
  };

  const openActivity = async () => {
    const next = !activityOpen;
    setActivityOpen(next);
    setNotifOpen(false);
    if (next && !activityData) {
      setPopLoading(true);
      try {
        const [res, rev] = await Promise.all([getReservations(), getReviews()]);
        const items = [
          ...(res || []).map((r) => ({
            id: `r-${r._id}`,
            icon: 'calendar',
            text: `${r.name} booked a table`,
            when: r.createdAt || `${r.date} ${r.time}`,
            badge: r.status,
          })),
          ...(rev || []).map((v) => ({
            id: `v-${v._id}`,
            icon: 'star',
            text: `${v.name} reviewed ${v.menuItem?.name || 'an item'}`,
            when: v.createdAt,
            badge: v.status,
          })),
        ]
          .sort((a, b) => new Date(b.when) - new Date(a.when))
          .slice(0, 8);
        setActivityData(items);
      } catch {
        /* ignore */
      } finally {
        setPopLoading(false);
      }
    }
  };

  if (!admin) return null;

  const initials = (admin.username || 'A').trim().slice(0, 2).toUpperCase();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'coffee' },
    { key: 'menu', label: 'Menu', icon: 'list' },
    { key: 'reservations', label: 'Reservations', icon: 'calendar' },
    { key: 'orders', label: 'Orders', icon: 'cart' },
    { key: 'reviews', label: 'Reviews', icon: 'star' },
  ];

  const cmdActions = [
    ...navItems.map((n) => ({
      key: `nav-${n.key}`,
      label: `Go to ${n.label}`,
      icon: n.icon,
      group: 'Navigation',
      run: () => go(n.key),
    })),
    {
      key: 'theme',
      label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      icon: theme === 'dark' ? 'sun' : 'moon',
      group: 'Settings',
      run: toggleTheme,
    },
    {
      key: 'density',
      label: density === 'compact' ? 'Use comfortable density' : 'Use compact density',
      icon: 'list',
      group: 'Settings',
      run: toggleDensity,
    },
    {
      key: 'sidebar',
      label: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
      icon: 'chevron',
      group: 'Settings',
      run: () => setCollapsed((c) => !c),
    },
    { key: 'site', label: 'View website', icon: 'coffee', group: 'Actions', run: () => navigate('/') },
    { key: 'logout', label: 'Sign out', icon: 'logout', group: 'Actions', run: onLogout },
  ];
  const cmdQ = cmdQuery.trim().toLowerCase();
  const cmdFiltered = cmdQ ? cmdActions.filter((a) => a.label.toLowerCase().includes(cmdQ)) : cmdActions;
  const cmdSafeIndex = Math.min(cmdIndex, Math.max(0, cmdFiltered.length - 1));

  const runCmd = (action) => {
    if (!action) return;
    setCmdOpen(false);
    action.run();
  };

  const onCmdKeyDown = (e) => {
    if (cmdFiltered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCmdIndex((i) => (i + 1) % cmdFiltered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCmdIndex((i) => (i - 1 + cmdFiltered.length) % cmdFiltered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCmd(cmdFiltered[cmdSafeIndex]);
    }
  };

  const pendingNotifs = notifData
    ? [
        ...(notifData.reservations.pending > 0
          ? [
              {
                icon: 'calendar',
                text: `${notifData.reservations.pending} pending reservation(s)`,
                tab: 'reservations',
              },
            ]
          : []),
        ...(notifData.reviews.pending > 0
          ? [
              {
                icon: 'star',
                text: `${notifData.reviews.pending} review(s) awaiting moderation`,
                tab: 'reviews',
              },
            ]
          : []),
      ]
    : [];
  const pendingTotal = notifData
    ? notifData.reservations.pending + notifData.reviews.pending
    : 0;

  return (
    <div
      className={`admin-page admin-shell ${density === 'compact' ? 'admin-density-compact' : ''}`}
      data-theme={theme}
      ref={shellRef}
    >
      <div className="admin-ambient" aria-hidden="true">
        <span className="admin-ambient-warm"></span>
        <span className="admin-ambient-blob admin-ambient-blob-1"></span>
        <span className="admin-ambient-blob admin-ambient-blob-2"></span>
        <span className="admin-ambient-blob admin-ambient-blob-3"></span>
        <span className="admin-ambient-grid"></span>
      </div>

      <aside
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''} ${
          collapsed ? 'admin-sidebar-collapsed' : ''
        }`}
      >
        <div className="admin-sidebar-top">
          <Link to="/" className="admin-brand admin-sidebar-brand">
            <span className="admin-logo-script">the</span>
            <span className="admin-brand-text">Grand Restaurant &amp; Cafe</span>
            <span className="admin-brand-sub">admin</span>
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name="chevron" size={16} />
          </button>
        </div>

        <button
          className="admin-cmd-trigger"
          onClick={() => {
            setCmdOpen(true);
            setCmdQuery('');
            setCmdIndex(0);
          }}
        >
          <Icon name="command" size={15} />
          <span>Quick actions</span>
          <kbd>Ctrl K</kbd>
        </button>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${tab === item.key ? 'admin-nav-item-active' : ''}`}
              onClick={() => go(item.key)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-avatar">{initials}</span>
            <span className="admin-sidebar-user-meta">
              <span className="admin-sidebar-user-name">{admin.username}</span>
              <span className="admin-sidebar-user-role">Administrator</span>
            </span>
          </div>
          <Link to="/" className="admin-sidebar-site">
            ← View website
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main-col">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 className="admin-header-title">{PAGE_TITLES[tab] || 'Dashboard'}</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-pop-wrap">
              <button
                className={`admin-theme-toggle ${activityOpen ? 'admin-head-on' : ''}`}
                onClick={openActivity}
                aria-label="Recent activity"
                aria-expanded={activityOpen}
                title="Recent activity"
              >
                <Icon name="activity" size={17} />
              </button>
              {activityOpen && (
                <div className="admin-pop">
                  <div className="admin-pop-head">
                    <h3 className="admin-pop-title">Recent activity</h3>
                    <button
                      className="admin-icon-btn"
                      onClick={() => setActivityOpen(false)}
                      aria-label="Close activity"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                  <div className="admin-pop-body">
                    {popLoading && !activityData ? (
                      <p className="admin-pop-empty">Loading…</p>
                    ) : activityData && activityData.length ? (
                      activityData.map((a) => (
                        <div className="admin-pop-item" key={a.id}>
                          <span className="admin-pop-ico">
                            <Icon name={a.icon} size={14} />
                          </span>
                          <span className="admin-pop-copy">
                            <span className="admin-pop-text">{a.text}</span>
                            <span className="admin-pop-meta">{formatDate(a.when)}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="admin-pop-empty">No recent activity yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-pop-wrap">
              <button
                className={`admin-theme-toggle ${notifOpen ? 'admin-head-on' : ''}`}
                onClick={openNotif}
                aria-label="Notifications"
                aria-expanded={notifOpen}
                title="Notifications"
              >
                <Icon name="bell" size={17} />
                {pendingTotal > 0 && <span className="admin-notif-dot"></span>}
              </button>
              {notifOpen && (
                <div className="admin-pop">
                  <div className="admin-pop-head">
                    <h3 className="admin-pop-title">Notifications</h3>
                    <button
                      className="admin-icon-btn"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                  <div className="admin-pop-body">
                    {pendingNotifs.length ? (
                      pendingNotifs.map((n) => (
                        <button
                          className="admin-pop-item admin-pop-item-btn"
                          key={n.text}
                          onClick={() => {
                            go(n.tab);
                            setNotifOpen(false);
                          }}
                        >
                          <span className="admin-pop-ico">
                            <Icon name={n.icon} size={14} />
                          </span>
                          <span className="admin-pop-copy">
                            <span className="admin-pop-text">{n.text}</span>
                            <span className="admin-pop-meta">Tap to open</span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="admin-pop-empty">All caught up.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="admin-theme-toggle"
              onClick={toggleDensity}
              aria-label="Toggle table density"
              aria-pressed={density === 'compact'}
              title={density === 'compact' ? 'Comfortable density' : 'Compact density'}
            >
              <Icon name="list" size={17} />
            </button>

            <span className="admin-user-chip">
              <span className="admin-user-dot"></span>
              <span className="admin-user-name">{admin.username}</span>
            </span>
            <button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm admin-signout"
              onClick={onLogout}
              aria-label="Sign out"
            >
              <Icon name="logout" size={17} />
              <span className="admin-signout-label">Sign out</span>
            </button>
          </div>
        </header>

        <main className="admin-main-content">
          {tab === 'dashboard' && <DashboardTab key="dashboard" onToast={pushToast} />}
          {tab === 'menu' && <MenuTab key="menu" onToast={pushToast} />}
          {tab === 'reservations' && <ReservationsTab key="reservations" onToast={pushToast} />}
          {tab === 'orders' && <OrdersTab key="orders" onToast={pushToast} />}
          {tab === 'reviews' && <ReviewsTab key="reviews" onToast={pushToast} />}
        </main>
      </div>

      {cmdOpen && (
        <div
          className="admin-cmd"
          onClick={() => setCmdOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div className="admin-cmd-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-cmd-input-row">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => {
                  setCmdQuery(e.target.value);
                  setCmdIndex(0);
                }}
                onKeyDown={onCmdKeyDown}
                placeholder="Search actions…"
                aria-label="Search actions"
              />
              <kbd>ESC</kbd>
            </div>
            {cmdFiltered.length ? (
              <ul className="admin-cmd-list">
                {cmdFiltered.map((a, i) => (
                  <Fragment key={a.key}>
                    {a.group !== cmdFiltered[i - 1]?.group && (
                      <li className="admin-cmd-group-label">{a.group}</li>
                    )}
                    <li>
                      <button
                        className={`admin-cmd-item ${i === cmdSafeIndex ? 'admin-cmd-item-active' : ''}`}
                        onClick={() => runCmd(a)}
                        onMouseEnter={() => setCmdIndex(i)}
                      >
                        <Icon name={a.icon} size={16} />
                        <span>{a.label}</span>
                      </button>
                    </li>
                  </Fragment>
                ))}
              </ul>
            ) : (
              <p className="admin-cmd-empty">No actions match “{cmdQuery}”.</p>
            )}
          </div>
        </div>
      )}

      <div className="admin-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`admin-toast ${t.kind === 'err' ? 'admin-toast-err' : 'admin-toast-ok'} ${
              t.out ? 'admin-toast-out' : ''
            }`}
            role="status"
          >
            <Icon name={t.kind === 'err' ? 'close' : 'check'} size={15} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}