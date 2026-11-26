import config from '@payload-config';
import { getPayload } from 'payload';

import type { AddOn, Meal } from '../payload-types';
import type { Menu, MenuAddOn, MenuMeal } from './basket';

const pence = (pounds: number | null | undefined) => (pounds === null || pounds === undefined ? null : Math.round(pounds * 100));

/**
 * Today's menu as a Customer may see it: only Meals and Add-ons that are on the menu
 * (available or sold out), prices in pence, and today's Pack discounts. Read with the
 * public's access rules, so staff-only fields never reach the shop.
 */
export async function getMenu(): Promise<Menu> {
  const payload = await getPayload({ config });
  const [meals, addOns, packs] = await Promise.all([
    payload.find({ collection: 'meals', overrideAccess: false, depth: 0, limit: 200, sort: 'sortOrder', pagination: false }),
    payload.find({ collection: 'add-ons', overrideAccess: false, depth: 0, limit: 200, sort: 'sortOrder', pagination: false }),
    payload.findGlobal({ slug: 'pack-settings', overrideAccess: false, depth: 0 }),
  ]);

  const onMenuAddOns = addOns.docs.filter(a => a.status !== 'hidden').map(toAddOn);
  const addOnIds = new Set(onMenuAddOns.map(a => a.id));

  return {
    meals: meals.docs.filter(m => m.status !== 'hidden').map(m => toMeal(m, addOnIds)),
    addOns: onMenuAddOns,
    packs: (packs.packs ?? []).map(p => ({ size: p.size, discountPercent: p.discountPercent })).sort((a, b) => a.size - b.size),
  };
}

function toMeal(m: Meal, addOnIds: Set<number>): MenuMeal {
  return {
    id: m.id,
    slug: m.slug ?? String(m.id),
    name: m.name,
    category: m.category,
    description: m.description ?? '',
    price: m.options?.length ? null : pence(m.price),
    options: (m.options ?? []).map(o => ({ id: o.id ?? o.name, name: o.name, price: pence(o.price) ?? 0 })),
    addOnIds: (m.addOns ?? []).map(a => (typeof a === 'number' ? a : a.id)).filter(id => addOnIds.has(id)),
    ingredients: m.ingredients ?? '',
    allergens: m.allergens ?? [],
    mayContain: m.mayContain ?? '',
    spice: m.spice ?? null,
    halal: !!m.halal,
    portionGrams: m.portionGrams ?? 500,
    storage: m.storage ?? '',
    reheating: m.reheating ?? '',
    shelfLifeDays: m.shelfLifeDays,
    soldOut: m.status === 'sold-out',
  };
}

function toAddOn(a: AddOn): MenuAddOn {
  return {
    id: a.id,
    name: a.name,
    price: pence(a.price) ?? 0,
    ingredients: a.ingredients ?? '',
    allergens: a.allergens ?? [],
    mayContain: a.mayContain ?? '',
    soldOut: a.status === 'sold-out',
  };
}
