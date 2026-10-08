import './About.css';
import useInView from '../hooks/useInView.js';

export default function About() {
  const [leftRef, leftIn] = useInView();
  const [rightRef, rightIn] = useInView();

  return (
    <section id="story" className="section-pad about">
      <div className="container about-grid">
        <div className={`about-media reveal reveal-left ${leftIn ? 'in-view' : ''}`} ref={leftRef}>
          <img
            src="https://images.unsplash.com/photo-1757010055832-de355d2f8f06?fm=jpg&q=80&w=900&auto=format&fit=crop"
            alt="Warm, cozy cafe interior"
            loading="lazy"
          />
          <div className="about-badge">
            <span className="about-badge-num">12</span>
            <span>Years of<br />Brewing</span>
          </div>
        </div>

        <div className={`about-text reveal reveal-right ${rightIn ? 'in-view' : ''}`} ref={rightRef}>
          <span className="kicker">our story</span>
          <h2 className="section-title">A Cup That Tastes Like Home</h2>
          <p className="about-para">
            The Cocoa Bean began as a tiny corner counter with a single espresso machine and a big
            belief — that coffee should be slow, thoughtful and shared. Today we roast our own
            beans, bake every morning, and pour every drink with the care of a handwritten letter.
          </p>
          <ul className="about-list">
            <li>Single-origin beans, roasted in-house</li>
            <li>House-baked pastries & desserts daily</li>
            <li>Hand-poured drinks, made-to-order</li>
          </ul>
          <a href="#menu" className="btn btn-ghost about-btn">
            Taste Our Menu
          </a>
        </div>
      </div>
    </section>
  );
}