import './WhyUs.css';
import useInView from '../hooks/useInView.js';

const features = [
  {
    title: 'Roasted In-House',
    desc: 'Small-batch single-origin beans, roasted fresh every week.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M30 6c6 4 7 10 4 15l-8 13H22l-8-13c-3-5-2-11 4-15l2 4c6-1 8 1 10-4z" />
        <path d="M16 34c-3 2-6 6-6 10 6-1 10-3 12-7M32 34c3 2 6 6 6 10-6-1-10-3-12-7" />
      </svg>
    ),
  },
  {
    title: 'Barista Craft',
    desc: 'Latte art, precise temperatures — every shot considered.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22h22v10a11 11 0 01-22 0z" />
        <path d="M34 26h4a5 5 0 010 10h-4M18 18c0-4-3-5-2-9M27 18c1-4-2-5-1-9" />
      </svg>
    ),
  },
  {
    title: 'Cozy Corners',
    desc: 'Warm lights, soft seats and your own quiet nook.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 40l6-14h16l6 14H10z" />
        <path d="M16 26l8-16 8 16M24 10V6M14 14h4M30 14h4" />
      </svg>
    ),
  },
  {
    title: 'Quick & Warm Service',
    desc: 'Smiles first, coffee second — served in minutes.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="24" cy="24" r="17" />
        <path d="M14 30c3 4 6 6 10 6s7-2 10-6M18 20h.01M30 20h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function WhyUs() {
  const [ref, inView] = useInView();

  return (
    <section className="section-pad why">
      <div className="container">
        <div className="section-head">
          <span className="kicker">why cocoa bean</span>
          <h2 className="section-title why-title">Brewed to Be Memorable</h2>
          <div className="divider"></div>
        </div>

        <div className={`why-grid reveal-stagger ${inView ? 'in-view' : ''}`} ref={ref}>
          {features.map((f) => (
            <div className="why-card" key={f.title}>
              <div className="why-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}