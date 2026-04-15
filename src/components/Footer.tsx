import { businessConfig } from '../config/businessConfig';

const c = {
  border: '#DDD6C4',
  muted: '#6B6355',
};

export default function Footer() {
  const { contact } = businessConfig;

  return (
    <footer style={{ borderTop: `1px solid ${c.border}`, padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <img
                src="/olajesu_logo.png"
                alt="Olajesu Kitchen"
                style={{ height: '64px', width: 'auto', display: 'block' }}
              />
            </div>
            <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: c.muted, lineHeight: 1.7, margin: '0 0 16px' }}>
              Authentic Nigerian cuisine, delivered from our Manchester kitchen to your door.
            </p>
            <p style={{ fontFamily: 'sans-serif', fontSize: '12px', color: c.muted, margin: 0 }}>
              20-22 Mary Street, Unit 3<br />Manchester, UK
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: c.muted, margin: '0 0 16px' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {businessConfig.social.instagram ? (
                <a href={businessConfig.social.instagram} style={{ color: c.muted, textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '13px' }}>Instagram</a>
              ) : (
                <a href="#" style={{ color: c.muted, textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '13px' }}>Instagram</a>
              )}
              <a
                href={`https://wa.me/${contact.phone.replace(/\s/g, '').replace('+', '')}`}
                style={{ color: c.muted, textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '13px' }}
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${contact.email}`}
                style={{ color: c.muted, textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '13px' }}
              >
                {contact.email}
              </a>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: `1px solid ${c.border}`, paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(26,26,26,0.35)' }}>© 2026 OlaJesu Ghost Kitchen</span>
          <span style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(26,26,26,0.35)' }}>Manchester, UK</span>
        </div>
      </div>
    </footer>
  );
}
