import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'ABOUT', href: '#about', scroll: true },
    { name: 'SERVICES', href: '#services', scroll: true },
    { name: 'GALLERY', href: '#gallery', scroll: true },
    { name: 'CONTACT', href: '#enquiry', scroll: true },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleNavClick = (link: { href: string; scroll: boolean }) => {
    if (link.scroll) {
      scrollToSection(link.href);
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-brand-cream/95 backdrop-blur-sm z-50 border-b border-gray-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="hover:opacity-70 transition-opacity"
          >
            <img
              src="olajesu.png"
              alt="Olajesu Kitchen"
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="relative text-sm font-medium text-black hover:opacity-60 transition-opacity tracking-wide after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-brand-gold after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.name}
              </button>
            ))}
            <Link
              to="/catering"
              className={`text-sm font-medium text-black hover:opacity-60 transition-opacity tracking-wide ${
                location.pathname === '/catering' ? 'opacity-100 font-semibold' : ''
              }`}
            >
              CATERING
            </Link>
            <button
              onClick={() => scrollToSection('#enquiry')}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              GET QUOTE
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black hover:opacity-60 transition-opacity"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brand-cream border-t border-gray-200">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left text-sm font-medium text-black hover:opacity-60 py-2 transition-opacity tracking-wide"
              >
                {link.name}
              </button>
            ))}
            <Link
              to="/catering"
              onClick={() => setIsOpen(false)}
              className={`block w-full text-left text-sm font-medium text-black hover:opacity-60 py-2 transition-opacity tracking-wide ${
                location.pathname === '/catering' ? 'font-semibold' : ''
              }`}
            >
              CATERING
            </Link>
            <button
              onClick={() => scrollToSection('#enquiry')}
              className="block w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-6 py-3 rounded-full text-sm font-semibold transition-all"
            >
              GET QUOTE
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
