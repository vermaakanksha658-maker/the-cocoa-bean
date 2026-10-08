import './Hero.css';

export default function Hero() {
  return (
    <header id="home" className="hero">
      <div
        className="hero-bg"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1670523685691-c1f01daa090b?fm=jpg&q=80&w=1920&auto=format&fit=crop)',
        }}
      ></div>

      <div className="hero-content container">
        <span className="hero-script hero-anim-1">freshly brewed, with love</span>
        <h1 className="hero-title">
          <span className="hero-line hero-anim-2">Rich Coffee,</span>
          <span className="hero-line hero-anim-3">
            <em>Warm</em> Moments
          </span>
        </h1>
        <p className="hero-sub hero-anim-4">
          Slow-roasted single-origin beans, handcrafted drinks and cozy corners — brewed daily at{' '}
          <strong>The Cocoa Bean</strong>.
        </p>
        <div className="hero-cta hero-anim-5">
          <a href="#menu" className="btn btn-primary">
            Explore Menu
          </a>
          <a href="#reserve" className="btn btn-outline">
            Reserve a Table
          </a>
        </div>
      </div>

      <div className="hero-cup" aria-hidden="true">
        <svg viewBox="0 0 120 140" fill="none">
          <g className="steam steam-1">
            <path
              d="M55 96c-4-8 4-8 0-16M65 100c-4-8 4-8 0-16"
              stroke="#E7D3C1"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <g className="steam steam-2">
            <path
              d="M63 84c-4-8 4-8 0-16M73 88c-4-8 4-8 0-16"
              stroke="#E7D3C1"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M34 52h52v34a26 26 0 01-52 0z"
            fill="rgba(255,250,244,0.08)"
            stroke="#C9A227"
            strokeWidth="2.5"
          />
          <path d="M86 60h10a10 10 0 010 20h-9" stroke="#C9A227" strokeWidth="2.5" />
          <path d="M92 40v-6M80 40v-5M104 40v-5" stroke="#A9714B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="72" r="15" fill="rgba(169,113,75,0.35)" stroke="#C9A227" strokeWidth="2" />
        </svg>
      </div>

      <a href="#story" className="hero-scroll" aria-label="Scroll down">
        <span></span>
      </a>
    </header>
  );
}