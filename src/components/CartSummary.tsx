import { useCart } from '../context/CartContext';

const clr = {
  card: '#EDE6D3',
  border: '#DDD6C4',
  green: '#1B4332',
  cream: '#F7F2E8',
  muted: '#6B6355',
};

export default function CartSummary() {
  const { items, removeItem, clearCart } = useCart();

  if (items.length === 0) return null;

  return (
    <div style={{
      marginBottom: '24px', padding: '24px',
      background: clr.card, border: `1px solid ${clr.border}`, borderRadius: '2px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontFamily: "'Georgia', serif", fontSize: '17px', color: '#1A1A1A' }}>
          Selected Items ({items.length})
        </span>
        <button
          onClick={clearCart}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.08em',
            textTransform: 'uppercase', color: clr.muted,
          }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
        {items.map((item, index) => (
          <div
            key={`${item.dishId}-${item.size}-${index}`}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 12px', background: clr.cream, borderRadius: '2px',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{item.dishName}</p>
              <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: clr.muted, margin: '2px 0 0' }}>
                {item.size}{item.serves ? ` · ${item.serves}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={() => removeItem(item.dishId, item.size)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'sans-serif', fontSize: '14px', color: clr.muted,
                  padding: '0 4px', lineHeight: 1,
                }}
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: clr.muted, margin: '12px 0 0', borderTop: `1px solid ${clr.border}`, paddingTop: '12px' }}>
        These items will be included in your enquiry below.
      </p>
    </div>
  );
}
