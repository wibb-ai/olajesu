import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import OrderingButtons from './OrderingButtons';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { contact } = businessConfig;

  return (
    <footer className="bg-brand-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-brand-gold">Olajesu Kitchen</h3>
            <p className="text-brand-cream leading-relaxed mb-4">
              Bringing authentic Nigerian cuisine to Manchester through premium meal prep
              and catering services.
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-brand-cream hover:text-brand-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-brand-cream hover:text-brand-gold transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </a>
              <div className="flex items-start gap-2 text-brand-cream text-sm">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{contact.address.full}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-brand-cream">
              <li>
                <a href="#about" className="hover:text-brand-gold transition-colors">About Us</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-gold transition-colors">Our Services</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-brand-gold transition-colors">Gallery</a>
              </li>
              <li>
                <a href="#enquiry" className="hover:text-brand-gold transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Order Now</h4>
            <div className="space-y-3">
              <OrderingButtons variant="compact" showCallButton={false} />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-brand-cream">
              <li>
                <a href="#privacy" className="hover:text-brand-gold transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-brand-gold transition-colors">Terms & Conditions</a>
              </li>
              <li>
                <a href="#gdpr" className="hover:text-brand-gold transition-colors">GDPR Compliance</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-gold/30 pt-8 text-center">
          <p className="text-brand-cream flex items-center justify-center gap-2">
            © {currentYear} Olajesu Kitchen. Made with <Heart className="w-4 h-4 text-brand-gold fill-current" /> in Manchester
          </p>
          <p className="text-brand-cream/60 text-sm mt-2">
            All Rights Reserved | Authentic Nigerian Cuisine
          </p>
        </div>
      </div>
    </footer>
  );
}
