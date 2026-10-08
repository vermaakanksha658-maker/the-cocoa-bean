import { useState } from 'react';
import useInView from '../hooks/useInView.js';
import './Faq.css';

const faqs = [
  {
    q: 'Do you have free Wi-Fi?',
    a: 'Yes — unlimited free Wi-Fi for all guests, ideal for working or studying sessions.',
  },
  {
    q: 'Can I reserve a table for a group?',
    a: 'Absolutely. Use the reservation form or call us for groups bigger than six, and we will set up the cozy corner for you.',
  },
  {
    q: 'Do you bake everything in-house?',
    a: 'Every croissant, tart and dessert is baked fresh every morning in our own kitchen — no pre-made supplies.',
  },
  {
    q: 'Is parking available?',
    a: 'We have complimentary two-wheeler parking and a valet for cars on weekends.',
  },
  {
    q: 'Do you take custom drinks?',
    a: 'Of course. Our baristas love crafting custom flavour combinations — oat, almond, hazelnut and sugar-free options available.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  const [ref, inView] = useInView();

  return (
    <section className="section-pad faq">
      <div className="container faq-grid">
        <div className={`faq-intro reveal reveal-left ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">good to know</span>
          <h2 className="section-title">Questions, Brewed Answers</h2>
          <p className="faq-sub">
            Everything you might want to know before you drop by. Still curious? Call us or ask at
            the counter.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${open === i ? 'faq-item-open' : ''}`} key={f.q}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                {f.q}
                <span className="faq-icon" aria-hidden="true">
                  {open === i ? '−' : '+'}
                </span>
              </button>
              <div className="faq-a-wrap">
                <p className="faq-a">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}