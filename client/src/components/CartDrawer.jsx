import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import './Cart.css';

const emptyItems = { name: '', phone: '' };

export default function CartDrawer() {
  const { items, setQty, remove, clear, count, total, open, closeCart } = useCart();
  const toast = useToast();
  const [form, setForm] = useState(emptyItems);
  const [phase, setPhase] = useState('form'); // form | submitting | done
  const [error, setError] = useState('');

  const lines = Object.values(items);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const checkout = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setPhase('submitting');
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          items: lines.map((i) => ({ menuItem: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not place the order right now.');
      setPhase('done');
      toast.push(`Order placed — ${data.total ? `₹${data.total}` : ''} — we’ll confirm shortly!`, 'success');
    } catch (err) {
      setPhase('form');
      setError(err.message);
    }
  };

  const reset = () => {
    clear();
    setForm(emptyItems);
    setPhase('form');
    setError('');
    closeCart();
  };

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={phase !== 'submitting' ? closeCart : undefined}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label="Your order">
        <header className="cart-head">
          <h3>Your Order</h3>
          <button className="cart-close" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </header>

        {phase === 'done' ? (
          <div className="cart-done">
            <span className="cart-done-icon">☕</span>
            <h4>Thank you, {form.name.split(' ')[0] || 'friend'}!</h4>
            <p>
              Your order for {count} {count === 1 ? 'item' : 'items'} (₹{total}) is with us. We’ll
              call you shortly to confirm.
            </p>
            <button className="btn btn-primary cart-done-btn" onClick={reset}>
              Keep browsing
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <a href="#menu" className="btn btn-primary cart-empty-btn" onClick={closeCart}>
              Browse the menu
            </a>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {lines.map((item) => (
                <div className="cart-item" key={item.id}>
                  {item.image ? (
                    <img className="cart-thumb" src={item.image} alt="" loading="lazy" />
                  ) : (
                    <div className="cart-thumb cart-thumb-fallback">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-price">₹{item.price}</div>
                  </div>
                  <div className="cart-qty">
                    <button onClick={() => setQty(item.id, item.qty - 1)} aria-label={`Decrease ${item.name}`}>
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} aria-label={`Increase ${item.name}`}>
                      +
                    </button>
                  </div>
                  <button className="cart-remove" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <form className="cart-checkout" onSubmit={checkout}>
              <div className="cart-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
              <div className="cart-fields">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={set('name')}
                  aria-label="Your name"
                />
                <input
                  type="tel"
                  required
                  pattern="[0-9+ ]{8,15}"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={set('phone')}
                  aria-label="Phone number"
                />
              </div>
              {error && <p className="cart-error">{error}</p>}
              <button type="submit" className="btn btn-primary cart-order-btn" disabled={phase === 'submitting'}>
                {phase === 'submitting' ? 'Placing order…' : `Place order · ₹${total}`}
              </button>
              <p className="cart-note">Pay at the counter when you arrive.</p>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}