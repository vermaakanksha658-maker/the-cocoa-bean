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
            <h1>Explore the Cocoa Bean Menu</h1>
            <p>Brewed to order, baked at dawn — every sip and bite tells a story.</p>
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