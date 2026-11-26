import config from '@payload-config';
import { getPayload, type Payload } from 'payload';
import type Stripe from 'stripe';

import { currentCustomer } from '../../../lib/account';
import { reconcile, type Basket, type Choice } from '../../../lib/basket';
import { deliveryDateFor } from '../../../lib/delivery';
import { getMenu } from '../../../lib/menu';
import { newAccessToken, newOrderNumber, snapshotBasket } from '../../../lib/orders';
import { shopEnabled } from '../../../lib/shop';
import { getStripe } from '../../../lib/stripe';
import type { Customer } from '../../../payload-types';

const MAX_MEALS = 60;

const json = (body: unknown, status = 200) => Response.json(body, { status });

/**
 * Starts checkout: re-checks the basket against today's menu, prices it on the server,
 * records the Order as "awaiting payment", and hands the Customer to Stripe's hosted page.
 * The browser's own prices are never used.
 */
export async function POST(request: Request) {
  if (!shopEnabled()) return json({ error: 'Ordering is not open yet.' }, 404);

  // Only the shop's own pages may start a checkout.
  const origin = request.headers.get('origin');
  const self = new URL(request.url).origin;
  if (origin && origin !== self) return json({ error: 'Not allowed.' }, 403);

  let body: { basket?: unknown; marketingConsent?: unknown; updateSavedDetails?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 400);
  }
  const basket = parseBasket(body.basket);
  if (!basket) return json({ error: 'Your basket could not be read. Please refresh the page and try again.' }, 400);

  const menu = await getMenu();
  const { basket: current, changes } = reconcile(menu, basket);
  if (changes.length) {
    // Never charge for something that just changed: show the Customer first.
    return json({ error: 'Your basket changed.', changes, basket: current }, 409);
  }

  const snapshot = snapshotBasket(menu, current);
  const { priced } = snapshot;
  if (!priced.mealCount) return json({ error: 'Your basket is empty.' }, 400);
  if (priced.mealCount > MAX_MEALS) {
    return json({ error: `For more than ${MAX_MEALS} Meals, please send a catering enquiry.` }, 400);
  }
  if (priced.incompletePacks.length) {
    return json({ error: 'Finish your Pack, or buy its Meals as single Meals, before checking out.' }, 400);
  }

  const stripe = getStripe();
  if (!stripe) return json({ error: 'Card payments are not set up yet. Please try again soon.' }, 503);

  const payload = await getPayload({ config });
  const customer = await currentCustomer(payload);
  const accessToken = newAccessToken();
  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      number: newOrderNumber(),
      status: 'awaiting-payment',
      deliveryDate: deliveryDateFor(new Date()),
      summary: snapshot.summary,
      items: snapshot.items,
      subtotal: snapshot.subtotal,
      savings: snapshot.savings,
      total: snapshot.subtotal,
      marketingConsent: body.marketingConsent === true,
      // Signed in: the Order's email is the Account's (Accounts ticket).
      email: customer?.email ?? null,
      updateSavedDetails: !!customer && body.updateSavedDetails === true,
      accessToken,
    },
  });

  const base = process.env.NEXT_PUBLIC_SERVER_URL || self;
  try {
    const stripeCustomer = customer ? await stripeCustomerFor(payload, stripe, customer) : null;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'gbp',
      locale: 'en-GB',
      line_items: snapshot.stripeLines,
      shipping_address_collection: { allowed_countries: ['GB'] },
      phone_number_collection: { enabled: true },
      // Signed in: Stripe's page opens with the saved name, phone and address, and the email fixed.
      ...(stripeCustomer ? { customer: stripeCustomer, customer_update: { shipping: 'auto' as const, name: 'auto' as const } } : {}),
      metadata: { orderId: String(order.id), orderNumber: order.number },
      payment_intent_data: { metadata: { orderId: String(order.id), orderNumber: order.number } },
      custom_text: {
        submit: {
          message: 'Fresh food: you can cancel for a full refund until the order cut-off, but not after, as cooking has started.',
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      success_url: `${base}/order/${order.id}/confirmed?t=${accessToken}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?checkout=cancelled`,
    });
    await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { stripeSessionId: session.id } });
    return json({ url: session.url });
  } catch (err) {
    payload.logger.error({ err, msg: `Stripe checkout failed for Order ${order.number}` });
    await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { status: 'expired' } });
    return json({ error: 'We could not start the payment. Please try again.' }, 502);
  }
}

/** The Account's Stripe Customer, created once and kept up to date with the saved details. */
async function stripeCustomerFor(payload: Payload, stripe: Stripe, customer: Customer) {
  const address = customer.addressLine1 && customer.postcode
    ? { line1: customer.addressLine1, line2: customer.addressLine2 ?? undefined, city: customer.city ?? undefined, postal_code: customer.postcode, country: 'GB' }
    : undefined;
  const details = {
    email: customer.email,
    name: customer.name ?? undefined,
    phone: customer.phone ?? undefined,
    ...(address && customer.name ? { shipping: { name: customer.name, phone: customer.phone ?? undefined, address } } : {}),
  };
  if (customer.stripeCustomerId) {
    await stripe.customers.update(customer.stripeCustomerId, details);
    return customer.stripeCustomerId;
  }
  const created = await stripe.customers.create({ ...details, metadata: { accountId: String(customer.id) } });
  await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, data: { stripeCustomerId: created.id } });
  return created.id;
}

/** Accepts only a well-formed basket; anything else is rejected rather than guessed at. */
function parseBasket(value: unknown): Basket | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const isInt = (n: unknown): n is number => Number.isInteger(n) && (n as number) > 0 && (n as number) < 1e9;
  const choice = (c: unknown): Choice | null => {
    if (!c || typeof c !== 'object') return null;
    const { mealId, optionId, addOnIds } = c as Record<string, unknown>;
    if (!isInt(mealId)) return null;
    if (optionId !== null && typeof optionId !== 'string') return null;
    if (!Array.isArray(addOnIds) || addOnIds.length > 20 || !addOnIds.every(isInt)) return null;
    return { mealId, optionId: optionId as string | null, addOnIds: [...new Set(addOnIds)] };
  };
  if (!Array.isArray(v.lines) || !Array.isArray(v.packs) || v.lines.length > 100 || v.packs.length > 20) return null;
  const lines = [];
  for (const l of v.lines as Record<string, unknown>[]) {
    const c = choice(l?.choice);
    if (!c || !isInt(l.qty) || l.qty > 1000 || typeof l.key !== 'string') return null;
    lines.push({ key: l.key, choice: c, qty: l.qty });
  }
  const packs = [];
  for (const p of v.packs as Record<string, unknown>[]) {
    if (!p || !isInt(p.size) || typeof p.key !== 'string' || !Array.isArray(p.items) || p.items.length > p.size) return null;
    const items = (p.items as unknown[]).map(choice);
    if (items.some(i => !i)) return null;
    packs.push({ key: p.key, size: p.size, items: items as Choice[] });
  }
  return { lines, packs, activePack: null };
}
