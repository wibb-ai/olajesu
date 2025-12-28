import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';

const images = [
  {
    url: 'https://images.pexels.com/photos/8753657/pexels-photo-8753657.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Nigerian Jollof Rice'
  },
  {
    url: 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Nigerian Meal Prep'
  },
  {
    url: 'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Catering Setup'
  },
  {
    url: 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Traditional Nigerian Cooking'
  },
  {
    url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Nigerian Cuisine Spread'
  }
];

interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: { text: string; link: string };
  microCopy?: string;
}

export default function Hero({ 
  title = "Authentic Nigerian Flavors",
  subtitle = "Your perfect spot for authentic Nigerian cuisine, catering, and meal prep",
  primaryCTA = "Enquire Now",
  secondaryCTA,
  microCopy
}: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToEnquiry = () => {
    document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageIndex = (offset: number) => {
    return (currentIndex + offset + images.length) % images.length;
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-brand-cream px-6 py-24">
      <div className="flex items-center gap-2 mb-10">
        <span className="text-sm font-medium text-gray-700">Google</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-black text-black" />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">(4.9)</span>
      </div>

      <div className="text-center mb-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-brand-dark mb-6 tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={scrollToEnquiry}
            className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-10 py-4 rounded-full text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {primaryCTA}
          </button>
          {secondaryCTA && (
            <Link
              to={secondaryCTA.link}
              className="flex items-center gap-2 text-brand-green hover:text-brand-dark font-medium transition-colors duration-200"
            >
              {secondaryCTA.text}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {microCopy && (
          <p className="mt-4 text-sm md:text-sm text-gray-700">
            {microCopy}
          </p>
        )}
      </div>

      <div className="relative w-full max-w-6xl mt-14 mb-6">
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-[280px] md:w-[320px] h-[350px] md:h-[420px] transform -rotate-6">
            <img
              src={images[getImageIndex(-1)].url}
              alt={images[getImageIndex(-1)].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>

          <div className="relative z-20 w-[300px] md:w-[380px] h-[380px] md:h-[480px]">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>

          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-[280px] md:w-[320px] h-[350px] md:h-[420px] transform rotate-6">
            <img
              src={images[getImageIndex(1)].url}
              alt={images[getImageIndex(1)].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        <button
          onClick={prevImage}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>

      <div className="flex gap-2 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-black w-8' : 'bg-gray-400'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
