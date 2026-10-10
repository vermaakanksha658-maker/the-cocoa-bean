import { useCallback, useEffect, useMemo, useState } from 'react';
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
  };
  return <svg {...common}>{icons[name]}</svg>;
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
  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
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

function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getStats(), getReservations()])
      .then(([s, r]) => {
        setStats(s);
        setReservations(r);
      })
      .catch((e) => setError(e.message));
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
  if (!stats || !reservations) return <p className="admin-muted">Loading dashboard…</p>;

  const statuses = [
    { key: 'pending', label: 'Pending', count: stats.reservations.pending, cls: 'seg-pending' },
    { key: 'confirmed', label: 'Confirmed', count: stats.reservations.confirmed, cls: 'seg-confirmed' },
    { key: 'cancelled', label: 'Cancelled', count: stats.reservations.cancelled, cls: 'seg-cancelled' },
  ];
  const stTotal = Math.max(1, stats.reservations.total);

  const cards = [
    { label: 'Total Menu Items', value: stats.menu.total, icon: 'list', tone: 'gold' },
    { label: 'Total Reservations', value: stats.reservations.total, icon: 'calendar', tone: 'brown' },
    { label: 'Revenue', value: INr(stats.orders.revenue), icon: 'cash', tone: 'green' },
    { label: 'Total Orders', value: stats.orders.total, icon: 'cart', tone: 'amber' },
    { label: 'Pending Reservations', value: stats.reservations.pending, icon: 'users', tone: 'brown' },
    { label: 'Pending Reviews', value: stats.reviews.pending, icon: 'star', tone: 'gold' },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`admin-stat-card admin-stat-${c.tone}`}>
            <div className="admin-stat-head">
              <span className={`admin-stat-value admin-stat-val-${c.tone}`}>{c.value}</span>
              <span className="admin-stat-icon">
                <Icon name={c.icon} />
              </span>
            </div>
            <span className="admin-stat-label">{c.label}</span>
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

function MenuTab() {
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
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-inline-loading">
        <span className="admin-pulse-dot"></span>
        <p>Loading menu…</p>
      </div>
    );
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
        <p className="admin-muted">No menu items yet. Click “Add menu item” to create the first one.</p>
      ) : filtered.length === 0 ? (
        <p className="admin-muted">No items match your search or category filter.</p>
      ) : (
        <>
          <p className="admin-count-line">
            Showing {filtered.length} of {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th className="admin-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Item">
                      <div className="admin-cell-item">
                        {item.image ? (
                          <img className="admin-thumb" src={item.image} alt="" loading="lazy" />
                        ) : (
                          <div className="admin-thumb admin-thumb-empty">☕</div>
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
                      <span className="admin-price">{INr(item.price)}</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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

function ReservationsTab() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [dateF, setDateF] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!rows && !error) {
    return (
      <div className="admin-inline-loading">
        <span className="admin-pulse-dot"></span>
        <p>Loading reservations…</p>
      </div>
    );
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
        {r.status === 'confirmed' && !inModal && (
          <span className="admin-yes-done">Reserved ✓</span>
        )}
        {r.status === 'cancelled' && !inModal && (
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
        <p className="admin-muted">No reservations yet — new bookings will appear here.</p>
      ) : shown.length === 0 ? (
        <p className="admin-muted">
          No reservations match your search or filters.
          {ql && <span> Try a different name/phone{dropCount > 0 ? ` (${dropCount} hidden)` : ''}.</span>}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r._id} className="admin-table-row-click" onClick={() => setSelected(r)}>
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
                    <div className="admin-table-actions">{statusButtons(r, false)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

function OrdersTab() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!rows && !error) {
    return (
      <div className="admin-inline-loading">
        <span className="admin-pulse-dot"></span>
        <p>Loading orders…</p>
      </div>
    );
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
        <p className="admin-muted">No orders yet — new orders will appear here.</p>
      ) : shown.length === 0 ? (
        <p className="admin-muted">
          No orders match your search or filters.
          {ql && <span> Try a different name/phone{itemDrop(dropCount)}.</span>}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o._id} className="admin-table-row-click" onClick={() => setSelected(o)}>
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
                    <div className="admin-table-actions">{statusButtons(o)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

function ReviewsTab() {
  const [rows, setRows] = useState(null);
  const [statusF, setStatusF] = useState('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await deleteReview(id);
      setRows((prev) => (prev ? prev.filter((r) => r._id !== id) : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!rows && !error) {
    return (
      <div className="admin-inline-loading">
        <span className="admin-pulse-dot"></span>
        <p>Loading reviews…</p>
      </div>
    );
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
        <p className="admin-muted">No reviews yet — customer reviews will appear here.</p>
      ) : shown.length === 0 ? (
        <p className="admin-muted">No reviews in this state.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Reviewer</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r._id}>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAdminTheme();
  const [tab, setTab] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getMe()
      .then(setAdmin)
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

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

  if (!admin) return null;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'coffee' },
    { key: 'menu', label: 'Menu', icon: 'list' },
    { key: 'reservations', label: 'Reservations', icon: 'calendar' },
    { key: 'orders', label: 'Orders', icon: 'cart' },
    { key: 'reviews', label: 'Reviews', icon: 'star' },
  ];

  return (
    <div className="admin-page admin-shell" data-theme={theme}>
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <Link to="/" className="admin-brand admin-sidebar-brand">
          <span className="admin-logo-script">the</span>
          Cocoa Bean
          <span className="admin-brand-sub">admin</span>
        </Link>

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
          {tab === 'dashboard' && <DashboardTab key="dashboard" />}
          {tab === 'menu' && <MenuTab key="menu" />}
          {tab === 'reservations' && <ReservationsTab key="reservations" />}
          {tab === 'orders' && <OrdersTab key="orders" />}
          {tab === 'reviews' && <ReviewsTab key="reviews" />}
        </main>
      </div>
    </div>
  );
}