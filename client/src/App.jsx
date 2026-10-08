import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import FeaturedMenu from './components/FeaturedMenu.jsx';
import Stats from './components/Stats.jsx';
import WhyUs from './components/WhyUs.jsx';
import Testimonials from './components/Testimonials.jsx';
import Gallery from './components/Gallery.jsx';
import VisitUs from './components/VisitUs.jsx';
import Reservation from './components/Reservation.jsx';
import Newsletter from './components/Newsletter.jsx';
import Footer from './components/Footer.jsx';
import Preloader from './components/Preloader.jsx';
import BackToTop from './components/BackToTop.jsx';

function App() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <FeaturedMenu />
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

export default App;