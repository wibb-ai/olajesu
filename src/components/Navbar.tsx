import { useState, useEffect } from 'react';

const c = {
  border: '#DDD6C4',
  green: '#1B4332',
  cream: '#F7F2E8',
  muted: '#6B6355',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(247,242,232,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${c.border}` : 'none',
      transition: 'all 0.4s ease',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '80px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/olajesu_logo.png"
          alt="Olajesu Kitchen"
          style={{ height: '64px', width: 'auto', display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <a href="#menu" style={{
          color: c.muted, textDecoration: 'none', fontSize: '12px',
          fontFamily: 'sans-serif', padding: '8px 12px',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Menu
        </a>
        <a href="#order" style={{
          color: c.cream, background: c.green,
          textDecoration: 'none', fontSize: '12px', fontFamily: 'sans-serif',
          padding: '8px 16px', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          borderRadius: '2px',
        }}>
          Order Now
        </a>
      </div>
    </nav>
  );
}
