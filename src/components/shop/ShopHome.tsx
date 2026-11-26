'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fromPrice, gbp, type MenuMeal } from '../../lib/basket';
import { DELIVERY_PLACEHOLDER } from '../../lib/delivery';
import { useShop } from './basketStore';
import { PackSlots, PhotoBox } from './parts';
import s from './shop.module.css';

const CATEGORIES = [
  { value: 'rice', label: 'Rice' },
  { value: 'soups-stews', label: 'Soups and stews' },
] as const;

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/** The homepage is the shop (site-restructure ticket), in the A4 "Bold landing" design. */
export function ShopHome() {
  useOldCateringLinks();
  useCancelledCheckout();
  return (
    <>
      <Hero />
      <div className={s.container}>
        <Featured />
        <Trust />
        <WaysToOrder />
        <MenuSection />
        <Standard />
        <Story />
        <Reviews />
        <Delivery />
      </div>
    </>
  );
}

/** Old shared links like olajesu.com/#order were catering's enquiry form. The server never sees "#…". */
function useOldCateringLinks() {
  useEffect(() => {
    if (window.location.hash === '#order') window.location.replace('/catering#order');
  }, []);
}

/** Back from Stripe without paying: reopen the basket, which is still saved. */
function useCancelledCheckout() {
  const { setBasketOpen, priced } = useShop();
  const hasItems = priced.mealCount > 0;
  useEffect(() => {
    const url = new URL(window.location.href);
    // Wait until the saved basket has loaded in the browser.
    if (url.searchParams.get('checkout') !== 'cancelled' || !hasItems) return;
    url.searchParams.delete('checkout');
    window.history.replaceState(null, '', url);
    queueMicrotask(() => setBasketOpen(true));
  }, [hasItems, setBasketOpen]);
}

