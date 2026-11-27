import config from '@payload-config';
import { getPayload, type Payload, type PayloadRequest } from 'payload';

import type { OrderItem } from './orders';
import { DEFAULT_RULES, openDates, type DeliveryRules, type OpenDate } from './delivery';

const words = (s: string | null | undefined) =>
  (s ?? '')
    .toUpperCase()
    .split(/[\s,;]+/)
    .map(w => w.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean);

/** The Master admin's "Delivery and collection" settings, as rules the shop and kitchen use. */
export async function getDeliveryRules(payload: Payload, req?: PayloadRequest): Promise<DeliveryRules> {
  // Pass `req` from inside a hook, so the read joins that change's database transaction.
  const s = await payload.findGlobal({ slug: 'delivery-settings', overrideAccess: true, depth: 0, req }).catch(() => null);
  if (!s) return DEFAULT_RULES;
  const days = (s.deliveryDays ?? [])
    .filter(d => d.day !== null && d.day !== undefined)
    .map(d => ({ day: Number(d.day), cutoffDaysBefore: d.cutoffDaysBefore ?? 2, cutoffHour: Number(d.cutoffHour ?? 20) }));
  return {
    draft: s.draft !== false,
    days: days.length ? days : DEFAULT_RULES.days,
    closed: (s.closedDates ?? []).map(c => c.date?.slice(0, 10)).filter((d): d is string => !!d),
    dailyMealLimit: s.dailyMealLimit ?? null,
    areas: (s.areas ?? []).map(a => ({ name: a.name, fee: a.fee ?? 0, freeOver: a.freeOver ?? null, postcodes: words(a.postcodes) })),
    deliveryWindow: s.deliveryWindow ?? '',
    failedDelivery: s.failedDelivery ?? '',
    collection: { enabled: !!s.collection?.enabled, address: s.collection?.address ?? '', times: s.collection?.times ?? '' },
  };
}

/** Orders that take up kitchen capacity: paid ones, and checkouts still open on Stripe's page. */
const COUNTED = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'partly-refunded'] as const;
const CHECKOUT_MINUTES = 65;

/** Meals already ordered for a delivery date: in total and per Meal. */
export async function orderedFor(payload: Payload, deliveryDate: string) {
  const since = new Date(Date.now() - CHECKOUT_MINUTES * 60_000).toISOString();
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    pagination: false,
    select: { items: true },
    where: {
      and: [
        { deliveryDate: { equals: deliveryDate } },
        { or: [{ status: { in: [...COUNTED] } }, { and: [{ status: { equals: 'awaiting-payment' } }, { createdAt: { greater_than: since } }] }] },
      ],
    },
  });
  return countMeals(docs.map(d => (d.items ?? []) as OrderItem[]));
}

/** How many Meals, in total and per Meal id, a set of Orders' items holds. */
export function countMeals(orders: OrderItem[][]) {
  const perMeal = new Map<number, number>();
  let total = 0;
  for (const items of orders) {
    for (const item of items) {
      const each = item.kind === 'single' ? item.qty : 1;
      for (const m of item.meals) {
        const id = m.choice?.mealId;
        total += each;
        if (id) perMeal.set(id, (perMeal.get(id) ?? 0) + each);
      }
    }
  }
  return { total, perMeal };
}

/** Each Meal's Daily limit (staff-only, so read on the server). */
export async function mealLimits(payload: Payload) {
  const { docs } = await payload.find({ collection: 'meals', overrideAccess: true, depth: 0, pagination: false, select: { dailyLimit: true, name: true } });
  return new Map(docs.filter(m => m.dailyLimit).map(m => [m.id, { limit: m.dailyLimit as number, name: m.name }]));
}

/** What the shop needs to know per open date: whether the day is full, and which Meals are sold out. */
export type DayAvailability = OpenDate & { full: boolean; soldOut: number[] };

export async function shopDates(payload: Payload, rules: DeliveryRules, now = new Date()): Promise<DayAvailability[]> {
  const dates = openDates(rules, now);
  const limits = await mealLimits(payload);
  return Promise.all(
    dates.map(async d => {
      const { total, perMeal } = await orderedFor(payload, d.date);
      return {
        ...d,
        full: rules.dailyMealLimit !== null && total >= rules.dailyMealLimit,
        soldOut: [...limits].filter(([id, l]) => (perMeal.get(id) ?? 0) >= l.limit).map(([id]) => id),
      };
    }),
  );
}

/**
 * Can this basket still be cooked for this date? Null if so, else what to tell the Customer.
 * Checked at checkout, against the Orders already counted for the date.
 */
export async function capacityProblem(payload: Payload, rules: DeliveryRules, deliveryDate: string, items: OrderItem[], when: string) {
  const [{ total, perMeal }, limits] = await Promise.all([orderedFor(payload, deliveryDate), mealLimits(payload)]);
  const wanted = countMeals([items]);
  if (rules.dailyMealLimit !== null && total + wanted.total > rules.dailyMealLimit) {
    const left = Math.max(0, rules.dailyMealLimit - total);
    return left ? `We can only cook ${left} more Meal${left === 1 ? '' : 's'} for ${when}. Choose fewer, or another day.` : `${when} is fully booked. Please choose another day.`;
  }
  for (const [id, n] of wanted.perMeal) {
    const l = limits.get(id);
    if (!l) continue;
    const left = Math.max(0, l.limit - (perMeal.get(id) ?? 0));
    if (n > left) return left ? `Only ${left} ${l.name} left for ${when}. Choose fewer, or another day.` : `${l.name} is sold out for ${when}. Remove it, or choose another day.`;
  }
  return null;
}

/** What the shop's pages need about delivery: the open dates with what's left, areas and fees, collection. */
export type ShopDelivery = Pick<DeliveryRules, 'draft' | 'areas' | 'deliveryWindow' | 'collection'> & { dates: DayAvailability[] };

export async function getShopDelivery(payload: Payload): Promise<ShopDelivery> {
  const rules = await getDeliveryRules(payload);
  return { draft: rules.draft, areas: rules.areas, deliveryWindow: rules.deliveryWindow, collection: rules.collection, dates: await shopDates(payload, rules) };
}

/** For the shop's pages. */
export const loadShopDelivery = async () => getShopDelivery(await getPayload({ config }));
