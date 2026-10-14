import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import MenuPanel from '../components/MenuPanel.jsx';
import Footer from '../components/Footer.jsx';
import BackToTop from '../components/BackToTop.jsx';
import './MenuPage.css';

function MenuPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="menu-page">
        <div className="container">
          <div className="menu-page-head">
            <span className="kicker">our full menu</span>
            <h1>Explore Our Menu</h1>
            <p>Good Food. Good Mood. Great Memories. — every dish made fresh, every sip poured with care.</p>
            <ul className="menu-services">
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z" />
                  <path d="M20 11h1.5a2.5 2.5 0 0 1 0 5H20" />
                  <path d="M7 4.5c0 1.2-1.4 1.4-1.4 2.6M12 4c0 1.2-1.4 1.4-1.4 2.6M17 4.5c0 1.2-1.4 1.4-1.4 2.6" />
                </svg>
                Dine-in
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                Takeaway
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 16V7a1 1 0 0 1 1-1h9v10H3z" />
                  <path d="M13 10h4l3 3v3h-7" />
                  <circle cx="7" cy="18" r="1.8" />
                  <circle cx="17" cy="18" r="1.8" />
                </svg>
                Home delivery
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                No-contact delivery
              </li>
            </ul>
          </div>
        </div>
        <MenuPanel variant="full" />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

export default MenuPage;