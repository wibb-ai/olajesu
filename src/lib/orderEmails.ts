import type { Payload, PayloadRequest } from 'payload';

import { businessConfig } from '../config/businessConfig';
import type { Order } from '../payload-types';
import { DELIVERY_PLACEHOLDER } from './delivery';
import { emailLayout, escapeHtml as e, h1, muted, p, sendEmail } from './email';
import { tally, type OrderItem, type OrderMeal } from './orders';

/*
 * The emails that go with an Order (notifications ticket). Wording is fixed here, not in the
 * dashboard, so the legally required parts (allergens, the cancellation notice, business
 * details) can't be dropped by accident.
 */

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
export const longDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' });

type Settings = { kitchenInbox?: string | null; emailEachOrder?: boolean | null; kitchenNote?: string | null };

/** Pass `req` from inside a hook, so the read joins that change's database transaction. */
async function settings(payload: Payload, req?: PayloadRequest): Promise<Settings> {
  return payload.findGlobal({ slug: 'kitchen-settings', overrideAccess: true, depth: 0, req });
}
const kitchenInbox = (s: Settings) => s.kitchenInbox || process.env.ENQUIRY_TO_EMAIL || businessConfig.contact.email;

const businessFooter = () => {
  const { contact, business } = businessConfig;
  return `${e(business.name)} · ${e(contact.address.full)} · <a href="mailto:${e(contact.email)}" style="color:#6B6355;">${e(contact.email)}</a>`;
};

const mealLine = (m: OrderMeal) => (m.addOns ? `${m.name} + ${m.addOns}` : m.name);
const allergenText = (m: OrderMeal) =>
  `${m.allergens.length ? `Contains: ${m.allergens.join(', ')}` : 'Contains none of the 14 allergens'}${m.mayContain ? `. May contain: ${m.mayContain}` : ''}`;

/** Each distinct Meal in the Order once, with its allergens. */
function allergenList(items: OrderItem[]) {
  const seen = new Map<string, OrderMeal>();
  for (const it of items) for (const m of it.meals) seen.set(mealLine(m), m);
  return [...seen.values()];
}

// ---------------------------------------------------------------------------
// Customer: Order confirmation (legally required)

export function confirmationEmail(order: Order, s: Settings) {
  const items = (order.items ?? []) as OrderItem[];
  const delivery = longDate(order.deliveryDate);
  const cancelNotice = `You can cancel for a full refund until the order cut-off (${DELIVERY_PLACEHOLDER.cutoffLabel} before delivery): reply to this email with your Order number. After the cut-off we can't cancel, because fresh food is cooked to order and the legal 14-day right to cancel doesn't apply to it.`;

  const rows = items
    .map(it => {
      const head = it.kind === 'single' ? `${it.qty} × ${e(it.label)}` : e(it.label);
      const contents = it.kind === 'pack' ? `<br>${muted(e(tally(it.meals.map(mealLine))))}` : '';
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #EDE6D3;">${head}${contents}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #EDE6D3;white-space:nowrap;">${gbp(it.total)}</td></tr>`;
    })
    .join('');
  const savings = order.savings ? `<tr><td style="padding:8px 0;color:#1B4332;">Pack savings</td><td align="right" style="color:#1B4332;">−${gbp(order.savings)}</td></tr>` : '';
  const allergens = allergenList(items)
    .map(m => `<li style="margin:0 0 6px;"><b>${e(mealLine(m))}</b>: ${e(allergenText(m))}</li>`)
    .join('');

  const html = emailLayout({
    preheader: `Order ${order.number} for ${delivery}`,
    body: [
      h1('Thank you, your Order is confirmed'),
      p(`Order <b>${e(order.number)}</b> · delivery on <b>${e(delivery)}</b>`),
      s.kitchenNote ? p(`<i>${e(s.kitchenNote)}</i>`) : '',
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:8px 0 16px;">${rows}${savings}<tr><td style="padding:10px 0;font-weight:bold;">Paid</td><td align="right" style="font-weight:bold;">${gbp(order.total)}</td></tr></table>`,
      order.deliveryAddress ? p(`<b>Delivering to</b><br>${e(order.deliveryAddress).replace(/\n/g, '<br>')}`) : '',
      `<h2 style="font-size:16px;margin:18px 0 8px;">Allergens</h2><ul style="padding-left:18px;margin:0 0 14px;font-size:14px;">${allergens}</ul>`,
      p(muted('Full ingredients, storage and reheating are on each Meal’s page and on the label. Keep chilled and eat by the use-by date.')),
      `<h2 style="font-size:16px;margin:18px 0 8px;">Cancelling</h2>`,
      p(e(cancelNotice)),
      p(`A problem with your Order? Reply to this email within 24 hours of delivery, with a photo if you can, and we'll put it right.`),
    ].join(''),
    footer: businessFooter(),
  });

  const text = [
    `Thank you, your Order is confirmed`,
    `Order ${order.number} · delivery on ${delivery}`,
    s.kitchenNote ? `\n${s.kitchenNote}` : '',
    '',
    ...items.map(it => (it.kind === 'single' ? `${it.qty} × ${it.label}  ${gbp(it.total)}` : `${it.label}  ${gbp(it.total)}\n  ${tally(it.meals.map(mealLine))}`)),
    order.savings ? `Pack savings  −${gbp(order.savings)}` : '',
    `Paid  ${gbp(order.total)}`,
    order.deliveryAddress ? `\nDelivering to:\n${order.deliveryAddress}` : '',
    '\nAllergens',
    ...allergenList(items).map(m => `- ${mealLine(m)}: ${allergenText(m)}`),
    '\nCancelling',
    cancelNotice,
    "\nA problem with your Order? Reply within 24 hours of delivery, with a photo if you can, and we'll put it right.",
    `\n${businessConfig.business.name} · ${businessConfig.contact.address.full} · ${businessConfig.contact.email}`,
  ]
    .filter(line => line !== '')
    .join('\n');

  return { subject: `Your OlaJesu Order ${order.number} is confirmed`, html, text };
}

