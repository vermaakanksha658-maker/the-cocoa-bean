import { useState } from 'react';
import useInView from '../hooks/useInView.js';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [ref, inView] = useInView();

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) setDone(true);
  };

  return (
    <section id="newsletter" className="news">
      <div className={`container news-inner reveal ${inView ? 'in-view' : ''}`} ref={ref}>
        <span className="kicker news-kicker">stay close</span>
        <h2 className="section-title news-title">Reserve a Table or Get Fresh Brew News</h2>
        <p className="news-sub">
          Drop your email — we’ll save you a corner seat and share weekly roasts and offers.
        </p>

        {done ? (
          <p className="news-done">Thank you! We’ll be in touch soon. ☕</p>
        ) : (
          <form className="news-form" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}