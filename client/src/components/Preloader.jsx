import { useState, useEffect } from 'react';
import './Preloader.css';

const KEY = 'cocoa-preloader-shown';

if (typeof window !== 'undefined' && location.pathname !== '/' && sessionStorage.getItem(KEY) !== '1') {
  sessionStorage.setItem(KEY, '1');
}

export default function Preloader() {
  const [ran] = useState(() => sessionStorage.getItem(KEY) === '1');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (ran) return;
    sessionStorage.setItem(KEY, '1');
    const timer = setTimeout(() => setHidden(true), 1400);
    return () => clearTimeout(timer);
  }, [ran]);

  if (ran) return null;

  return (
    <div className={`preloader ${hidden ? 'preloader-done' : ''}`} aria-hidden={hidden}>
      <div className="pre-img">
        <svg className="pre-crown" viewBox="0 0 64 64" fill="none">
          <path d="M12 42l3.6-22 8.2 8L32 14l8.2 14 8.2-8L52 42H12z" stroke="#C9A227" strokeWidth="3" strokeLinejoin="round" />
          <path d="M8 47h48" stroke="#C9A227" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="10" r="2.4" fill="#C9A227" />
          <circle cx="15.6" cy="20" r="1.8" fill="#C9A227" />
          <circle cx="48.4" cy="20" r="1.8" fill="#C9A227" />
        </svg>
      </div>
      <p className="pre-logo">
        <span className="pre-script">Grand</span> Restaurant &amp; Cafe
      </p>
      <span className="pre-progress"><span></span></span>
    </div>
  );
}