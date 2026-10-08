import useInView from '../hooks/useInView.js';
import './Gallery.css';

const shots = [
  {
    src: 'https://images.unsplash.com/photo-1777451441095-c7ef2f875929?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Plant-filled corners',
  },
  {
    src: 'https://images.unsplash.com/photo-1752757257738-9a4f136b3f87?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Wooden warmth',
  },
  {
    src: 'https://images.unsplash.com/photo-1770123024494-776bc2d3836b?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Poured with love',
  },
  {
    src: 'https://images.unsplash.com/photo-1769138885118-c1261518414d?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Breakfast moments',
  },
  {
    src: 'https://images.unsplash.com/photo-1759566926659-b1a9ec89cc82?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Golden pastries',
  },
  {
    src: 'https://images.unsplash.com/photo-1757010055832-de355d2f8f06?fm=jpg&q=80&w=900&auto=format&fit=crop',
    caption: 'Warm lighting',
  },
];

export default function Gallery() {
  const [ref, inView] = useInView();

  return (
    <section className="section-pad gallery" aria-label="Cafe gallery">
      <div className="container">
        <div className={`section-head reveal ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">a peek inside</span>
          <h2 className="section-title">Moments at The Cocoa Bean</h2>
          <div className="divider"></div>
        </div>
      </div>

      <div className={`gallery-strip ${inView ? 'gallery-in' : ''}`}>
        {shots.map((s, i) => (
          <figure className="gallery-item" key={s.src}>
            <img src={s.src} alt={s.caption} loading="lazy" decoding="async" />
            <figcaption>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}