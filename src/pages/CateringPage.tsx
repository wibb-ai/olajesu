import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import EnquiryForm from '../components/EnquiryForm';
import Contact from '../components/Contact';
import CateringMenu from '../components/CateringMenu';
import { CartProvider } from '../context/CartContext';
import { ScribbleUnderline, DotPattern } from '../components/DecorativeElements';

export default function CateringPage() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
        <div id="hero">
          <Hero 
            title="Catering Services"
            subtitle="Make your event unforgettable with authentic Nigerian cuisine"
            primaryCTA="Get Quote"
            secondaryCTA={{ text: "Looking for takeaway?", link: "/" }}
            microCopy="Professional catering for events of all sizes. Minimum order lead time: 48 hours. Browse our menu and contact us for custom quotes."
          />
        </div>

        {/* About Catering Section */}
        <section id="about" className="py-24 bg-white relative overflow-hidden">
          <DotPattern className="absolute inset-0 text-brand-green opacity-30" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 relative">
              <h2 className="text-5xl font-bold text-brand-dark mb-4 relative inline-block">
                About Our Catering Service
                <div className="absolute -bottom-2 left-0 right-0">
                  <ScribbleUnderline className="w-full h-3 text-brand-gold" />
                </div>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16 relative z-10">
              <div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold to-brand-green rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                  <img
                    src="https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Catering setup"
                    className="rounded-2xl shadow-2xl w-full h-[500px] object-cover relative z-10 ring-4 ring-brand-gold/20"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-brand-green leading-relaxed">
                  Transform your special occasions into memorable culinary experiences with our professional catering service. Whether you're hosting an intimate dinner party, a corporate event, or a grand wedding celebration, we provide authentic Nigerian cuisine that impresses guests and honors traditions.
                </p>
                <p className="text-lg text-brand-green leading-relaxed">
                  Our experienced team handles everything from menu planning to setup and service, ensuring your event runs smoothly while you focus on your guests. Every dish is carefully crafted using traditional recipes and fresh ingredients, maintaining the authentic flavors you love.
                </p>
                <p className="text-lg text-brand-green leading-relaxed">
                  We cater events of all sizes, from intimate gatherings of 20 guests to large celebrations of 500+. Minimum order lead time is 48 hours to ensure the freshest preparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catering Menu Section */}
        <section id="services" className="py-24 bg-white">
          <CateringMenu />
        </section>

        {/* Benefits Section - New Design */}
        <section id="gallery" className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header Section - Title Left, Description Right */}
            <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-brand-dark mb-6 leading-tight">
                  Why Choose<br />Our Catering?
                </h2>
              </div>
              <div className="pt-4">
                <p className="text-lg text-brand-green/80 leading-relaxed">
                  We provide the best catering services with a guarantee. We are the premier Nigerian catering service in Manchester and always bring the best options for our customers and clients. We never compromise on quality or authenticity. Every dish is crafted with traditional recipes, fresh ingredients, and a commitment to excellence that makes your event truly memorable.
                </p>
              </div>
            </div>

            {/* Central Visual with Content Blocks Around */}
            <div className="relative">
              {/* Central Image with Curved Background */}
              <div className="relative flex items-center justify-center my-16 md:my-24">
                {/* Curved Gradient Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-2xl h-[600px] md:h-[700px] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/20 via-brand-cream/30 to-brand-gold/10 rounded-[50%] transform scale-y-[0.6]"></div>
                    {/* Subtle dashed lines */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 border-l-2 border-dashed border-brand-gold/20"></div>
                  </div>
                </div>
                
                {/* Central Image */}
                <div className="relative z-10 w-full max-w-md md:max-w-lg">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold to-brand-green rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src="https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Catering service"
                      className="rounded-3xl shadow-2xl w-full h-[500px] md:h-[600px] object-cover relative z-10 ring-4 ring-brand-gold/20"
                    />
                  </div>
                </div>
              </div>

              {/* Content Blocks - Arranged Around Central Image */}
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 relative z-20">
                {/* Left Side - Top Block */}
                <div className="md:pr-8 lg:pr-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">Authentic Heritage</h3>
                  <p className="text-brand-gold font-semibold mb-3">Traditional Recipes That Matter</p>
                  <p className="text-brand-green leading-relaxed">
                    Our team has an in-depth understanding of authentic Nigerian cuisine. Every dish is prepared using traditional recipes passed down through generations, ensuring the authentic flavors you love.
                  </p>
                </div>

                {/* Right Side - Top Block */}
                <div className="md:pl-8 lg:pl-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">Professional Excellence</h3>
                  <p className="text-brand-gold font-semibold mb-3">Your Success Is Our Priority</p>
                  <p className="text-brand-green leading-relaxed">
                    Our experienced team handles everything from menu planning to setup and service. We ensure your event runs smoothly so you can focus on your guests and enjoy the celebration.
                  </p>
                </div>

                {/* Left Side - Bottom Block */}
                <div className="md:pr-8 lg:pr-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">Flexible Service</h3>
                  <p className="text-brand-gold font-semibold mb-3">Tailored To Your Needs</p>
                  <p className="text-brand-green leading-relaxed">
                    We provide customized solutions to meet your unique event requirements. From intimate gatherings of 20 to grand celebrations of 500+, we scale seamlessly to your needs.
                  </p>
                </div>

                {/* Right Side - Bottom Block */}
                <div className="md:pl-8 lg:pl-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">Trusted Reputation</h3>
                  <p className="text-brand-gold font-semibold mb-3">Trusted By Many</p>
                  <p className="text-brand-green leading-relaxed">
                    We are proud to have served 500+ events across Manchester and have received accolades for our outstanding service. Our 4.9-star rating reflects our commitment to excellence.
                  </p>
                </div>
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

