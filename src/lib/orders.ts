import { randomBytes } from 'crypto';
import type { Payload } from 'payload';
import type Stripe from 'stripe';

import { allergenLabel } from './allergens';
import { areaFor } from './delivery';
import { getDeliveryRules } from './deliverySettings';
import { tally } from './text';
import { addOnById, addOnsPence, describeChoice, mealById, mealPence, packDiscountPence, priceBasket, type Basket, type Choice, type Menu } from './basket';

const pounds = (pence: number) => Math.round(pence) / 100;

/** A short, readable Order number without look-alike characters (no 0/O, 1/I). */
export function newOrderNumber() {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes(6);
  return `OJ-${Array.from(bytes, b => alphabet[b % alphabet.length]).join('')}`;
}

export const newAccessToken = () => randomBytes(24).toString('hex');

/** One Meal as sold, with its allergens as they were at the time of sale. */
export type OrderMeal = {
  name: string;
  addOns: string;
  addOnNames: string[];
  mealPrice: number;
  paidForMeal: number;
  addOnsPrice: number;
  allergens: string[];
  mayContain: string;
  /** What the Customer chose, so the Order can be reordered from today's menu. */
  choice?: Choice;
};

export type OrderItem = {
  kind: 'single' | 'pack';
  label: string;
  /** Pack size, or the quantity of a single Meal. */
  qty: number;
  discountPercent: number;
  meals: OrderMeal[];
  total: number;
};

/**
 * What the Customer is buying, priced on the server from today's menu, as the record kept on
 * the Order and the lines shown on Stripe's page. All money on the Order is in pounds; Stripe
 * gets pence.
 */
export function snapshotBasket(menu: Menu, basket: Basket) {
  const priced = priceBasket(menu, basket);
  const items: OrderItem[] = [];
  const stripeLines: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const { line, unit } of priced.lines) {
    const d = describeChoice(menu, line.choice);
    const label = d.addOns ? `${d.name} + ${d.addOns}` : d.name;
    items.push({
      kind: 'single',
      label,
      qty: line.qty,
      discountPercent: 0,
      meals: [orderMeal(menu, line.choice, 0)],
      total: pounds(unit * line.qty),
    });
    stripeLines.push({ quantity: line.qty, price_data: { currency: 'gbp', unit_amount: unit, product_data: { name: label } } });
  }

  for (const p of priced.packs) {
    const meals = p.pack.items.map(it => orderMeal(menu, it, p.discountPercent));
    const label = `${p.pack.size}-Pack, ${p.discountPercent}% off each Meal`;
    items.push({ kind: 'pack', label, qty: p.pack.size, discountPercent: p.discountPercent, meals, total: pounds(p.total) });
    const contents = meals.map(m => (m.addOns ? `${m.name} + ${m.addOns}` : m.name));
    stripeLines.push({
      quantity: 1,
      price_data: { currency: 'gbp', unit_amount: p.total, product_data: { name: label, description: tally(contents).slice(0, 500) } },
    });
  }

  const summary = items
    .map(i => (i.kind === 'single' ? `${i.qty} × ${i.label}` : `${i.label}:\n${tally(i.meals.map(m => (m.addOns ? `${m.name} + ${m.addOns}` : m.name))).replace(/, /g, '\n')}`))
    .join('\n');

  return { priced, items, stripeLines, summary, subtotal: pounds(priced.total), savings: pounds(priced.saved) };
}

function orderMeal(menu: Menu, choice: Choice, discountPercent: number): OrderMeal {
  const d = describeChoice(menu, choice);
  const meal = mealById(menu, choice.mealId);
  const addOns = choice.addOnIds.map(id => addOnById(menu, id)).filter(a => !!a);
  const full = mealPence(menu, choice) ?? 0;
  const allergens = [...new Set([...(meal?.allergens ?? []), ...addOns.flatMap(a => a.allergens)])].map(allergenLabel);
  const mayContain = [meal?.mayContain, ...addOns.map(a => a.mayContain)].filter(Boolean).join('; ');
  return {
    name: d.name,
    addOns: d.addOns,
    addOnNames: addOns.map(a => a.name),
    mealPrice: pounds(full),
    paidForMeal: pounds(full - packDiscountPence(full, discountPercent)),
    addOnsPrice: pounds(addOnsPence(menu, choice)),
    allergens,
    mayContain,
    choice,
  };
}


function formatAddress(details: Stripe.Checkout.Session['collected_information'] | null | undefined, customer: Stripe.Checkout.Session['customer_details']) {
  const shipping = details?.shipping_details;
  const a = shipping?.address ?? customer?.address;
  if (!a) return '';
  return [shipping?.name, a.line1, a.line2, a.city, a.state, a.postal_code].filter(Boolean).join('\n');
}

/**
 * Marks an Order paid from a Stripe Checkout Session. Safe to call more than once and from
 * more than one place (webhook and confirmation page): only an unpaid Order whose session id
 * matches and whose session Stripe reports as paid is changed.
 */
export async function markPaidFromSession(payload: Payload, session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return { changed: false, reason: 'not paid' } as const;
  const orderId = session.metadata?.orderId;
  if (!orderId) return { changed: false, reason: 'no order id' } as const;

  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true, disableErrors: true });
  if (!order || order.stripeSessionId !== session.id) return { changed: false, reason: 'no matching order' } as const;
  if (order.status !== 'awaiting-payment' && order.status !== 'expired') return { changed: false, reason: 'already handled' } as const;

  const paid = pounds(session.amount_total ?? 0);
  if (Math.abs(paid - order.total) > 0.001) {
    // Never expected: prices are fixed on the Order before Stripe sees them. Flag it rather than hide it.
    payload.logger.error(`Order ${order.number}: Stripe charged £${paid} but the Order total is £${order.total}`);
  }

  // Delivery: the postcode was checked before payment, but Stripe's page lets the Customer type any
  // address. One outside every delivery area is flagged for the kitchen rather than refused.
  const collecting = order.fulfilment === 'collection';
  const address = collecting ? '' : formatAddress(session.collected_information, session.customer_details);
  const postcode = session.collected_information?.shipping_details?.address?.postal_code ?? '';
  const outside = !collecting && !areaFor(await getDeliveryRules(payload), postcode);

  await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    data: {
      status: 'paid',
      addressCheck: outside ? `${postcode || 'No postcode'} is outside the delivery areas. Call the Customer, or refund.` : null,
      paidAt: new Date().toISOString(),
      email: (session.customer_details?.email ?? order.email ?? '').trim().toLowerCase() || null,
      customerName: session.collected_information?.shipping_details?.name ?? session.customer_details?.name ?? order.customerName,
      phone: session.customer_details?.phone ?? order.phone,
      deliveryAddress: collecting ? null : address || order.deliveryAddress,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null),
    },
  });
  return { changed: true, number: order.number, id: order.id } as const;
}

/** A Checkout Session that expired unpaid: the Order is kept as abandoned, never charged. */
export async function markExpiredFromSession(payload: Payload, session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return false;
  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true, disableErrors: true });
  if (!order || order.stripeSessionId !== session.id || order.status !== 'awaiting-payment') return false;
  await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { status: 'expired' } });
  return true;
}
