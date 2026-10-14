import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../customer/api.js';
import { useCustomer } from '../customer/useCustomer.jsx';

function formatDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MyOrders() {
  const { customer, openAuth, loading } = useCustomer();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    getMyOrders()
      .then((rows) => !cancelled && setOrders(rows))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [customer]);

  if (loading) {
    return (
      <div className="myorders-wrap">
        <p className="myorders-sub">Loading your account…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="myorders-wrap">
        <h1 className="myorders-title">My orders</h1>
        <div className="myorders-empty">
          <p>Please log in to see your order history.</p>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => openAuth({ tab: 'login', reason: 'See your order history' })}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="myorders-wrap">
      <h1 className="myorders-title">My orders</h1>
      <p className="myorders-sub">
        Hey {customer.name.split(' ')[0]} — here&rsquo;s everything you&rsquo;ve ordered with us.
      </p>

      {error && <p className="cust-auth-error">{error}</p>}

      {orders === null ? (
        <p className="myorders-sub">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="myorders-empty">
          <p>No orders yet — your next favourite dish is waiting.</p>
          <Link to="/menu" className="btn btn-primary" style={{ marginTop: 14 }}>
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="myorders-list">
          {orders.map((o) => (
            <article className="myorder-card" key={o._id}>
              <div className="myorder-top">
                <span className="myorder-id">Order · {formatDate(o.createdAt)}</span>
                <span className={`myorder-badge myorder-badge-${o.status}`}>{o.status}</span>
              </div>
              <ul className="myorder-items">
                {(o.items || []).map((it, idx) => (
                  <li key={idx}>
                    <span>
                      {it.qty}× {it.name}
                    </span>
                    <span>₹{it.price * it.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="myorder-foot">
                <span className="myorder-total">₹{o.total}</span>
                <span className="myorder-id">Pay at the counter when you arrive.</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
