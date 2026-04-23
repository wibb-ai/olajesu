import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  dishId: string;
  dishName: string;
  size: string;
  serves: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (dishId: string, size: string) => void;
  clearCart: () => void;
  getFormattedNotes: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Check if item already exists
      const exists = prev.find(
        (i) => i.dishId === item.dishId && i.size === item.size
      );
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, item];
    });
  };

  const removeItem = (dishId: string, size: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.dishId === dishId && item.size === size))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getFormattedNotes = () => {
    if (items.length === 0) return '';

    const uniqueItems = items.filter((item, index, arr) => {
      const key = `${item.dishId}|${item.size}`;
      return arr.findIndex((x) => `${x.dishId}|${x.size}` === key) === index;
    });

    const grouped = uniqueItems.reduce((acc, item) => {
      if (!acc[item.dishName]) {
        acc[item.dishName] = [];
      }
      acc[item.dishName].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    const lines = ['Selected Items:'];
    Object.entries(grouped).forEach(([dishName, dishItems]) => {
      lines.push(`\n${dishName}:`);
      dishItems.forEach((item) => {
        lines.push(`  - ${item.size} (${item.serves})`);
      });
    });

    return lines.join('\n');
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, getFormattedNotes }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