/** Sends the confirmation once; safe to call again (it checks confirmationSentAt). */
export async function sendOrderConfirmation(payload: Payload, orderId: number) {
  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true });
  if (!order.email || order.confirmationSentAt || !['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered'].includes(order.status)) return false;
  const s = await settings(payload);
  const { subject, html, text } = confirmationEmail(order, s);
  const result = await sendEmail({ to: order.email, subject, html, text, replyTo: kitchenInbox(s), idempotencyKey: `confirmation-${order.id}` });
  if (result.sent) await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { confirmationSentAt: new Date().toISOString() } });
  return result.sent;
}

/** Everything that follows a payment: the Customer's confirmation and the kitchen's email. */
export async function notifyPaid(payload: Payload, orderId: number) {
  await Promise.all([sendOrderConfirmation(payload, orderId), sendKitchenNewOrder(payload, orderId)]);
}

// ---------------------------------------------------------------------------
// Kitchen: each new paid Order

export async function sendKitchenNewOrder(payload: Payload, orderId: number) {
  const s = await settings(payload);
  if (s.emailEachOrder === false) return false;
  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true });
  const delivery = longDate(order.deliveryDate);
  const admin = `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://olajesu.com'}/admin/collections/orders/${order.id}`;
  const html = emailLayout({
    preheader: `${order.number}: ${gbp(order.total)} for ${delivery}`,
    body: [h1(`New Order ${order.number}`), p(`<b>${gbp(order.total)}</b> · for <b>${e(delivery)}</b> · ${e(order.customerName ?? '')}`), `<pre style="font-family:inherit;white-space:pre-wrap;margin:0 0 14px;">${e(order.summary ?? '')}</pre>`, p(`<a href="${admin}" style="color:#1B4332;">Open in the dashboard</a>`)].join(''),
    footer: 'Sent to the Kitchen inbox for every paid Order. Switch it off in Admin → Kitchen emails.',
  });
  const text = `New Order ${order.number}\n${gbp(order.total)} for ${delivery} · ${order.customerName ?? ''}\n\n${order.summary ?? ''}\n\n${admin}`;
  return (await sendEmail({ to: kitchenInbox(s), subject: `New Order ${order.number} · ${gbp(order.total)} · ${delivery}`, html, text, idempotencyKey: `kitchen-order-${order.id}` })).sent;
}

// ---------------------------------------------------------------------------
// Customer: out for delivery / ready to collect

export async function sendStatusEmail(payload: Payload, order: Order, req?: PayloadRequest) {
  if (!order.email || (order.status !== 'out-for-delivery' && order.status !== 'ready')) return false;
  const s = await settings(payload, req);
  const out = order.status === 'out-for-delivery';
  const title = out ? 'Your Meals are on their way' : 'Your Meals are ready to collect';
  const line = out
    ? 'Our driver is out with your Order today. Please keep your phone nearby, and pop the Meals in the fridge as soon as they arrive.'
    : `Your Order is ready to collect from ${businessConfig.contact.address.full}. Please bring your Order number.`;
  const html = emailLayout({ preheader: `${order.number}: ${title.toLowerCase()}`, body: [h1(title), p(`Order <b>${e(order.number)}</b>`), p(e(line))].join(''), footer: businessFooter() });
  const text = `${title}\nOrder ${order.number}\n\n${line}\n\n${businessConfig.business.name} · ${businessConfig.contact.address.full}`;
  return (await sendEmail({ to: order.email, subject: `${title} (${order.number})`, html, text, replyTo: kitchenInbox(s), idempotencyKey: `status-${order.id}-${order.status}` })).sent;
}

