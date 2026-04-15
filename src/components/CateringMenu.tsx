import { useState } from 'react';
import { cateringMenu, categories, CateringDish } from '../data/cateringMenu';
import { useCart } from '../context/CartContext';
import { AnimatedSection } from '../utils/animation';

const clr = {
  card: '#EDE6D3',
  border: '#DDD6C4',
  green: '#1B4332',
  muted: '#6B6355',
  cream: '#F7F2E8',
};

export default function CateringMenu() {
  const displayCategories = categories.filter(c => c !== 'All Dishes');
  const [activeCategory, setActiveCategory] = useState(displayCategories[0]);
  const [expandedDish, setExpandedDish] = useState<string | null>(null);
  const { addItem, items } = useCart();

  const filteredDishes = cateringMenu.filter(d => d.category === activeCategory);

  const handleAdd = (dish: CateringDish, size: { size: string; serves: string }) => {
    addItem({ dishId: dish.id, dishName: dish.name, size: size.size, serves: size.serves });
  };

  const isInCart = (dishId: string, size: string) =>
    items.some(item => item.dishId === dishId && item.size === size);

  return (
    <section id="menu" style={{ padding: '80px 0', borderTop: `1px solid ${clr.border}` }}>
      {/* Header */}
      <div style={{ padding: '0 24px', maxWidth: '960px', margin: '0 auto 48px' }}>
        <AnimatedSection>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '24px', height: '1px', background: clr.green }} />
            <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: clr.green }}>
              Catering Menu
            </span>
          </div>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '36px', fontWeight: 400, lineHeight: 1.1, margin: 0, color: '#1A1A1A' }}>
            The Menu
          </h2>
        </AnimatedSection>
      </div>

      {/* Category tabs */}
      <div style={{ position: 'relative', maxWidth: '960px', margin: '0 auto' }}>
        <div className="menu-tabs" style={{
          display: 'flex', gap: '0', overflowX: 'auto', padding: '0 24px',
          borderBottom: `1px solid ${clr.border}`, marginBottom: '40px',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          {displayCategories.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setExpandedDish(null); }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 20px', whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: activeCategory === cat ? 700 : 400,
              color: activeCategory === cat ? clr.green : clr.muted,
              borderBottom: activeCategory === cat ? `2px solid ${clr.green}` : '2px solid transparent',
              transition: 'all 0.2s ease', marginBottom: '-1px',
            }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '48px',
          background: 'linear-gradient(to right, transparent, #F7F2E8)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Menu items */}
      <div style={{ padding: '0 24px', maxWidth: '960px', margin: '0 auto' }}>
        {filteredDishes.map((dish, i) => (
          <AnimatedSection key={dish.id} delay={i * 0.08}>
            <div style={{
              padding: '24px 0', borderBottom: `1px solid ${clr.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: '17px', color: '#1A1A1A' }}>{dish.name}</span>
                  <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: clr.muted, margin: '6px 0 0', lineHeight: 1.6 }}>{dish.description}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => setExpandedDish(expandedDish === dish.id ? null : dish.id)}
                    style={{
                      background: 'transparent', border: `1px solid ${clr.green}`,
                      color: clr.green, padding: '6px 14px', cursor: 'pointer',
                      fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '2px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = clr.green; (e.target as HTMLElement).style.color = clr.cream; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = clr.green; }}
                  >
                    {expandedDish === dish.id ? 'Hide Sizes' : 'View Sizes'}
                  </button>
                </div>
              </div>

              {/* Expanded size options */}
              {expandedDish === dish.id && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dish.sizes.map((size, idx) => {
                    const added = isInCart(dish.id, size.size);
                    return (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', background: clr.card, borderRadius: '2px',
                      }}>
                        <div>
                          <span style={{ fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{size.size}</span>
                          <span style={{ fontFamily: 'sans-serif', fontSize: '13px', color: clr.muted, marginLeft: '8px' }}>· {size.serves}</span>
                        </div>
                        <button
                          onClick={() => handleAdd(dish, size)}
                          disabled={added}
                          style={{
                            background: added ? clr.green : 'transparent',
                            border: `1px solid ${clr.green}`,
                            color: added ? clr.cream : clr.green,
                            padding: '5px 12px', cursor: added ? 'default' : 'pointer',
                            fontFamily: 'sans-serif', fontSize: '10px', fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '2px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {added ? '✓ Added' : 'Add to Enquiry'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>
        ))}

        {filteredDishes.length === 0 && (
          <p style={{ fontFamily: 'sans-serif', fontSize: '14px', color: clr.muted, textAlign: 'center', padding: '40px 0' }}>
            No dishes found in this category.
          </p>
        )}
      </div>

      {/* Note */}
      <div style={{ padding: '40px 24px 0', maxWidth: '960px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: clr.muted, lineHeight: 1.7, textAlign: 'center' }}>
          All dishes are prepared fresh using authentic Nigerian ingredients. Minimum order lead time: 48 hours.
          Pricing is tailored to your event, submit an enquiry for a custom quote.
        </p>
      </div>
    </section>
  );
}
