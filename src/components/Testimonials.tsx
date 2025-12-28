import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      quote: "The pastries are fresh, and the lattes are always perfectly made. Whether I'm working or meeting friends, it's the perfect place.",
      name: "James L.",
      title: "Coffee Enthusiast"
    },
    {
      quote: "Olajesu Kitchen brings authentic Nigerian flavors to life. The jollof rice is incredible, and the meal prep service has been a game-changer for our busy family.",
      name: "Adaeze O.",
      title: "Regular Customer"
    },
    {
      quote: "Their catering service made our wedding unforgettable. Every dish was perfectly seasoned and our guests couldn't stop raving about the authentic Nigerian cuisine.",
      name: "Michael T.",
      title: "Wedding Client"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-green/95 via-brand-green/90 to-brand-dark/85" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-8 max-w-2xl" style={{ fontStyle: 'italic' }}>
              What Our Customers Love About Their Cafe Experience — Real Stories from Our Regulars
            </h2>

            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <ThumbsUp className="w-6 h-6 text-white" />
              <div>
                <p className="text-2xl font-bold">4.9/5</p>
                <p className="text-sm text-white/80">Customer Rating on</p>
                <p className="font-semibold">Google Reviews</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[400px] flex items-center justify-center">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ${
                    currentIndex === index
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="bg-brand-cream rounded-3xl p-10 shadow-2xl h-full flex flex-col justify-center">
                    <div className="text-brand-gold text-6xl mb-6 font-serif leading-none">"</div>

                    <p className="text-brand-green text-lg leading-relaxed mb-8 text-center italic">
                      {testimonial.quote}
                    </p>

                    <div className="text-center">
                      <p className="text-brand-dark font-bold text-xl mb-1">
                        {testimonial.name}
                      </p>
                      <p className="text-brand-green text-sm">
                        {testimonial.title}
                      </p>
                    </div>

                    <div className="flex justify-center gap-2 mt-8">
                      {testimonials.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          onClick={() => setCurrentIndex(dotIndex)}
                          className="transition-all duration-300"
                          aria-label={`Go to testimonial ${dotIndex + 1}`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              currentIndex === dotIndex
                                ? 'bg-brand-gold w-8'
                                : 'bg-brand-gold/40 w-2 hover:bg-brand-gold/60'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
