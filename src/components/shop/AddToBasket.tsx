'use client';

import { useShop } from './basketStore';
import s from './shop.module.css';

/** On a Meal page: opens the same Meal sheet the shop uses. */
export function AddToBasket({ mealId, soldOut: byHand }: { mealId: number; soldOut: boolean }) {
  const shop = useShop();
  // Sold out by hand, or for the chosen day.
  const soldOut = byHand || shop.isSoldOut(mealId);
  return (
    <button className={`${s.pillDark} ${s.full}`} disabled={soldOut} onClick={() => shop.openMeal(mealId)}>
      {soldOut ? 'Sold out' : shop.activePack ? `Add to your ${shop.activePack.size}-Pack` : 'Add to basket'}
    </button>
  );
}