// ---------------------------------------------------------------------------
// Kitchen: Cook, Packing and Delivery lists at the Cut-off

const LIST_STATUSES = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered'] as const;

export function kitchenLists(orders: Order[]) {
  const cook = new Map<string, number>();
  const addOns = new Map<string, number>();
  for (const o of orders)
    for (const it of (o.items ?? []) as OrderItem[])
      for (const m of it.meals) {
        const n = it.kind === 'single' ? it.qty : 1;
        cook.set(m.name, (cook.get(m.name) ?? 0) + n);
        for (const a of m.addOnNames ?? []) addOns.set(a, (addOns.get(a) ?? 0) + n);
      }
  const sorted = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const byPostcode = [...orders].sort((a, b) => postcode(a).localeCompare(postcode(b)));
  return { cook: sorted(cook), addOns: sorted(addOns), packing: orders, delivery: byPostcode };
}
const postcode = (o: Order) => (o.deliveryAddress ?? '').trim().split('\n').pop() ?? '';

export async function sendCutoffLists(payload: Payload, deliveryDate: string) {
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    pagination: false,
    where: { and: [{ deliveryDate: { equals: deliveryDate } }, { status: { in: [...LIST_STATUSES] } }] },
  });
  const s = await settings(payload);
  const day = longDate(deliveryDate);
  const lists = kitchenLists(docs);
  const meals = lists.cook.reduce((n, [, c]) => n + c, 0);

  const table = (rows: [string, number][]) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 16px;">${rows.map(([n, c]) => `<tr><td style="padding:3px 16px 3px 0;"><b>${c}</b></td><td>${e(n)}</td></tr>`).join('')}</table>`;
  const html = emailLayout({
    preheader: `${docs.length} Orders, ${meals} Meals for ${day}`,
    body: docs.length
      ? [
          h1(`Lists for ${day}`),
          p(`${docs.length} Order${docs.length === 1 ? '' : 's'} · ${meals} Meal${meals === 1 ? '' : 's'}`),
          `<h2 style="font-size:17px;margin:18px 0 8px;">Cook list</h2>`,
          table(lists.cook),
          lists.addOns.length ? `<h3 style="font-size:14px;margin:0 0 6px;">Add-ons</h3>${table(lists.addOns)}` : '',
          `<h2 style="font-size:17px;margin:18px 0 8px;">Packing list</h2>`,
          lists.packing.map(o => `<p style="margin:0 0 12px;"><b>${e(o.number)}</b> · ${e(o.customerName ?? '')}<br><span style="white-space:pre-wrap;">${e(o.summary ?? '')}</span></p>`).join(''),
          `<h2 style="font-size:17px;margin:18px 0 8px;">Delivery list</h2>`,
          lists.delivery
            .map(o => `<p style="margin:0 0 12px;"><b>${e(o.number)}</b> · ${e(o.customerName ?? '')} · ${e(o.phone ?? '')}<br>${e(o.deliveryAddress ?? 'No address').replace(/\n/g, ', ')}</p>`)
            .join(''),
          p(muted('Sorted by postcode. Contains Customers’ personal details: keep it to the kitchen.')),
        ].join('')
      : [h1(`Lists for ${day}`), p('No Orders for this delivery day.')].join(''),
    footer: 'Sent to the Kitchen inbox at each Cut-off.',
  });
  const text = docs.length
    ? [
        `Lists for ${day}: ${docs.length} Orders, ${meals} Meals`,
        '\nCOOK LIST',
        ...lists.cook.map(([n, c]) => `${c} × ${n}`),
        ...(lists.addOns.length ? ['\nAdd-ons', ...lists.addOns.map(([n, c]) => `${c} × ${n}`)] : []),
        '\nPACKING LIST',
        ...lists.packing.map(o => `${o.number} · ${o.customerName ?? ''}\n${o.summary ?? ''}\n`),
        '\nDELIVERY LIST (by postcode)',
        ...lists.delivery.map(o => `${o.number} · ${o.customerName ?? ''} · ${o.phone ?? ''}\n${(o.deliveryAddress ?? 'No address').replace(/\n/g, ', ')}\n`),
      ].join('\n')
    : `Lists for ${day}\nNo Orders for this delivery day.`;

  return sendEmail({ to: kitchenInbox(s), subject: `Kitchen lists for ${day}: ${docs.length} Orders, ${meals} Meals`, html, text, idempotencyKey: `lists-${deliveryDate}` });
}
