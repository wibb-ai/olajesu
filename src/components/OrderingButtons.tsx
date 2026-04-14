import { ShoppingBag, Phone } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

interface OrderingButtonsProps {
  variant?: 'default' | 'compact' | 'inline';
  showCallButton?: boolean;
}

export default function OrderingButtons({ variant = 'default', showCallButton = true }: OrderingButtonsProps) {
  const { ordering, contact } = businessConfig;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {ordering.uberEats.enabled && ordering.uberEats.url && (
          <a
            href={ordering.uberEats.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {ordering.uberEats.label}
          </a>
        )}
        {ordering.justEat.enabled && ordering.justEat.url && (
          <a
            href={ordering.justEat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {ordering.justEat.label}
          </a>
        )}
        {showCallButton && ordering.directCall.enabled && (
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4">
        {ordering.uberEats.enabled && ordering.uberEats.url && (
          <a
            href={ordering.uberEats.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green hover:text-brand-dark font-medium transition-colors text-sm"
          >
            {ordering.uberEats.label}
          </a>
        )}
        {ordering.justEat.enabled && ordering.justEat.url && (
          <a
            href={ordering.justEat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green hover:text-brand-dark font-medium transition-colors text-sm"
          >
            {ordering.justEat.label}
          </a>
        )}
        {showCallButton && ordering.directCall.enabled && (
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="text-brand-gold hover:text-brand-dark font-medium transition-colors text-sm"
          >
            {ordering.directCall.label}
          </a>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {ordering.uberEats.enabled && ordering.uberEats.url && (
        <a
          href={ordering.uberEats.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <ShoppingBag className="w-5 h-5" />
          {ordering.uberEats.label}
        </a>
      )}
      {ordering.justEat.enabled && ordering.justEat.url && (
        <a
          href={ordering.justEat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <ShoppingBag className="w-5 h-5" />
          {ordering.justEat.label}
        </a>
      )}
      {showCallButton && ordering.directCall.enabled && (
        <a
          href={`tel:${contact.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <Phone className="w-5 h-5" />
          {ordering.directCall.label}
        </a>
      )}
    </div>
  );
}

