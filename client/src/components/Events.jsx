import useInView from '../hooks/useInView.js';
import './Events.css';

const events = [
  {
    day: 'Fri',
    title: 'Acoustic Live Night',
    desc: 'Unplugged sets with local artists while the espresso machine hums along.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v10" />
        <circle cx="12" cy="15.5" r="3.5" />
        <path d="M15.5 8.5A4.5 4.5 0 0112 4a4.5 4.5 0 01-3.5 4.5M9 18h6" />
      </svg>
    ),
  },
  {
    day: 'Sat',
    title: 'Coffee Brewing Workshop',
    desc: 'Learn pour-over, grind sizes and tasting notes with our head barista.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h12v5.5A4.5 4.5 0 0111.5 22h-3A4.5 4.5 0 014 17.5zM16 15h2.5a2.5 2.5 0 000-5H16M9 9c0-2-1.5-2.5-1-5M13 9c1-2-.5-2.5 0-5" />
      </svg>
    ),
  },
  {
    day: 'Sun',
    title: 'Sunday Slow Brunch',
    desc: 'Bottomless filter coffee, fresh bakes and all the lazy morning feels.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Events() {
  const [ref, inView] = useInView();

  return (
    <section className="section-pad events">
      <div className="container">
        <div className={`section-head reveal ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">good times</span>
          <h2 className="section-title">What's Happening</h2>
          <div className="divider"></div>
        </div>

        <div className={`events-grid reveal-stagger ${inView ? 'in-view' : ''}`}>
          {events.map((e) => (
            <article className="event-card" key={e.title}>
              <span className="event-day">{e.day}</span>
              <div className="event-icon">{e.icon}</div>
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}