import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import MenuPanel from '../components/MenuPanel.jsx';
import Stats from '../components/Stats.jsx';
import WhyUs from '../components/WhyUs.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Gallery from '../components/Gallery.jsx';
import VisitUs from '../components/VisitUs.jsx';
import Reservation from '../components/Reservation.jsx';
import Newsletter from '../components/Newsletter.jsx';
import Footer from '../components/Footer.jsx';
import Preloader from '../components/Preloader.jsx';
import BackToTop from '../components/BackToTop.jsx';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <MenuPanel variant="preview" limit={6} />
        <Stats />
        <WhyUs />
        <Testimonials />
        <Gallery />
        <VisitUs />
        <Reservation />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

export default Home;