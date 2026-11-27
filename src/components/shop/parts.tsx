'use client';

import { useEffect, useState } from 'react';

import { allergenLabel } from '../../lib/allergens';
import { type BasketPack, type Menu, type MenuMeal, mealById } from '../../lib/basket';
import { shortCutoffLabel, shortDateLabel } from '../../lib/delivery';
import { useShop } from './basketStore';
import s from './shop.module.css';

const SPICE: Record<string, string> = { none: 'Not spicy', mild: 'Mild', medium: 'Medium spice', hot: 'Hot' };

/** Branded placeholder until real Meal photos are uploaded; a missing photo never blocks a sale. */
export function PhotoBox({ meal, height = 120, radius = 12, label = true }: { meal: MenuMeal; height?: number; radius?: number; label?: boolean }) {
  const hue = meal.category === 'rice' ? '#C8693A' : '#5E7D3A';
  return (
    <div className={s.photo} style={{ height, borderRadius: radius, background: `linear-gradient(135deg, ${hue}, #1B4332)` }} aria-hidden>
      {label && meal.name}
    </div>
  );
}

export function MealTags({ meal }: { meal: MenuMeal }) {
  return (
    <div className={s.tags}>
      <span className={s.tag}>{meal.portionGrams} g</span>
      {meal.spice && <span className={s.tag}>{SPICE[meal.spice] ?? meal.spice}</span>}
      {meal.halal && <span className={s.tag}>Halal</span>}
      {meal.soldOut && <span className={s.tag}>Sold out</span>}
    </div>
  );
}

/** Ingredients with allergens (written in CAPITALS by the kitchen) shown in bold, as the law asks. */
export function Ingredients({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\b[A-Z][A-Z]+(?:\s+[A-Z][A-Z]+)*\b)/g);
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p.toLowerCase()}</b> : p))}</>;
}

export function AllergenInfo({ allergens, mayContain }: { allergens: string[]; mayContain: string }) {
  return (
    <div className={s.allergenBox}>
      {allergens.length ? (
        <>
          <b>Contains:</b> {allergens.map(allergenLabel).join(', ')}
        </>
      ) : (
        <>Contains none of the 14 allergens.</>
      )}
      {mayContain && (
        <div>
          <b>May contain:</b> {mayContain}
        </div>
      )}
    </div>
  );
}

/** A Pack shown as slots that fill with the chosen Meals. Tap a filled slot to remove it. */
export function PackSlots({ menu, pack, onRemove }: { menu: Menu; pack: BasketPack; onRemove?: (index: number) => void }) {
  const size = pack.size > 5 ? 30 : 40;
  return (
    <div className={s.slots}>
      {Array.from({ length: pack.size }, (_, i) => {
        const item = pack.items[i];
        const meal = item && mealById(menu, item.mealId);
        return meal ? (
          <button key={i} className={s.slotFilled} style={{ width: size, height: size }} onClick={() => onRemove?.(i)} aria-label={`Remove ${meal.name}`} title={`Remove ${meal.name}`}>
            <PhotoBox meal={meal} height={size} radius={size} label={false} />
          </button>
        ) : (
          <span key={i} className={s.slot} style={{ width: size, height: size }} aria-label="Empty slot" />
        );
      })}
    </div>
  );
}

/** Countdown to the chosen day's Cut-off. Rendered after mount so server and browser agree. */
export function Countdown() {
  const { day, delivery, fulfilment } = useShop();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!day) {
    return (
      <div className={s.strip}>
        <div className={s.stripTitle}>ORDERING IS CLOSED FOR NOW</div>
        <div className={s.stripSub}>New delivery days open soon</div>
      </div>
    );
  }
  const left = now ? Math.max(0, new Date(day.cutoff).getTime() - now.getTime()) : 0;
  const parts = [
    [Math.floor(left / 864e5), 'days'],
    [Math.floor(left / 36e5) % 24, 'hrs'],
    [Math.floor(left / 6e4) % 60, 'min'],
    [Math.floor(left / 1e3) % 60, 'sec'],
  ] as const;
  const weekday = new Date(`${day.date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Europe/London' });
  return (
    <div className={s.strip}>
      <div className={s.stripTitle}>
        GET {weekday.toUpperCase()} {fulfilment === 'collection' ? 'COLLECTION' : 'DELIVERY'}
      </div>
      <div className={s.stripSub}>
        ORDER BY {shortCutoffLabel(day.cutoff).toUpperCase()}
        {delivery.draft && ' (draft)'}
      </div>
      <div className={s.timer} role="timer" aria-label="Time left to order">
        {parts.map(([n, unit]) => (
          <div key={unit} className={s.timerCell}>
            <div className={s.timerNum}>{now ? String(n).padStart(2, '0') : '--'}</div>
            <div className={s.timerUnit}>{unit}</div>
          </div>
        ))}
      </div>
      <div className={s.stripSub} style={{ margin: '8px 0 0' }}>
        Your Meals {fulfilment === 'collection' ? 'are ready' : 'arrive'} {shortDateLabel(day.date)}
      </div>
    </div>
  );
}
