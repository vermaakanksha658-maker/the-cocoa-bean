import { useState, useEffect } from 'react';
import './Navbar.css';

const links = [
  { label: 'Home', id: 'home' },
  { label: 'Story', id: 'story' },
  { label: 'Menu', id: 'menu' },
  { label: 'Visit Us', id: 'visit' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('cocoa-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('cocoa-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      if (open) setOpen(false);

      const offsets = links
        .map((l) => ({ id: l.id, top: document.getElementById(l.id)?.offsetTop ?? 0 }))
        .filter((s) => s.top <= window.scrollY + 120);
      if (offsets.length) setActive(offsets[offsets.length - 1].id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!open) onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-solid' : ''}`}>
      <div className="container navbar-inner">
        <a href="#home" className="logo">
          <span className="logo-script">the</span> Cocoa Bean
        </a>

        <ul className={`nav-links ${open ? 'nav-open' : ''}`}>
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={active === link.id ? 'nav-active' : ''}
                aria-current={active === link.id ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <a href="#reserve" className="btn btn-primary btn-nav">
            Reserve
          </a>
          <button
            className={`hamburger ${open ? 'hamburger-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}