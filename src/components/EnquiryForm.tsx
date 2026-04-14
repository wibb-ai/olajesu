import { useState, FormEvent, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useCart } from '../context/CartContext';
import CartSummary from './CartSummary';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const MIN_SUBMISSION_TIME_MS = 3000;

interface FormData {
  customer_name: string;
  email: string;
  phone?: string;
  service_type: 'meal-prep' | 'catering' | 'other';
  event_size?: string;
  event_date?: string;
  location?: string;
  budget?: string;
  additional_comments?: string;
  consent_given: boolean;
}

interface EnquiryFormProps {
  defaultServiceType?: 'meal-prep' | 'catering' | 'other';
}

export default function EnquiryForm({ defaultServiceType = 'meal-prep' }: EnquiryFormProps) {
  const { items, getFormattedNotes, clearCart } = useCart();
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    email: '',
    phone: '',
    service_type: defaultServiceType,
    event_size: '',
    event_date: '',
    location: '',
    budget: '',
    additional_comments: '',
    consent_given: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadTime = useRef(Date.now());
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Auto-populate notes with cart items
  useEffect(() => {
    const cartNotes = getFormattedNotes();
    const currentValue = formData.additional_comments || '';
    
    // Extract user's custom notes (everything after cart items)
    const cartSectionEnd = currentValue.indexOf('\n\n', currentValue.indexOf('Selected Items:'));
    const userNotes = cartSectionEnd > -1 ? currentValue.substring(cartSectionEnd + 2).trim() : 
                     (currentValue && !currentValue.startsWith('Selected Items:') ? currentValue : '');
    
    if (cartNotes) {
      const newValue = cartNotes + (userNotes ? '\n\n' + userNotes : '');
      if (newValue !== currentValue) {
        setFormData((prev) => ({
          ...prev,
          additional_comments: newValue,
        }));
      }
    } else if (userNotes !== currentValue) {
      // Cart is empty, keep only user notes
      setFormData((prev) => ({
        ...prev,
        additional_comments: userNotes,
      }));
    }
  }, [items, getFormattedNotes]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Bot detection: honeypot field should be empty
    if (honeypot) {
      setError('Submission blocked. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Bot detection: check minimum time before submission
    const timeSinceLoad = Date.now() - formLoadTime.current;
    if (timeSinceLoad < MIN_SUBMISSION_TIME_MS) {
      setError('Please take your time filling out the form.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.consent_given) {
      setError('Please provide consent to store your details');
      setIsSubmitting(false);
      return;
    }

    // Turnstile validation (only if configured)
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the security verification');
      setIsSubmitting(false);
      return;
    }

    try {
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

      if (!accessKey) {
        throw new Error('Web3Forms access key is not configured');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('access_key', accessKey);
      formDataToSend.append('name', formData.customer_name);
      formDataToSend.append('email', formData.email);
      
      // Bot protection fields
      formDataToSend.append('botcheck', '');
      if (turnstileToken) {
        formDataToSend.append('cf-turnstile-response', turnstileToken);
      }

      if (formData.phone) formDataToSend.append('phone', formData.phone);
      formDataToSend.append('service_type', formData.service_type);
      if (formData.event_size) formDataToSend.append('event_size', formData.event_size);
      if (formData.event_date) formDataToSend.append('event_date', formData.event_date);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.budget) formDataToSend.append('budget', formData.budget);
      if (formData.additional_comments) formDataToSend.append('additional_comments', formData.additional_comments);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setIsSuccess(true);
      clearCart();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setFormData({
        customer_name: '',
        email: '',
        phone: '',
        service_type: defaultServiceType,
        event_size: '',
        event_date: '',
        location: '',
        budget: '',
        additional_comments: '',
        consent_given: false,
      });
    } catch (err) {
      setError('Failed to submit enquiry. Please try again or contact us directly.');
      console.error('Submission error:', err);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="enquiry" className="py-24 bg-gradient-to-br from-brand-cream to-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <CheckCircle className="w-20 h-20 text-brand-green mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-brand-dark mb-4">Thank You!</h2>
          <p className="text-xl text-brand-green mb-6">
            Your enquiry has been received successfully. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-8 py-3 rounded-full font-bold transition-all"
          >
            Submit Another Enquiry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="enquiry" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-green/60">
              Get Started
            </span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark tracking-tight mb-4">
            Request a Quote
          </h2>
          <p className="text-lg text-brand-green/70 max-w-xl mx-auto font-light">
            Tell us about your event and we'll craft a custom proposal for you.
          </p>
        </div>

        {/* Centered Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CartSummary />
            
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ 
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                opacity: 0,
                pointerEvents: 'none'
              }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                  placeholder="+44 7XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                Email <span className="text-brand-gold">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="service_type" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                Service Type <span className="text-brand-gold">*</span>
              </label>
              <select
                id="service_type"
                required
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value as 'meal-prep' | 'catering' | 'other' })}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark"
              >
                <option value="meal-prep">Meal Prep Service</option>
                <option value="catering">Catering Service</option>
                <option value="other">Collection / Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark"
                />
              </div>

              <div>
                <label htmlFor="event_size" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  {formData.service_type === 'meal-prep' ? 'Portions' : formData.service_type === 'catering' ? 'Guest Count' : 'Quantity'}
                </label>
                <input
                  type="text"
                  id="event_size"
                  value={formData.event_size}
                  onChange={(e) => setFormData({ ...formData, event_size: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                  placeholder={formData.service_type === 'meal-prep' ? '5 meals/week' : formData.service_type === 'catering' ? '50 guests' : 'Number'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                  placeholder="Manchester / M1 1AA"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30"
                  placeholder="£500 - £1000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="additional_comments" className="block text-sm font-medium tracking-wider uppercase text-brand-dark/70 mb-2">
                Additional Details
              </label>
              <textarea
                id="additional_comments"
                rows={4}
                value={formData.additional_comments}
                onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-brand-gold/20 focus:border-brand-gold focus:ring-0 transition-colors text-brand-dark placeholder:text-brand-green/30 resize-none"
                placeholder="Tell us about your event, dietary requirements, or special requests..."
              ></textarea>
            </div>

            <div className="pt-4">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent_given}
                  onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                  className="mt-0.5 w-5 h-5 border-2 border-brand-gold/30 rounded text-brand-gold focus:ring-brand-gold/20 transition-colors"
                />
                <span className="ml-3 text-sm text-brand-green/70 group-hover:text-brand-green transition-colors">
                  I consent to having my details stored and being contacted regarding this enquiry.
                </span>
              </label>
            </div>

            {/* Cloudflare Turnstile - invisible bot protection */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{
                    theme: 'light',
                    size: 'normal'
                  }}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (TURNSTILE_SITE_KEY && !turnstileToken)}
              className="w-full bg-brand-dark hover:bg-brand-green disabled:bg-gray-300 text-white px-8 py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300 disabled:cursor-not-allowed mt-8"
            >
              {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
