import './Footer.css';

const quickLinks = ['Home', 'Our Story', 'Menu', 'Visit Us'];

const socials = [
  {
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 8h3V5h-3a4 4 0 00-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Footer() {
  const ids = { Home: 'home', 'Our Story': 'story', Menu: 'menu', 'Visit Us': 'visit' };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a href="#home" className="logo footer-logo">
            <span className="logo-script">the</span> Cocoa Bean
          </a>
          <p className="footer-tag">
            Elegant coffee, crafted moments. Brewed with love since 2012.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="footer-links">
            {quickLinks.map((l) => (
              <li key={l}>
                <a href={`#${ids[l]}`}>{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>24 Mocha Lane, Brewery District</li>
            <li>+91 98XXX XXXXX</li>
            <li>hello@cocoabean.cafe</li>
          </ul>
        </div>

        <div>
          <h4>Follow Us</h4>
          <div className="footer-social">
            {socials.map((s) => (
              <a key={s.label} href="#home" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} The Cocoa Bean. All rights reserved.</p>
      </div>
    </footer>
  );
}