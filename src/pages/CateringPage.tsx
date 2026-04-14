import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquiryForm from '../components/EnquiryForm';
import Contact from '../components/Contact';
import CateringMenu from '../components/CateringMenu';
import CateringHero from '../components/CateringHero';
import { CartProvider } from '../context/CartContext';

export default function CateringPage() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          {/* Minimal Hero */}
          <div id="hero">
            <CateringHero />
          </div>

          {/* About Catering Section - Elegant Design */}
          <section id="about" className="py-32 bg-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
            
            <div className="max-w-6xl mx-auto px-6">
              {/* Section header */}
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-brand-gold" />
                  <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-green/60">
                    Our Promise
                  </span>
                  <div className="h-px w-8 bg-brand-gold" />
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark tracking-tight">
                  Crafted With Care
                </h2>
              </div>

              {/* Main statement */}
              <div className="max-w-3xl mx-auto text-center mb-16">
                <p className="text-xl md:text-2xl text-brand-dark font-light leading-relaxed">
                  Transform your special occasions into memorable culinary experiences. 
                  We bring the authentic taste of Nigeria to your most important moments.
                </p>
              </div>
              
              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-8 bg-brand-gold" />
                    <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark">
                      Full Service
                    </h3>
                  </div>
                  <p className="text-brand-green/70 leading-relaxed pl-4">
                    From menu planning to setup and service, our experienced team handles every detail so you can focus on your guests.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-8 bg-brand-gold" />
                    <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark">
                      Any Scale
                    </h3>
                  </div>
                  <p className="text-brand-green/70 leading-relaxed pl-4">
                    From intimate gatherings of 20 to grand celebrations of 500+, we scale seamlessly to your event's needs.
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="border-t border-b border-brand-gold/20 py-12">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-4xl md:text-5xl font-bold text-brand-dark">48</span>
                      <span className="text-xl md:text-2xl font-light text-brand-green/50 ml-1">hrs</span>
                    </div>
                    <p className="text-xs md:text-sm text-brand-green/60 uppercase tracking-wider">Minimum Lead Time</p>
                  </div>
                  <div className="text-center border-l border-r border-brand-gold/20">
                    <div className="mb-2">
                      <span className="text-4xl md:text-5xl font-bold text-brand-dark">500</span>
                      <span className="text-xl md:text-2xl font-light text-brand-green/50 ml-1">+</span>
                    </div>
                    <p className="text-xs md:text-sm text-brand-green/60 uppercase tracking-wider">Events Catered</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-4xl md:text-5xl font-bold text-brand-dark">4.9</span>
                      <span className="text-xl md:text-2xl font-light text-brand-green/50 ml-1">★</span>
                    </div>
                    <p className="text-xs md:text-sm text-brand-green/60 uppercase tracking-wider">Google Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Catering Menu Section */}
          <section id="services">
            <CateringMenu />
          </section>

          {/* Benefits Section - Clean Grid, No Images */}
          <section id="benefits" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              {/* Header */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 uppercase tracking-wide">
                  Why Choose Us
                </h2>
                <div className="w-24 h-1 bg-brand-gold mx-auto mb-6" />
                <p className="text-lg text-brand-green/80 max-w-2xl mx-auto leading-relaxed">
                  We are the premier Nigerian catering service in Manchester. We never compromise on quality or authenticity.
                </p>
              </div>

              {/* Benefits Grid - 2x2 */}
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                {/* Benefit 1 */}
                <div className="border-l-2 border-brand-gold pl-6">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2 uppercase tracking-wide">
                    Authentic Heritage
                  </h3>
                  <p className="text-brand-gold font-semibold mb-3 text-sm uppercase tracking-wider">
                    Traditional Recipes That Matter
                  </p>
                  <p className="text-brand-green/80 leading-relaxed">
                    Every dish is prepared using traditional recipes passed down through generations, ensuring the authentic flavors you love.
                  </p>
                </div>

                {/* Benefit 2 */}
                <div className="border-l-2 border-brand-gold pl-6">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2 uppercase tracking-wide">
                    Professional Excellence
                  </h3>
                  <p className="text-brand-gold font-semibold mb-3 text-sm uppercase tracking-wider">
                    Your Success Is Our Priority
                  </p>
                  <p className="text-brand-green/80 leading-relaxed">
                    Our experienced team handles everything from menu planning to setup and service, ensuring your event runs smoothly.
                  </p>
                </div>

                {/* Benefit 3 */}
                <div className="border-l-2 border-brand-gold pl-6">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2 uppercase tracking-wide">
                    Flexible Service
                  </h3>
                  <p className="text-brand-gold font-semibold mb-3 text-sm uppercase tracking-wider">
                    Tailored To Your Needs
                  </p>
                  <p className="text-brand-green/80 leading-relaxed">
                    From intimate gatherings of 20 to grand celebrations of 500+, we scale seamlessly to meet your unique requirements.
                  </p>
                </div>

                {/* Benefit 4 */}
                <div className="border-l-2 border-brand-gold pl-6">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2 uppercase tracking-wide">
                    Trusted Reputation
                  </h3>
                  <p className="text-brand-gold font-semibold mb-3 text-sm uppercase tracking-wider">
                    500+ Events Served
                  </p>
                  <p className="text-brand-green/80 leading-relaxed">
                    Our 4.9-star rating reflects our commitment to excellence and the trust our clients place in us.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <EnquiryForm defaultServiceType="catering" />
          <Contact />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
