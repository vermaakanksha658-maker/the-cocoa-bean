import { useState } from 'react';
import useInView from '../hooks/useInView.js';
import './Reservation.css';

const initial = { name: '', phone: '', date: '', time: '', guests: '2' };

export default function Reservation() {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [ref, inView] = useInView();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Network error');
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <section id="reserve" className="section-pad reserve">
      <div className="container reserve-grid">
        <div className={`reserve-intro reveal reveal-left ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">save your seat</span>
          <h2 className="section-title reserve-title">Reserve a Corner</h2>
          <p className="reserve-sub">
            A quiet table by the window, or a spot close to the roastery — tell us when and we’ll
            keep the kettle warm.
          </p>
          <ul className="reserve-points">
            <li>Instant confirmation</li>
            <li>Free cancellation up to 2 hours</li>
            <li>Groups of 6+ — give us a call</li>
          </ul>
        </div>

        <div className={`reserve-card reveal reveal-right ${inView ? 'in-view' : ''}`}>
          {state === 'done' ? (
            <div className="reserve-done">
              <span className="reserve-done-icon">☕</span>
              <h3>You’re booked!</h3>
              <p>
                Thanks {form.name.split(' ')[0]} — {form.guests} {form.guests === '1' ? 'guest' : 'guests'}{' '}
                for {form.date} at {form.time}. We’ll be waiting.
              </p>
              <button className="btn btn-ghost" onClick={() => { setForm(initial); setState('idle'); }}>
                Make another booking
              </button>
            </div>
          ) : (
            <form className="reserve-form" onSubmit={submit}>
              <div className="reserve-row">
                <label>
                  <span>Name</span>
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="Your name" />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9+ ]{8,15}"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </label>
              </div>
              <div className="reserve-row">
                <label>
                  <span>Date</span>
                  <input type="date" required value={form.date} onChange={set('date')} />
                </label>
                <label>
                  <span>Time</span>
                  <input type="time" required value={form.time} onChange={set('time')} />
                </label>
              </div>
              <label>
                <span>Guests</span>
                <select value={form.guests} onChange={set('guests')}>
                  {['1', '2', '3', '4', '5', '6'].map((n) => (
                    <option value={n} key={n}>
                      {n} {n === '1' ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </label>

              {state === 'error' && (
                <p className="reserve-error">
                  Couldn’t reach our server right now. Please call us at +91 98XXX XXXXX to book.
                </p>
              )}

              <button type="submit" className="btn btn-primary reserve-btn" disabled={state === 'loading'}>
                {state === 'loading' ? 'Booking…' : 'Confirm Reservation'}
              </button>
              <p className="reserve-note">No advance needed — we hold the table for 15 minutes.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}