function Hero() {
  return (
    <section className={s.hero}>
      <div className={s.container}>
        <span className={s.heroLabel}>● Meal prep in Manchester</span>
        <h1 className={s.h1}>
          Real Nigerian home cooking,
          <br />
          <span className={s.accent}>ready in minutes.</span>
        </h1>
        <p className={s.heroText}>Jollof, egusi, efo riro and more, cooked fresh in our Manchester kitchen and delivered chilled to your door. Heat, eat, feel at home.</p>
        <div className={s.heroButtons}>
          <button className={s.pillDark} onClick={() => scrollTo('ways')}>
            Order meals →
          </button>
          <Link href="/catering" className={s.pill}>
            Catering for events
          </Link>
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const shop = useShop();
  const meals = shop.menu.meals;
  const [index, setIndex] = useState(0);
  const meal = meals[index] ?? meals[0];
  if (!meal) return null;
  return (
    <section style={{ marginTop: -6 }}>
      <div className={s.featured}>
        <div className={s.eyebrow} style={{ textAlign: 'center', marginBottom: 12 }}>
          On the menu now
        </div>
        <button className={s.plainBtn} onClick={() => shop.openMeal(meal.id)} aria-label={`Choose ${meal.name}`}>
          <PhotoBox meal={meal} height={240} radius={16} />
        </button>
        <div className={s.featuredRow}>
          <div>
            <div className={s.featuredName}>{meal.name}</div>
            <div className={s.small}>
              <Price meal={meal} /> · {meal.portionGrams} g
            </div>
          </div>
          {meal.soldOut ? (
            <span className={s.soldOut}>Sold out</span>
          ) : (
            <button className={s.smallPill} onClick={() => shop.openMeal(meal.id)}>
              Add
            </button>
          )}
        </div>
        <div className={s.thumbs}>
          {meals.map((m, i) => (
            <button key={m.id} className={i === index ? s.thumbOn : s.thumb} onClick={() => setIndex(i)} aria-label={`Show ${m.name}`} aria-pressed={i === index}>
              <PhotoBox meal={m} height={48} radius={9} label={false} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className={s.trust}>
      {['Cooked fresh in Manchester', 'Real family recipes', 'Delivered chilled'].map(t => (
        <div key={t}>
          <span className={s.tick}>✓</span>
          <div>{t}</div>
        </div>
      ))}
    </section>
  );
}

function WaysToOrder() {
  const shop = useShop();
  const [mode, setMode] = useState<'pack' | 'single'>('pack');
  const packs = shop.menu.packs;
  const best = packs.reduce((b, p) => (p.discountPercent > (b?.discountPercent ?? -1) ? p : b), packs[0]);
  if (!packs.length) return null;

  return (
    <section id="ways" className={s.section}>
      <div className={`${s.eyebrow} ${s.center}`}>Two ways to order</div>
      <h2 className={`${s.h2} ${s.center} ${s.upper}`}>Your meals, your way</h2>
      <div className={s.toggle} role="tablist">
        {(['pack', 'single'] as const).map(m => (
          <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? s.toggleOn : s.toggleBtn} onClick={() => setMode(m)}>
            {m === 'pack' ? 'Build a Pack' : 'Single Meals'}
          </button>
        ))}
      </div>
      {mode === 'pack' ? (
        <div className={s.packCards}>
          {packs.map(p => {
            const isBest = p === best && packs.length > 1;
            return (
              <div key={p.size} className={isBest ? s.packCardBest : s.packCard}>
                {isBest && <span className={s.badge}>BEST VALUE</span>}
                <div className={s.packSize}>{p.size} Meals</div>
                <div className={s.packSave}>Save {p.discountPercent}% on every Meal</div>
                <ul className={s.packList}>
                  <li>Mix any Meals, repeats welcome</li>
                  <li>Choose the protein and sides for each</li>
                  <li>Sides are added at full price</li>
                </ul>
                <button className={isBest ? `${s.pillWhite} ${s.full}` : `${s.pillDark} ${s.full}`} onClick={() => shop.startPack(p.size)}>
                  Start my {p.size}-Pack →
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`${s.body} ${s.center}`}>Just want one or two? Pick any Meal below at full price. You can start a Pack at any time.</p>
      )}
    </section>
  );
}

function MenuSection() {
  const shop = useShop();
  const { activePack, activeOffer, menu } = shop;
  return (
    <section id="menu" className={s.section} style={{ scrollMarginTop: 70 }}>
      <div className={s.eyebrow}>The menu</div>
      <h2 className={s.h2}>
        This week&apos;s <span className={s.accent}>pots</span>
      </h2>

      {activePack && (
        <div className={s.packTray} aria-live="polite">
          <div className={s.trayTop}>
            <span>
              {activePack.size}-Pack · {activePack.size - activePack.items.length} to go
              {activeOffer && <span className={s.subtle} style={{ fontWeight: 600 }}> · {activeOffer.discountPercent}% off each Meal</span>}
            </span>
            <button className={s.linkBtn} onClick={shop.stopFillingPack}>
              {activePack.items.length ? 'Finish later' : 'Cancel'}
            </button>
          </div>
          <PackSlots menu={menu} pack={activePack} onRemove={i => shop.removeFromPack(activePack.key, i)} />
        </div>
      )}

      {!menu.meals.length && <div className={s.empty}>The menu is being prepared. Check back soon.</div>}

      {CATEGORIES.map(cat => {
        const meals = menu.meals.filter(m => m.category === cat.value);
        if (!meals.length) return null;
        return (
          <div key={cat.value}>
            <h3 className={s.label} style={{ fontSize: 13 }}>
              {cat.label}
            </h3>
            <div className={s.menuGrid}>
              {meals.map(m => (
                <MealCard key={m.id} meal={m} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function MealCard({ meal }: { meal: MenuMeal }) {
  const shop = useShop();
  return (
    <button className={s.mealCard} onClick={() => shop.openMeal(meal.id)} disabled={meal.soldOut} aria-label={meal.soldOut ? `${meal.name}, sold out` : `Choose ${meal.name}`}>
      <PhotoBox meal={meal} height={130} radius={12} />
      <div className={s.mealName}>{meal.name}</div>
      <div className={s.mealMeta}>
        <span className={s.mealPrice}>
          <Price meal={meal} />
        </span>
        {meal.soldOut ? <span className={s.soldOut}>Sold out</span> : <span className={s.plus}>+</span>}
      </div>
    </button>
  );
}

function Price({ meal }: { meal: MenuMeal }) {
  return (
    <>
      {meal.options.length > 1 ? 'from ' : ''}
      {gbp(fromPrice(meal))}
    </>
  );
}

function Standard() {
  return (
    <section className={s.section}>
      <div className={s.standard}>
        <div className={s.eyebrow} style={{ color: 'var(--amber)' }}>
          The OlaJesu standard
        </div>
        <h2 className={`${s.h2} ${s.upper}`}>What&apos;s in every pot</h2>
        <div className={s.standardGrid}>
          {[
            ['500 g', 'A generous portion', 'One proper meal, not a snack box.'],
            ['Fresh', 'Cooked each week', 'Never frozen, never shipped across the country.'],
            ['14', 'Allergens on every label', 'Full ingredients on every Meal page and on the pack.'],
            ['Minutes', 'From fridge to plate', 'Reheat in the microwave until piping hot.'],
          ].map(([big, title, text]) => (
            <div key={title} className={s.standardRow}>
              <div className={s.standardBig}>{big}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className={s.section}>
      <div className={s.story}>
        <div className={s.storyPhoto}>Photo: the kitchen (to come)</div>
        <div>
          <div className={s.eyebrow}>Meet the kitchen</div>
          <h2 className={`${s.h2} ${s.upper}`}>Why Manchester trusts OlaJesu</h2>
          <p className={s.body}>Our story is coming soon: who cooks, where the recipes come from, and why OlaJesu started.</p>
          <blockquote className={s.quote}>&ldquo;Food that carries the flavour of home.&rdquo;</blockquote>
          <button className={s.pillDark} onClick={() => scrollTo('ways')}>
            Order now
          </button>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className={`${s.section} ${s.center}`}>
      <div className={s.eyebrow}>Customer stories</div>
      <h2 className={s.h2}>
        Hear it from <span className={s.accentOrange}>our customers</span>
      </h2>
      <div className={s.reviews}>
        {[1, 2, 3].map(n => (
          <div key={n} className={s.review}>
            Customer review {n} (to come)
          </div>
        ))}
      </div>
    </section>
  );
}

function Delivery() {
  const { deliveryLabel, cutoffLabel, isPlaceholder } = DELIVERY_PLACEHOLDER;
  return (
    <section className={s.section}>
      <div className={s.eyebrow}>How it gets to you</div>
      <h2 className={`${s.h2} ${s.upper}`}>We bring the kitchen to you</h2>
      <div className={s.deliveryGrid}>
        {[
          [`${deliveryLabel} delivery`, `Order by ${cutoffLabel} for delivery across Greater Manchester.`, 'Fee to come'],
          ['Collect from the kitchen', 'Pick up from Mary Street, if collection is offered.', 'Free'],
        ].map(([title, text, price]) => (
          <div key={title} className={s.deliveryCard}>
            <div className={s.deliveryTop}>
              <span>{title}</span>
              <span className={s.accentOrange}>{price}</span>
            </div>
            <div className={s.small} style={{ marginTop: 4 }}>
              {text}
            </div>
          </div>
        ))}
      </div>
      {isPlaceholder && <p className={s.note}>Delivery days, areas and fees are placeholders until the delivery rules are set.</p>}
    </section>
  );
}
