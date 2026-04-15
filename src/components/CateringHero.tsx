const c = {
  border: '#DDD6C4',
  muted: '#6B6355',
};

export default function CateringHero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      overflow: 'hidden',
    }}>
      {/* Gradient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 30% 40%, rgba(61,74,46,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 60%, rgba(156,139,110,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(61,74,46,0.06) 0%, transparent 50%),
          linear-gradient(180deg, #F7F2E8 0%, #EDE6D3 50%, #F7F2E8 100%)
        `,
      }} />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '10%', right: '-15%',
        width: '500px', height: '500px', borderRadius: '50%',
        border: '1px solid rgba(61,74,46,0.1)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '15%', right: '-10%',
        width: '380px', height: '380px', borderRadius: '50%',
        border: '1px solid rgba(156,139,110,0.08)', pointerEvents: 'none',
      }} />

      {/* Hero content */}
      <div style={{ position: 'relative', padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '1px', background: '#1B4332' }} />
          <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1B4332' }}>
            Manchester · Authentic Nigerian
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontSize: 'clamp(42px, 10vw, 72px)',
          fontWeight: 400, lineHeight: 1.05,
          margin: '0 0 24px', color: '#1A1A1A',
        }}>
          Food that carries<br />
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(90deg, #1B4332, #9C8B6E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>the flavour</span><br />
          of home.
        </h1>

        <p style={{
          fontFamily: 'sans-serif', fontSize: '15px', lineHeight: 1.7,
          color: 'rgba(26,26,26,0.6)', margin: '0 0 40px', maxWidth: '420px',
        }}>
          Authentic Nigerian cuisine  cooked from scratch, delivered to your door in less than 60 minutes. From Jollof Rice to Egusi Soup, this is the real thing.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="#order" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#1B4332', color: '#F7F2E8',
            padding: '14px 28px', textDecoration: 'none',
            fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '2px',
          }}>
            Order Direct <span style={{ fontSize: '16px' }}>→</span>
          </a>
          <a href="#menu" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(61,74,46,0.3)', color: '#1B4332',
            padding: '14px 28px', textDecoration: 'none',
            fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 400,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '2px',
          }}>
            View Menu
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        position: 'relative',
        borderTop: `1px solid ${c.border}`,
        background: 'rgba(237,230,211,0.95)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {[
            { num: '500+', label: 'Orders Delivered' },
            { num: '45-60 min', label: 'Average Delivery' },
            { num: '4.1 ★', label: 'Uber Eats Rating' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 16px', textAlign: 'center',
              borderRight: i < 2 ? `1px solid ${c.border}` : 'none',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1B4332', fontFamily: "'Georgia', serif", marginBottom: '4px' }}>{s.num}</div>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.muted, fontFamily: 'sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
