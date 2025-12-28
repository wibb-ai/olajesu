import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartSummary() {
  const { items, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-brand-gold/30 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-brand-dark">
          Selected Items ({items.length})
        </h3>
        <button
          onClick={clearCart}
          className="text-sm text-brand-green hover:text-brand-dark transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={`${item.dishId}-${item.size}-${index}`}
            className="flex items-start justify-between p-3 bg-brand-cream/50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold text-brand-dark">{item.dishName}</p>
              <p className="text-sm text-brand-green">
                {item.size}
                {item.serves && <span className="ml-2 text-xs">({item.serves})</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-brand-gold">{item.price}</span>
              <button
                onClick={() => removeItem(item.dishId, item.size)}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Remove item"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-brand-gold/30">
        <p className="text-xs text-brand-green/70">
          These items will be automatically added to your enquiry notes below.
        </p>
      </div>
    </div>
  );
}

