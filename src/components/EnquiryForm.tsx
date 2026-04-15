import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useCart } from '../context/CartContext';
import CartSummary from './CartSummary';
import { AnimatedSection } from '../utils/animation';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const MIN_SUBMISSION_TIME_MS = 3000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;
const MAX_SUBMISSIONS_PER_SESSION = 5;

const clr = {
  card: '#EDE6D3',
  border: '#DDD6C4',
  green: '#1B4332',
  cream: '#F7F2E8',
  muted: '#6B6355',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: `1px solid ${clr.border}`,
  color: '#1A1A1A', padding: '14px 16px', fontFamily: 'sans-serif', fontSize: '14px',
  borderRadius: '2px', outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'sans-serif', fontSize: '11px',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: clr.muted, marginBottom: '8px',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()-]{7,20}$/;
const MAX_FIELD_LENGTH = 500;
const MAX_MESSAGE_LENGTH = 2000;

function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function validateFields(data: Record<string, string>): string | null {
  const name = data.name.trim();
  if (!name || name.length < 2) return 'Please enter your full name.';
  if (name.length > MAX_FIELD_LENGTH) return 'Name is too long.';

  const email = data.email.trim();
  if (!email) return 'Please enter your email address.';
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
  if (email.length > MAX_FIELD_LENGTH) return 'Email is too long.';

  if (data.phone && !PHONE_RE.test(data.phone.trim())) return 'Please enter a valid phone number.';
  if (data.event && data.event.length > MAX_FIELD_LENGTH) return 'Event type is too long.';

  if (data.guests) {
    const n = Number(data.guests);
    if (isNaN(n) || n < 1 || n > 10000) return 'Please enter a valid number of guests (1–10,000).';
  }

  if (data.message && data.message.length > MAX_MESSAGE_LENGTH) return 'Additional details is too long (max 2,000 characters).';

  return null;
}

