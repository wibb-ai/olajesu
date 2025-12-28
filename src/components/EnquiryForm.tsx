import { useState, FormEvent, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartSummary from './CartSummary';

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

    if (!formData.consent_given) {
      setError('Please provide consent to store your details');
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
    <section id="enquiry" className="py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
              <div className="mb-8">
              <div className="text-brand-gold text-4xl mb-4">✨</div>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-6" style={{ fontStyle: 'italic' }}>
                Get In Touch
              </h2>
              <p className="text-brand-green text-sm italic mb-6">
                Ready to experience authentic Nigerian cuisine? Whether it&apos;s collection, meal prep, or catering -
                we&apos;ve got you covered. Call in for cheaper takeaway pricing and free delivery from £30, or tell us
                your preferred meal prep portions and we&apos;ll build a package around you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <CartSummary />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="block text-xs text-brand-green mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs text-brand-green mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                    placeholder="(555) 00-00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs text-brand-green mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label htmlFor="service_type" className="block text-xs text-brand-green mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="service_type"
                  required
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value as 'meal-prep' | 'catering' | 'other' })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                >
                  <option value="meal-prep">Meal Prep Service</option>
                  <option value="catering">Catering Service</option>
                  <option value="other">Collection / Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event_date" className="block text-xs text-brand-green mb-1">
                    Required Date
                  </label>
                  <input
                    type="date"
                    id="event_date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="event_size" className="block text-xs text-brand-green mb-1">
                    {formData.service_type === 'meal-prep' ? 'Portions' : formData.service_type === 'catering' ? 'Guests' : 'Quantity'}
                  </label>
                  <input
                    type="text"
                    id="event_size"
                    value={formData.event_size}
                    onChange={(e) => setFormData({ ...formData, event_size: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                    placeholder={formData.service_type === 'meal-prep' ? '5 meals/week' : formData.service_type === 'catering' ? '50 guests' : 'Number'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-xs text-brand-green mb-1">
                    Location (Postcode/Town)
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                    placeholder="M1 1AA / Manchester"
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-xs text-brand-green mb-1">
                    Budget Estimate
                  </label>
                  <input
                    type="text"
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all text-sm"
                    placeholder="£500 - £1000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="additional_comments" className="block text-xs text-brand-green mb-1">
                  Notes
                </label>
                <textarea
                  id="additional_comments"
                  rows={5}
                  value={formData.additional_comments}
                  onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all resize-none text-sm"
                  placeholder="Selected items will appear here automatically. You can add additional notes, dietary requirements, or special requests..."
                ></textarea>
              </div>

              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent_given}
                    onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                    className="mt-1 w-4 h-4 text-brand-gold border-brand-gold rounded focus:ring-brand-gold"
                  />
                  <span className="ml-2 text-xs text-brand-green">
                    I consent to having my details stored and contacted in relation to this enquiry. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-green hover:bg-brand-dark disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          </div>

          <div
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
              <div className="grid grid-cols-2 gap-6 text-white">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs mb-1 opacity-80">Phone</p>
                  <p className="font-semibold">+44 7123 456789</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs mb-1 opacity-80">Email</p>
                  <p className="font-semibold text-sm">info@olajesukitchen.co.uk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
