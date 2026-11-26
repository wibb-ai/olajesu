'use client';

import { describeChoice, gbp, singlesPrice } from '../../lib/basket';
import { useShop } from './basketStore';
import { PackSlots } from './parts';
import { Sheet } from './Sheet';
import s from './shop.module.css';

/**
 * The basket: Packs and single Meals, Pack savings, and the Pack edge-case rules: a part-filled
 * Pack is either filled or turned into single Meals, by the Customer's choice, and two 5-Packs
 * can become a 10-Pack only if the Customer says so.
 */
export function BasketSheet() {
  const shop = useShop();
  const { menu, priced, merge, notices } = shop;
  if (!shop.basketOpen) return null;
  const empty = priced.mealCount === 0;

  return (
    <Sheet onClose={() => shop.setBasketOpen(false)} label="Your basket">
      <h2 className={s.sheetTitle} style={{ marginTop: 4 }}>
        Your basket
      </h2>
      <p className={s.subtle} style={{ margin: '0 0 8px' }}>
        Delivery day and fee are chosen at checkout.
      </p>

      {notices.length > 0 && (
        <div className={s.calloutWarn} role="status">
          {notices.map(n => (
            <div key={n}>{n}</div>
          ))}
          <button className={s.linkBtn} onClick={shop.dismissNotices} style={{ marginTop: 6 }}>
            OK
          </button>
        </div>
      )}

      {empty && <p className={s.body}>Nothing here yet. Tap a Meal to add it, or start a Pack to save.</p>}

      {priced.packs.map(p => {
        const offerPercent = p.discountPercent;
        const missedSaving = p.potentialSaving;
        return (
          <div key={p.pack.key} className={s.rowCol}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <b>
                {p.pack.size}-Pack · {offerPercent}% off
              </b>
              <span>{gbp(p.total)}</span>
            </div>
            {p.pack.items.map((it, i) => {
              const d = describeChoice(menu, it);
              return (
                <div key={i} className={s.subtle}>
                  {d.name}
                  {d.addOns && ` + ${d.addOns}`}
                </div>
              );
            })}
            {!p.complete && (
              <div className={s.callout}>
                <div style={{ marginBottom: 8 }}>
                  {p.pack.items.length} of {p.pack.size} chosen.
                  {p.pack.items.length > 0 && <> Add {p.missing} more to save about {gbp(missedSaving)}, or buy {p.pack.items.length === 1 ? 'it' : 'these'} as single Meals for {gbp(singlesPrice(menu, p.pack))}.</>}
                </div>
                <PackSlots menu={menu} pack={p.pack} onRemove={i => shop.removeFromPack(p.pack.key, i)} />
                <div className={s.calloutActions}>
                  <button className={s.smallPill} onClick={() => shop.resumePack(p.pack.key)}>
                    Add {p.missing} more
                  </button>
                  {p.pack.items.length > 0 && (
                    <button className={s.smallPillLight} onClick={() => shop.packToSingles(p.pack.key)}>
                      Buy as single Meals
                    </button>
                  )}
                  <button className={s.linkBtn} onClick={() => shop.removePack(p.pack.key)}>
                    Remove Pack
                  </button>
                </div>
              </div>
            )}
            {p.complete && (
              <button className={s.linkBtn} onClick={() => shop.removePack(p.pack.key)} style={{ alignSelf: 'flex-start' }}>
                Remove Pack
              </button>
            )}
          </div>
        );
      })}

      {merge && (
        <div className={s.calloutGreen}>
          Make it a {merge.size}-Pack and save {gbp(merge.extra)} more.
          <div className={s.calloutActions}>
            <button className={s.smallPill} onClick={() => shop.mergePacks(merge.from, merge.size)}>
              Make it a {merge.size}-Pack
            </button>
          </div>
        </div>
      )}

      {priced.lines.map(({ line, unit, total }) => {
        const d = describeChoice(menu, line.choice);
        return (
          <div key={line.key} className={s.row}>
            <div>
              {d.name}
              {d.addOns && <div className={s.subtle}>+ {d.addOns}</div>}
              <div className={s.stepper} style={{ marginTop: 6 }}>
                <button className={s.stepBtn} style={{ width: 30, height: 30, fontSize: 16 }} onClick={() => shop.setLineQty(line.key, line.qty - 1)} aria-label={`One fewer ${d.name}`}>
                  −
                </button>
                <b>{line.qty}</b>
                <button className={s.stepBtn} style={{ width: 30, height: 30, fontSize: 16 }} onClick={() => shop.setLineQty(line.key, line.qty + 1)} aria-label={`One more ${d.name}`}>
                  +
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {gbp(total)}
              {line.qty > 1 && <div className={s.subtle}>{gbp(unit)} each</div>}
            </div>
          </div>
        );
      })}

      {priced.saved > 0 && (
        <div className={s.row} style={{ color: 'var(--green)' }}>
          <span>Pack savings</span>
          <span>−{gbp(priced.saved)}</span>
        </div>
      )}
      {!empty && (
        <div className={s.total}>
          <span>Total before delivery</span>
          <span>{gbp(priced.total)}</span>
        </div>
      )}

      <div className={s.sheetBar}>
        <button className={s.pillDark} style={{ flex: 1 }} disabled title="Checkout is the next part of the build">
          Checkout opens soon
        </button>
      </div>
      {priced.incompletePacks.length > 0 && !empty && (
        <p className={s.subtle} style={{ margin: '0 0 16px' }}>
          Finish or change your part-filled Pack before checkout.
        </p>
      )}
    </Sheet>
  );
}