export default function EnquiryForm() {
  const { items, getFormattedNotes, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', event: '', guests: '', date: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadTime = useRef(Date.now());
  const turnstileRef = useRef<TurnstileInstance>(null);
  const lastSubmitTime = useRef(0);
  const submitCount = useRef(0);

  useEffect(() => {
    const cartNotes = getFormattedNotes();
    const currentValue = formData.message || '';

    const cartMarker = 'Selected Items:';
    const markerIndex = currentValue.indexOf(cartMarker);

    let userNotes = '';
    if (markerIndex > -1) {
      const afterCart = currentValue.indexOf('\n\n', markerIndex);
      userNotes = afterCart > -1 ? currentValue.substring(afterCart + 2).trim() : '';
    } else {
      userNotes = currentValue;
    }

    let newValue: string;
    if (cartNotes) {
      newValue = cartNotes + (userNotes ? '\n\n' + userNotes : '');
    } else {
      newValue = userNotes;
    }

    if (newValue !== currentValue) {
      setFormData(p => ({ ...p, message: newValue }));
    }
  }, [items, getFormattedNotes]);

  const handleFieldChange = useCallback((key: string, raw: string) => {
    const value = key === 'message' ? raw : sanitize(raw);
    setFormData(p => ({ ...p, [key]: value }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (honeypot) { setIsSubmitting(false); return; }

    if (Date.now() - formLoadTime.current < MIN_SUBMISSION_TIME_MS) {
      setError('Please take your time filling out the form.'); setIsSubmitting(false); return;
    }

    if (submitCount.current >= MAX_SUBMISSIONS_PER_SESSION) {
      setError('Too many submissions. Please refresh the page or contact us directly.'); setIsSubmitting(false); return;
    }
    if (Date.now() - lastSubmitTime.current < RATE_LIMIT_COOLDOWN_MS && lastSubmitTime.current > 0) {
      const secsLeft = Math.ceil((RATE_LIMIT_COOLDOWN_MS - (Date.now() - lastSubmitTime.current)) / 1000);
      setError(`Please wait ${secsLeft} seconds before submitting again.`); setIsSubmitting(false); return;
    }

    const validationError = validateFields(formData);
    if (validationError) { setError(validationError); setIsSubmitting(false); return; }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the security verification.'); setIsSubmitting(false); return;
    }

    try {
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (!accessKey) throw new Error('Web3Forms access key is not configured');

      const sanitized = {
        name: sanitize(formData.name),
        email: sanitize(formData.email),
        phone: sanitize(formData.phone),
        event: sanitize(formData.event),
        guests: sanitize(formData.guests),
        date: sanitize(formData.date),
        message: sanitize(formData.message),
      };

      const fd = new FormData();
      fd.append('access_key', accessKey);
      fd.append('name', sanitized.name);
      fd.append('email', sanitized.email);
      fd.append('botcheck', '');
      if (turnstileToken) fd.append('cf-turnstile-response', turnstileToken);
      if (sanitized.phone) fd.append('phone', sanitized.phone);
      if (sanitized.event) fd.append('event_type', sanitized.event);
      if (sanitized.guests) fd.append('guest_count', sanitized.guests);
      if (sanitized.date) fd.append('event_date', sanitized.date);
      if (sanitized.message) fd.append('message', sanitized.message);

      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to submit');

      lastSubmitTime.current = Date.now();
      submitCount.current += 1;
      setSubmitted(true);
      clearCart();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (err) {
      setError('Failed to submit enquiry. Please try again or contact us directly.');
      console.error('Submission error:', err);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', span: false },
    { key: 'email', label: 'Email Address', type: 'email', span: false },
    { key: 'phone', label: 'Phone Number', type: 'tel', span: false },
    { key: 'event', label: 'Event Type', type: 'text', span: false },
    { key: 'guests', label: 'Number of Guests', type: 'number', span: false },
    { key: 'date', label: 'Event Date', type: 'date', span: false },
    { key: 'message', label: 'Additional Details', type: 'textarea', span: true },
  ] as const;

  return (
    <section id="order" style={{ padding: '80px 24px', borderTop: `1px solid ${clr.border}` }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <AnimatedSection>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '24px', height: '1px', background: clr.green }} />
            <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: clr.green }}>
              Events & Catering
            </span>
          </div>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '36px', fontWeight: 400, margin: '0 0 12px', color: '#1A1A1A' }}>
            Elevate Your Event
          </h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: '15px', color: clr.muted, margin: '0 0 48px', lineHeight: 1.7 }}>
            Planning something special? We cater for events across Greater Manchester. Get a quote below.
          </p>
        </AnimatedSection>

        {submitted ? (
          <AnimatedSection>
            <div style={{
              background: clr.card, border: `1px solid ${clr.green}`,
              borderRadius: '4px', padding: '48px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ fontFamily: "'Georgia', serif", fontSize: '24px', color: '#1A1A1A', margin: '0 0 12px' }}>Quote Request Received</h3>
              <p style={{ fontFamily: 'sans-serif', fontSize: '14px', color: clr.muted }}>We'll be in touch within 24 hours.</p>
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection delay={0.1}>
            <CartSummary />

            <form onSubmit={handleSubmit}>
              <input
                type="text" name="website" value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {fields.map(field => (
                  <div key={field.key} style={{ gridColumn: field.span ? '1 / -1' : 'auto' }}>
                    <label style={labelStyle}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={formData[field.key]}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        maxLength={MAX_MESSAGE_LENGTH}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        maxLength={MAX_FIELD_LENGTH}
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}

                {TURNSTILE_SITE_KEY && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ theme: 'light', size: 'normal' }}
                    />
                  </div>
                )}

                {error && (
                  <div style={{ gridColumn: '1 / -1', padding: '12px 16px', background: '#FEF2F2', borderLeft: '3px solid #EF4444', fontFamily: 'sans-serif', fontSize: '13px', color: '#B91C1C' }}>
                    {error}
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
                    style={{
                      width: '100%', background: clr.green, color: clr.cream,
                      border: 'none', padding: '16px', cursor: 'pointer',
                      fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Quote Request →'}
                  </button>
                </div>
              </div>
            </form>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
