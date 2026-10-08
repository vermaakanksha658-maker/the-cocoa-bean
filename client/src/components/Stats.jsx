import useInView from '../hooks/useInView.js';
import useCountUp from '../hooks/useCountUp.js';
import './Stats.css';

const stats = [
  { value: 12, suffix: '+', label: 'Years of Brewing' },
  { value: 40, suffix: '+', label: 'Drinks on Menu' },
  { value: 25, suffix: 'K+', label: 'Happy Sips Served' },
  { value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
];

function Counter({ stat, start }) {
  const value = useCountUp(start ? stat.value : 0);

  if (stat.decimals) {
    return <>{start ? (stat.value).toFixed(stat.decimals) : '0.0'}{stat.suffix}</>;
  }
  return <>{value}{stat.suffix}</>;
}

export default function Stats() {
  const [ref, inView] = useInView({ threshold: 0.3 });

  return (
    <section className="stats" aria-label="The Cocoa Bean in numbers">
      <div className="container">
        <div className={`stats-grid ${inView ? 'stats-in-view' : ''}`} ref={ref}>
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-num">
                <Counter stat={s} start={inView} />
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}