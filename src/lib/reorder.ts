import { addLine, addToActivePack, emptyBasket, startPack, type Basket } from './basket';
import type { OrderItem } from './orders';

/**
 * A past Order as a basket, for one-tap reorder (Accounts ticket). Prices are not copied: the
 * shop prices it from today's menu, and anything no longer on sale is taken out with a notice.
 * Returns null if the Order predates choices being recorded.
 */
export function basketFromOrder(items: OrderItem[]): Basket | null {
  let basket = emptyBasket;
  for (const item of items) {
    if (item.meals.some(m => !m.choice)) return null;
    if (item.kind === 'single') basket = addLine(basket, item.meals[0].choice!, item.qty);
    else {
      basket = startPack(basket, item.qty);
      for (const m of item.meals) basket = addToActivePack(basket, m.choice!, 1).basket;
    }
  }
  return { ...basket, activePack: null };
}
