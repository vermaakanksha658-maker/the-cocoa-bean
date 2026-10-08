import './Marquee.css';

const words = ['Fresh Roast', 'Single Origin', 'Hand Poured', 'Cozy Corners', 'House Baked', 'Slow Mornings'];

export default function Marquee() {
  const row = [...words, ...words];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((w, i) => (
          <span className="marquee-word" key={i}>
            {w}
            <span className="marquee-dot">☕</span>
          </span>
        ))}
      </div>
    </div>
  );
}