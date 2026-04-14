import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'ABOUT', href: '#about' },
    { name: 'MENU', href: '#services' },
    { name: 'WHY US', href: '#benefits' },
    { name: 'CONTACT', href: '#enquiry' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-brand-cream/95 backdrop-blur-sm z-50 border-b border-brand-gold/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="hover:opacity-70 transition-opacity"
          >
            <img
              src="/olajesu.png"
              alt="Olajesu Kitchen"
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors tracking-wider"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#enquiry')}
              className="bg-brand-dark hover:bg-brand-green text-white px-8 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-300"
            >
              Get Quote
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-brand-dark hover:opacity-60 transition-opacity"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-gold/10">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-sm font-medium text-brand-dark/70 hover:text-brand-dark py-2 transition-colors tracking-wider"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#enquiry')}
              className="block w-full bg-brand-dark hover:bg-brand-green text-white px-6 py-3 text-sm font-medium tracking-wider uppercase transition-all mt-4"
            >
              Get Quote
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
