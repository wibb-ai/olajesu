import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { AddToBasket } from '../../../../components/shop/AddToBasket';
import { AllergenInfo, Ingredients, MealTags, PhotoBox } from '../../../../components/shop/parts';
import { ShopShell } from '../../../../components/shop/ShopShell';
import s from '../../../../components/shop/shop.module.css';
import { addOnById, fromPrice, gbp } from '../../../../lib/basket';
import { getMenu } from '../../../../lib/menu';
import { shopEnabled } from '../../../../lib/shop';

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  // Per request: the CSP nonce must reach Next.js's scripts, and the menu changes in the dashboard.
  await connection();
  if (!shopEnabled()) return null;
  const menu = await getMenu();
  const meal = menu.meals.find(m => m.slug === slug);
  return meal ? { menu, meal } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).slug);
  if (!found) return {};
  const { meal } = found;
  const title = `${meal.name}: Nigerian meal prep in Manchester | OlaJesu`;
  const description = `${meal.description || meal.name} ${meal.portionGrams} g, cooked fresh in Manchester and delivered chilled.`.trim();
  return { title, description, alternates: { canonical: `/meals/${meal.slug}` }, openGraph: { title, description, url: `/meals/${meal.slug}` } };
}

/**
 * One page per Meal (site-restructure ticket): shareable from Instagram, findable in search,
 * and allergen information in writing before purchase.
 */
export default async function MealPage({ params }: Props) {
  const found = await load((await params).slug);
  if (!found) notFound();
  const { menu, meal } = found;
  const addOns = meal.addOnIds.map(id => addOnById(menu, id)).filter(a => !!a);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: meal.name,
    description: meal.description,
    offers: { '@type': 'Offer', price: (fromPrice(meal) / 100).toFixed(2), priceCurrency: 'GBP', availability: meal.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
  };

  return (
    <ShopShell menu={menu}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className={s.container}>
        <div className={s.mealPage}>
          <div>
            <div className={s.crumbs} style={{ marginBottom: 12 }}>
              <Link href="/#menu">Menu</Link> / {meal.name}
            </div>
            <PhotoBox meal={meal} height={360} radius={20} />
          </div>
          <div className={s.details}>
            <h1 className={s.h2} style={{ marginTop: 0 }}>
              {meal.name}
            </h1>
            <MealTags meal={meal} />
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: '14px 0' }}>
              {meal.options.length > 1 ? 'from ' : ''}
              {gbp(fromPrice(meal))}
            </p>
            {meal.description && <p>{meal.description}</p>}
            {meal.options.length > 0 && (
              <p style={{ marginTop: 8 }}>
                Choose your protein: {meal.options.map(o => `${o.name} ${gbp(o.price)}`).join(', ')}.
              </p>
            )}
            <div style={{ margin: '18px 0' }}>
              <AddToBasket mealId={meal.id} soldOut={meal.soldOut} />
            </div>

            <h3>Allergens</h3>
            <AllergenInfo allergens={meal.allergens} mayContain={meal.mayContain} />

            <h3>Ingredients</h3>
            <p>{meal.ingredients ? <Ingredients text={meal.ingredients} /> : 'Ingredients are being checked by the kitchen.'}</p>
            <p style={{ marginTop: 6, fontSize: 12 }}>Allergens are shown in bold.</p>

            {addOns.length > 0 && (
              <>
                <h3>Add-ons</h3>
                {addOns.map(a => (
                  <p key={a.id} style={{ marginBottom: 6 }}>
                    <b style={{ color: 'var(--ink)' }}>
                      {a.name} {gbp(a.price)}
                    </b>
                    {a.ingredients && (
                      <>
                        {': '}
                        <Ingredients text={a.ingredients} />
                      </>
                    )}
                  </p>
                ))}
              </>
            )}

            {meal.storage && (
              <>
                <h3>Storage</h3>
                <p>{meal.storage}</p>
                <p style={{ marginTop: 6 }}>
                  Keeps {meal.shelfLifeDays} day{meal.shelfLifeDays === 1 ? '' : 's'} from cooking.
                </p>
              </>
            )}
            {meal.reheating && (
              <>
                <h3>Reheating</h3>
                <p>{meal.reheating}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
