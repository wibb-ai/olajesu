import { Star, ChevronDown } from 'lucide-react';

export default function CateringHero() {
  const scrollToEnquiry = () => {
    document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMenu = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col bg-brand-cream overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        <div className="text-center max-w-5xl">
          {/* Small label */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-green">
              Premium Catering
            </span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>

          {/* Main Title */}
          <h1 className="mb-6">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-brand-dark tracking-tight">
              Elevate Your
            </span>
            <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-brand-dark tracking-tight mt-2">
              Event
            </span>
          </h1>

          {/* Elegant divider */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px w-16 bg-brand-gold/40" />
            <div className="w-2 h-2 rotate-45 bg-brand-gold" />
            <div className="h-px w-16 bg-brand-gold/40" />
          </div>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-brand-green/80 max-w-2xl mx-auto leading-relaxed font-light">
            Authentic Nigerian cuisine crafted for your most memorable occasions. 
            From intimate gatherings to grand celebrations.
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 mb-12">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <span className="text-sm text-brand-green/70">4.9 on Google</span>
            </div>
            <div className="h-4 w-px bg-brand-green/20" />
            <span className="text-sm text-brand-green/70">500+ Events Served</span>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <button
              onClick={scrollToEnquiry}
              className="group bg-brand-dark hover:bg-brand-green text-white px-12 py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300"
            >
              Request a Quote
            </button>
          </div>
        </div>
      </div>

      {/* Bottom section with scroll indicator */}
      <div className="pb-12 flex flex-col items-center gap-4">
        <button 
          onClick={scrollToMenu}
          className="flex flex-col items-center gap-2 text-brand-green/50 hover:text-brand-green transition-colors group"
        >
          <span className="text-xs font-medium tracking-widest uppercase">View Menu</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-brand-gold/20" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-brand-gold/20" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-brand-gold/20" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-brand-gold/20" />
    </section>
  );
}
