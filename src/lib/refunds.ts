import type { Payload } from 'payload';
import type Stripe from 'stripe';

import type { Order } from '../payload-types';
import { logActivityAs } from './activity';
import { cutoffFor } from './delivery';
import type { OrderItem } from './orders';

/*
 * Cancellations and refunds (refunds ticket; CONTEXT.md: Cancellation, Refund):
 * - a Customer can cancel a paid Order for a full refund until the Cut-off, not after;
 * - the kitchen can cancel an Order, with an automatic full refund;
 * - the Master admin can refund the whole Order or chosen Meals (with their Add-ons).
 * Money goes back to the card through Stripe; every refund is kept on the Order.
 */

export class RefundError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** One Meal as sold, with what was paid for it including its Add-ons: the unit refunds are made in. */
export type Unit = { key: string; label: string; amount: number };

export function orderUnits(order: Pick<Order, 'items'>): Unit[] {
  const units: Unit[] = [];
  ((order.items ?? []) as OrderItem[]).forEach((item, i) => {
    if (item.kind === 'single') {
      const m = item.meals[0];
      for (let n = 0; n < item.qty; n++) {
        units.push({ key: `${i}.${n}`, label: m.addOns ? `${m.name} + ${m.addOns}` : m.name, amount: round2(m.paidForMeal + m.addOnsPrice) });
      }
    } else {
      item.meals.forEach((m, j) => {
        units.push({ key: `${i}.${j}`, label: `${m.addOns ? `${m.name} + ${m.addOns}` : m.name} (in the ${item.qty}-Pack)`, amount: round2(m.paidForMeal + m.addOnsPrice) });
      });
    }
  });
  return units;
}

export const refundedUnits = (order: Pick<Order, 'refundedUnits'>) => new Set((order.refundedUnits as string[] | null) ?? []);
export const refundable = (order: Pick<Order, 'total' | 'refundedTotal'>) => round2(order.total - (order.refundedTotal ?? 0));

const PAID = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'partly-refunded'];

/** Can the Customer still cancel this Order themselves? Before the Cut-off, and only if nothing is refunded yet. */
export function canCustomerCancel(order: Pick<Order, 'status' | 'deliveryDate' | 'refundedTotal'>, now = new Date()) {
  return (order.status === 'paid' || order.status === 'preparing') && !(order.refundedTotal ?? 0) && now < cutoffFor(order.deliveryDate);
}

type Kind = 'customer-cancel' | 'kitchen-cancel' | 'refund';

/**
 * Refunds an Order through Stripe and records it. Cancellations refund everything not yet
 * refunded; a staff refund covers the chosen Meals. Safe against a double click: Stripe gets an
 * idempotency key, and a refund Stripe has already reported is never recorded twice.
 */
export async function refundOrder(
  payload: Payload,
  stripe: Pick<Stripe, 'refunds'>,
  orderId: number,
  opts: { kind: Kind; unitKeys?: string[]; reason: string; staffId?: number | null },
) {
  const order = await payload.findByID({ collection: 'orders', id: orderId, overrideAccess: true, showHiddenFields: true, depth: 0 });
  if (!PAID.includes(order.status)) throw new RefundError('This Order isn’t paid, or is already cancelled or refunded.');
  if (!order.stripePaymentIntentId) throw new RefundError('There’s no card payment on this Order to refund.');
  if (opts.kind === 'customer-cancel' && !canCustomerCancel(order)) throw new RefundError('It’s past the cut-off, so this Order can no longer be cancelled.');

  const units = orderUnits(order);
  const done = refundedUnits(order);
  let chosen: Unit[];
  if (opts.kind === 'refund') {
    const keys = new Set(opts.unitKeys ?? []);
    chosen = units.filter(u => keys.has(u.key));
    if (!chosen.length || chosen.length !== keys.size) throw new RefundError('Choose at least one Meal to refund.');
    if (chosen.some(u => done.has(u.key))) throw new RefundError('One of those Meals has already been refunded.');
  } else {
    chosen = units.filter(u => !done.has(u.key));
  }

  const left = refundable(order);
  const amount = opts.kind === 'refund' ? Math.min(round2(chosen.reduce((s, u) => s + u.amount, 0)), left) : left;
  const pence = Math.round(amount * 100);
  if (pence <= 0) throw new RefundError('There’s nothing left to refund on this Order.');

  const refund = await stripe.refunds.create(
    {
      payment_intent: order.stripePaymentIntentId,
      amount: pence,
      reason: opts.kind === 'customer-cancel' ? 'requested_by_customer' : undefined,
      metadata: { orderId: String(order.id), orderNumber: order.number, kind: opts.kind },
    },
    { idempotencyKey: `refund-${order.id}-${(order.refunds ?? []).length}-${pence}` },
  );
  // A double click sends the same idempotency key, so Stripe returns the same refund: record it once.
  const fresh = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true, depth: 0 });
  if ((fresh.refunds ?? []).some(r => r.stripeRefundId === refund.id)) return { order: fresh, amount, units: chosen, repeated: true };

  const refundedTotal = round2((order.refundedTotal ?? 0) + amount);
  const cancel = opts.kind !== 'refund';
  const status = cancel ? 'cancelled' : refundedTotal >= order.total ? 'refunded' : 'partly-refunded';
  const details = chosen.map(u => `${u.label} £${u.amount.toFixed(2)}`).join('\n');
  const updated = await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    data: {
      status,
      refundedTotal,
      refundedUnits: [...done, ...chosen.map(u => u.key)],
      refunds: [...(order.refunds ?? []), { amount, at: new Date().toISOString(), reason: opts.reason.slice(0, 200), details, by: opts.staffId ?? null, stripeRefundId: refund.id }],
      ...(cancel ? { cancelledAt: new Date().toISOString(), cancelledBy: opts.kind === 'customer-cancel' ? ('customer' as const) : ('kitchen' as const) } : {}),
    },
  });

  const what = opts.kind === 'customer-cancel' ? 'Order cancelled by the Customer' : opts.kind === 'kitchen-cancel' ? 'Kitchen cancelled an Order' : 'Refund made';
  await logActivityAs(payload, opts.staffId ?? null, what, `${order.number}: £${amount.toFixed(2)}${opts.reason ? `, ${opts.reason}` : ''}`);
  return { order: updated, amount, units: chosen, repeated: false };
}
