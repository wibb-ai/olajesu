import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { ScribbleUnderline, WaveDecoration } from './DecorativeElements';
import Modal from './Modal';
import { services, Service } from '../data/servicesData';

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section className="py-24 bg-gradient-to-br from-brand-cream to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 text-brand-cream/50 transform rotate-180">
        <WaveDecoration className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 text-white">
        <WaveDecoration className="w-full h-full" />
      </div>

      <div className="absolute top-20 right-10 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-5xl font-bold text-brand-dark mb-4 relative inline-block">
            What We Offer
            <div className="absolute -bottom-2 left-0 right-0">
              <ScribbleUnderline className="w-full h-3 text-brand-gold" />
            </div>
          </h2>
          <div className="h-6"></div>
          <p className="text-xl text-brand-green max-w-3xl mx-auto">
            Three premium services designed to bring authentic Nigerian cuisine to your table
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={`h-64 bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-20 h-20 border-4 border-brand-dark rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-brand-dark rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-brand-dark rotate-45"></div>
                  </div>
                  <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`w-24 h-24 ${service.iconColor}`} />
                    <Sparkles className={`w-8 h-8 ${service.iconColor} absolute -top-2 -right-2 animate-pulse`} />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-brand-dark mb-4">{service.title}</h3>
              
               
                  <div className="pt-4 border-t border-brand-gold/30 mb-6">
                    <p className="text-sm text-brand-green/60 italic">
                      {service.id === 'meal-prep' && 'Popular dishes: '}
                      {service.id === 'catering' && 'Event types: '}
                      {service.id === 'takeaway' && 'Available on: '}
                      {service.highlights.slice(0, 4).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedService(service)}
                    className={`w-full bg-gradient-to-r ${service.gradientFrom} ${service.gradientTo} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                  >
                    Read More
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-8 relative z-10">
          <h3 className="text-2xl font-bold text-brand-dark mb-3">Meal Prep Portion Options</h3>
          <p className="text-brand-green text-sm mb-4">
            For meal prep, we can prepare your favourite dishes in larger, convenient portions so you can enjoy them all
            week.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-brand-green">
            <div>
              <p className="font-semibold mb-1">Rice Dishes</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Single tray of Jollof or Fried Rice</li>
                <li>Half cooler of Jollof or Fried Rice</li>
                <li>Family-size party portions</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Soups & Stews</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Egusi, Efo Riro, Ayamase and more in family-size tubs</li>
                <li>Mix-and-match portions for the week</li>
                <li>Custom bulk orders on request</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-brand-green/80">
            Tell us your preferred portion sizes in the enquiry form and we&apos;ll tailor a meal prep package to suit
            you.
          </p>
        </div>
      </div>

      <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)}>
        {selectedService && (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${selectedService.gradientFrom} ${selectedService.gradientTo} rounded-2xl flex items-center justify-center`}>
                {(() => {
                  const IconComponent = selectedService.icon;
                  return <IconComponent className={`w-8 h-8 ${selectedService.iconColor}`} />;
                })()}
              </div>
              <h3 className="text-3xl font-bold text-brand-dark">{selectedService.title}</h3>
            </div>

            <div className="mb-6">
              <p className="text-brand-green leading-relaxed text-lg">
                {selectedService.detailedDescription}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-brand-dark mb-4">Key Features</h4>
              <ul className="grid md:grid-cols-2 gap-3">
                {selectedService.features.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <li key={idx} className="flex items-start">
                      <FeatureIcon className="w-5 h-5 text-brand-gold mr-3 mt-1 flex-shrink-0" />
                      <span className="text-brand-green">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-brand-dark mb-4">
                {selectedService.id === 'meal-prep' && 'Popular Dishes'}
                {selectedService.id === 'catering' && 'Event Types'}
                {selectedService.id === 'takeaway' && 'Order Options'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 bg-gradient-to-r ${selectedService.gradientFrom} ${selectedService.gradientTo} text-white rounded-full text-sm font-medium`}
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-brand-gold/30">
              <p className="text-brand-green/80 leading-relaxed">
                {selectedService.additionalInfo}
              </p>
            </div>

            <div className="mt-8">
              <a
                href="#contact"
                onClick={() => setSelectedService(null)}
                className={`w-full block text-center bg-gradient-to-r ${selectedService.gradientFrom} ${selectedService.gradientTo} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
