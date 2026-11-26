'use client';

import Link from 'next/link';

import { addOnById, gbp } from '../../lib/basket';
import { useShop } from './basketStore';
import { AllergenInfo, MealTags, PhotoBox } from './parts';
import { Sheet } from './Sheet';
import s from './shop.module.css';

/** Opens when a Customer taps a Meal: photo, details, allergens, protein Option, Add-ons, quantity. */
export function MealSheet() {
  const shop = useShop();
  const { sheet, sheetMeal: meal, menu, activePack, activeOffer } = shop;
  if (!sheet || !meal) return null;
  const { choice } = sheet;

  return (
    <Sheet onClose={shop.closeMeal} label={meal.name}>
      <PhotoBox meal={meal} height={210} radius={16} />
      <h2 className={s.sheetTitle}>{meal.name}</h2>
      <MealTags meal={meal} />
      {meal.description && <p className={s.body} style={{ margin: '10px 0 0' }}>{meal.description}</p>}
      <AllergenInfo allergens={meal.allergens} mayContain={meal.mayContain} />
      <Link href={`/meals/${meal.slug}`} className={s.linkBtn} style={{ display: 'inline-block', marginTop: 8 }} onClick={shop.closeMeal}>
        Ingredients, storage and reheating
      </Link>

      {meal.options.length > 0 && (
        <>
          <div className={s.label}>Choose protein</div>
          <div className={s.chips}>
            {meal.options.map(o => (
              <button key={o.id} className={choice.optionId === o.id ? s.chipOn : s.chip} onClick={() => shop.setChoice({ ...choice, optionId: o.id })} aria-pressed={choice.optionId === o.id}>
                {o.name} · {gbp(o.price)}
              </button>
            ))}
          </div>
        </>
      )}

      {meal.addOnIds.length > 0 && (
        <>
          <div className={s.label}>Add-ons</div>
          <div className={s.chips}>
            {meal.addOnIds.map(id => {
              const a = addOnById(menu, id);
              if (!a) return null;
              const on = choice.addOnIds.includes(id);
              return (
                <button
                  key={id}
                  className={on ? s.chipOn : s.chip}
                  disabled={a.soldOut}
                  aria-pressed={on}
                  onClick={() => shop.setChoice({ ...choice, addOnIds: on ? choice.addOnIds.filter(x => x !== id) : [...choice.addOnIds, id] })}
                >
                  {on ? '✓ ' : '+ '}
                  {a.name} {a.soldOut ? '(sold out)' : gbp(a.price)}
                </button>
              );
            })}
          </div>
        </>
      )}

      {activePack && activeOffer && (
        <p className={s.small} style={{ color: 'var(--green)', marginTop: 16 }}>
          Going in your {activePack.size}-Pack: {activeOffer.discountPercent}% off the Meal. Add-ons are full price.
        </p>
      )}

      <div className={s.sheetBar}>
        <div className={s.stepper}>
          <button className={s.stepBtn} onClick={() => shop.setQty(sheet.qty - 1)} disabled={sheet.qty <= 1} aria-label="One fewer">
            −
          </button>
          <b aria-live="polite">{sheet.qty}</b>
          <button className={s.stepBtn} onClick={() => shop.setQty(sheet.qty + 1)} disabled={sheet.qty >= shop.sheetMaxQty} aria-label="One more">
            +
          </button>
        </div>
        <button className={s.pillDark} style={{ flex: 1 }} onClick={shop.confirmMeal}>
          {activePack ? 'Add to Pack' : 'Add'} · {gbp(shop.sheetUnit * sheet.qty)}
        </button>
      </div>
    </Sheet>
  );
}
