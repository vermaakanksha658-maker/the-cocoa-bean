import { useState, useEffect } from 'react';
import './Preloader.css';

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`preloader ${hidden ? 'preloader-done' : ''}`} aria-hidden={hidden}>
      <div className="pre-img">
        <svg viewBox="0 0 40 48" fill="none">
          <path
            d="M10 12c3-2 6-2 8-1M24 12c3-2 6-2 7-1M7 30c4 4 7 6 12 6M8 32c-3 2-5 5-5 8"
            stroke="#C9A227"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="pre-cup">☕</span>
      </div>
      <p className="pre-logo">
        <span className="pre-script">the</span> Cocoa Bean
      </p>
      <span className="pre-progress"><span></span></span>
    </div>
  );
}