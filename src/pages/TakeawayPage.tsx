import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import EnquiryForm from '../components/EnquiryForm';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { CartProvider } from '../context/CartContext';

export default function TakeawayPage() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
        <div id="hero">
          <Hero 
            title="Authentic Nigerian Flavors"
            subtitle="Your perfect spot for authentic Nigerian cuisine, catering, and meal prep"
            primaryCTA="Enquire Now"
            secondaryCTA={{ text: "Looking for catering?", link: "/catering" }}
            microCopy="Takeaway via Uber Eats / Just Eat or direct call. Call-in prices are lower, with free delivery from £30. Meal prep available for bulk portions."
          />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="services">
          <Services />
        </div>
        <div id="gallery">
          <Gallery />
        </div>
        <Testimonials />
        <EnquiryForm />
        <Contact />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

