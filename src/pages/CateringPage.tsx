import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquiryForm from '../components/EnquiryForm';
import CateringMenu from '../components/CateringMenu';
import CateringHero from '../components/CateringHero';
import { CartProvider } from '../context/CartContext';
import { AnimatedSection } from '../utils/animation';

const c = {
  card: '#EDE6D3',
  border: '#DDD6C4',
  muted: '#6B6355',
};

function Tag({ children, color = '#1B4332' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontSize: '9px', fontFamily: "'Courier New', monospace", letterSpacing: '0.12em',
      textTransform: 'uppercase', color, border: `1px solid ${color}`,
      padding: '2px 7px', borderRadius: '2px', fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

const whyUs = [
  { title: 'Authentic Heritage', body: 'Every recipe carries the soul of Nigerian cooking no shortcuts, no compromises.' },
  { title: 'Flexible Service', body: 'From quick weeknight orders to full event catering. We move at your pace.' },
  { title: 'Trusted Reputation', body: '4.1 stars and climbing real reviews from real customers across Manchester.' },
];

export default function CateringPage() {
  return (
    <CartProvider>
    <div style={{ background: '#F7F2E8', color: '#1A1A1A', fontFamily: "'Georgia', serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />
      <main>
        {/* Hero */}
        <CateringHero />

        {/* ─── Crafted With Care ─── */}
        <section style={{ padding: '80px 24px', maxWidth: '960px', margin: '0 auto' }}>
          <AnimatedSection>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '260px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '1px', background: '#9C8B6E' }} />
                  <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8B6E' }}>Our Story</span>
                </div>
                <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: 400, lineHeight: 1.2, margin: '0 0 20px', color: '#1A1A1A' }}>
                  Crafted<br /><span style={{ fontStyle: 'italic', color: '#1B4332' }}>With Care</span>
                </h2>
              </div>
              <div style={{ flex: '2', minWidth: '260px' }}>
                <p style={{ fontFamily: 'sans-serif', fontSize: '15px', lineHeight: 1.8, color: 'rgba(26,26,26,0.6)', margin: '0 0 16px' }}>
                  OlaJesu was built on a simple belief  authentic Nigerian food deserves to be accessible to everyone in Manchester. We bring the same quality and care to every delivery as you'd find at a family table in Lagos.
                </p>
                <p style={{ fontFamily: 'sans-serif', fontSize: '15px', lineHeight: 1.8, color: 'rgba(26,26,26,0.6)', margin: 0 }}>
                  Every dish is made fresh in our Manchester kitchen. No shortcuts. No compromises. Just food that carries the flavour of home.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ─── Menu ─── */}
        <CateringMenu />

        {/* ─── Why Choose Us ─── */}
        <section style={{ padding: '80px 24px', borderTop: `1px solid ${c.border}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <AnimatedSection>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '1px', background: '#9C8B6E' }} />
                <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8B6E' }}>Why Us</span>
              </div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '36px', fontWeight: 400, margin: '0 0 48px', color: '#1A1A1A' }}>
                Why Choose OlaJesu
              </h2>
            </AnimatedSection>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2px' }}>
              {whyUs.map((w, i) => (
                <AnimatedSection key={w.title} delay={i * 0.1}>
                  <div style={{
                    background: c.card, padding: '32px 24px',
                    borderTop: `3px solid ${i === 0 ? '#1B4332' : i === 1 ? '#9C8B6E' : '#1B4332'}`,
                  }}>
                    <h3 style={{ fontFamily: "'Georgia', serif", fontSize: '18px', fontWeight: 400, margin: '0 0 12px', color: '#1A1A1A' }}>{w.title}</h3>
                    <p style={{ fontFamily: 'sans-serif', fontSize: '13px', lineHeight: 1.7, color: c.muted, margin: 0 }}>{w.body}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WhatsApp Banner ─── */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <AnimatedSection>
              <div style={{
                background: 'linear-gradient(135deg, rgba(61,74,46,0.07) 0%, rgba(156,139,110,0.07) 100%)',
                border: '1px solid rgba(61,74,46,0.2)',
                borderRadius: '4px', padding: '40px 32px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px',
              }}>
                <Tag color="#1B4332">Exclusive to Direct Customers</Tag>
                <h3 style={{ fontFamily: "'Georgia', serif", fontSize: '26px', fontWeight: 400, margin: 0, color: '#1A1A1A', lineHeight: 1.2 }}>
                  Get offers before anyone else.<br />
                  <span style={{ fontStyle: 'italic', color: '#1B4332' }}>Join our WhatsApp list.</span>
                </h3>
                <p style={{ fontFamily: 'sans-serif', fontSize: '14px', color: c.muted, margin: 0, lineHeight: 1.7 }}>
                  Weekly specials, new dishes, and first access to The Jollof Box launch  sent directly to your WhatsApp. No spam. Unsubscribe any time.
                </p>
                <a href="https://wa.me/447456272712?text=I%20want%20offers%20from%20OlaJesu" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#25D366', color: '#FFFFFF', padding: '14px 28px',
                  textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '13px',
                  fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: '2px',
                }}>
                  <span>💬</span> Join on WhatsApp
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ─── Enquiry Form ─── */}
        <EnquiryForm />
      </main>
      <Footer />
    </div>
    </CartProvider>
  );
}
