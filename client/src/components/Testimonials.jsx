import { useState, useEffect, useRef } from 'react';
import useInView from '../hooks/useInView.js';
import './Testimonials.css';

const reviews = [
  {
    name: 'Aarav Mehta',
    role: 'Regular since 2019',
    text: 'The pour over tastes like a small ceremony. Easily the most elegant caf\u00e9 in the city.',
    initials: 'AM',
  },
  {
    name: 'Ishita Sharma',
    role: 'Work & study corner',
    text: 'Cozy lighting, soft music and the golden mocha — my writing spot forever.',
    initials: 'IS',
  },
  {
    name: 'Rohan Kapoor',
    role: 'Coffee enthusiast',
    text: 'You can taste the care in every roast. The croissants keep me coming back.',
    initials: 'RK',
  },
];

function Stars() {
  return (
    <div className="stars" aria-label="5 out of 5 stars">
      {'★★★★★'.split('').map((s, i) => (
        <span key={i}>{s}</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ref, inView] = useInView();
  const count = reviews.length;

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <section className="section-pad testi">
      <div className="container">
        <div className={`section-head reveal ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">kind words</span>
          <h2 className="section-title">Loved by Our Guests</h2>
          <div className="divider"></div>
        </div>

        <div
          className={`testi-slider ${inView ? 'testi-slider-in' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="testi-arrow testi-prev" onClick={prev} aria-label="Previous review">
            ‹
          </button>

          <div className="testi-viewport" ref={ref}>
            <div className="testi-track" style={{ transform: `translateX(-${index * 100}%)` }}>
              {reviews.map((r) => (
                <figure className="testi-card" key={r.name}>
                  <span className="testi-quote">“</span>
                  <Stars />
                  <blockquote>{r.text}</blockquote>
                  <figcaption>
                    <span className="testi-avatar">{r.initials}</span>
                    <span>
                      <strong>{r.name}</strong>
                      <small>{r.role}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <button className="testi-arrow testi-next" onClick={next} aria-label="Next review">
            ›
          </button>

          <div className="testi-dots">
            {reviews.map((r, i) => (
              <button
                key={r.name}
                className={`testi-dot ${i === index ? 'testi-dot-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to review ${i + 1}`}
                aria-current={i === index}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}