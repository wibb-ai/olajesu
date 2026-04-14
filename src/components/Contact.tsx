import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

export default function Contact() {
  const { contact, business } = businessConfig;

  return (
    <section className="py-32 bg-brand-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-green/60">
              Contact
            </span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark tracking-tight mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-brand-green/70 max-w-xl mx-auto font-light">
            We're here to serve you authentic Nigerian cuisine
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Phone */}
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="group text-center"
          >
            <div className="w-16 h-16 border border-brand-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold/10 transition-all duration-300">
              <Phone className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark mb-3">
              Call Us
            </h3>
            <p className="text-xl font-bold text-brand-dark group-hover:text-brand-green transition-colors mb-1">
              {contact.phone}
            </p>
            <p className="text-xs text-brand-green/50 uppercase tracking-wider">
              Tap to call
            </p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${contact.email}`}
            className="group text-center"
          >
            <div className="w-16 h-16 border border-brand-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold/10 transition-all duration-300">
              <Mail className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark mb-3">
              Email Us
            </h3>
            <p className="text-lg font-bold text-brand-dark group-hover:text-brand-green transition-colors mb-1 break-all">
              {contact.email}
            </p>
            <p className="text-xs text-brand-green/50 uppercase tracking-wider">
              Tap to email
            </p>
          </a>

          {/* Address */}
          <div className="text-center">
            <div className="w-16 h-16 border border-brand-gold/30 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark mb-3">
              Location
            </h3>
            <p className="text-brand-green/70 leading-relaxed">
              {contact.address.full}
            </p>
          </div>

          {/* Operating Hours */}
          <div className="text-center">
            <div className="w-16 h-16 border border-brand-gold/30 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-brand-dark mb-3">
              Hours
            </h3>
            <div className="text-brand-green/70 space-y-1">
              <p>Mon: {business.operatingHours.monday}</p>
              <p>Tue-Thu: {business.operatingHours.tuesday}</p>
              <p>Fri-Sat: {business.operatingHours.friday}</p>
              <p>Sun: {business.operatingHours.sunday}</p>
            </div>
          </div>
        </div>

        {/* Response time indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-brand-gold/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-brand-green/60">
              We typically respond within 24 hours
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
