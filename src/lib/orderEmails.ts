import type { Payload, PayloadRequest } from 'payload';

import { businessConfig } from '../config/businessConfig';
import type { Order } from '../payload-types';
import { cutoffFor, cutoffLabel, DEFAULT_RULES, shortCutoffLabel, type DeliveryRules } from './delivery';
import { getDeliveryRules } from './deliverySettings';
import { C, card, darkPanel, emailLayout, escapeHtml as e, moneyRow, muted, para, sendEmail, site, table } from './email';
import type { OrderItem, OrderMeal } from './orders';
import { tally } from './text';

/*
 * The emails that go with an Order (notifications ticket), in the shop's A4 style and voice.
 * Wording lives here, not in the dashboard, so the legally required parts (allergens, the
 * cancellation notice, business details) can't be dropped by accident. Each builder is a pure
 * function of the Order, so /api/dev/emails can preview them with sample data.
 */

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
export const longDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' });
const weekday = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Europe/London' });
const firstName = (o: Order) => (o.customerName ?? '').trim().split(/\s+/)[0] || '';

export type Settings = { kitchenInbox?: string | null; emailEachOrder?: boolean | null; kitchenNote?: string | null };
/** The parts of the delivery rules the Customer is told. */
export type DeliveryText = Pick<DeliveryRules, 'deliveryWindow' | 'failedDelivery' | 'collection'>;
const NO_DELIVERY_TEXT: DeliveryText = { deliveryWindow: '', failedDelivery: '', collection: { enabled: false, address: '', times: '' } };

/** Pass `req` from inside a hook, so the read joins that change's database transaction. */
async function settings(payload: Payload, req?: PayloadRequest): Promise<Settings> {
  return payload.findGlobal({ slug: 'kitchen-settings', overrideAccess: true, depth: 0, req });
}
const kitchenInbox = (s: Settings) => s.kitchenInbox || process.env.ENQUIRY_TO_EMAIL || businessConfig.contact.email;
/** The Kitchen inbox, for emails sent from outside this file. */
export const kitchenInboxFor = async (payload: Payload) => kitchenInbox(await settings(payload));

const { business, contact } = businessConfig;
const businessFooter = () =>
  `<b style="color:${C.ink};">${e(business.name)}</b> · ${e(contact.address.full)}<br><a href="mailto:${e(contact.email)}" style="color:${C.muted};">${e(contact.email)}</a> · <a href="${site()}" style="color:${C.muted};">olajesu.com</a>`;
const businessFooterText = () => `${business.name} · ${contact.address.full} · ${contact.email} · olajesu.com`;

const mealLine = (m: OrderMeal) => (m.addOns ? `${m.name} + ${m.addOns}` : m.name);
const allergenText = (m: OrderMeal) =>
  `${m.allergens.length ? `Contains ${m.allergens.join(', ')}` : 'Contains none of the 14 allergens'}${m.mayContain ? `. May contain ${m.mayContain}` : ''}`;

/** Each distinct Meal in the Order once, with its allergens. */
function distinctMeals(items: OrderItem[]) {
  const seen = new Map<string, OrderMeal>();
  for (const it of items) for (const m of it.meals) seen.set(mealLine(m), m);
  return [...seen.values()];
}

const orderLink = (o: Order) => (o.accessToken ? `${site()}/order/${o.id}/confirmed?t=${o.accessToken}` : site());
export const cancelLink = (o: Order) => (o.accessToken ? `${site()}/order/${o.id}/cancel?t=${o.accessToken}` : site());
const short = (day: string) => day.slice(0, 3);

/** The Order's Cut-off: fixed when it was placed (older Orders: the rule they were placed under). */
export const orderCutoff = (o: Pick<Order, 'cutoffAt' | 'deliveryDate'>) => (o.cutoffAt ? new Date(o.cutoffAt) : cutoffFor(DEFAULT_RULES, o.deliveryDate));
const collecting = (o: Order) => o.fulfilment === 'collection';
/** Where to collect from: the settings' address, or the kitchen's. */
const collectAt = (d: DeliveryText) => d.collection.address.trim() || contact.address.full;

const cancelNotice = (o: Order) =>
  `Changed your plans? You can cancel for a full refund until the order cut-off, ${cutoffLabel(orderCutoff(o))}, using the link in this email. After the cut-off we've started cooking, so we can't cancel: fresh food isn't covered by the legal 14-day right to cancel.`;
const problemNotice = (o: Order) =>
  `Something not right? Reply within 24 hours of ${collecting(o) ? 'collection' : 'delivery'}, with a photo if you can, and we'll put it right with a refund or a replacement.`;

/** The Order table: each single Meal or Pack, Pack savings and the total paid. */
function orderTable(order: Order, items: OrderItem[]) {
  const rows = items.map(it =>
    it.kind === 'single'
      ? moneyRow(`${it.qty} × ${e(it.label)}`, gbp(it.total))
      : moneyRow(e(it.label), gbp(it.total), { sub: e(tally(it.meals.map(mealLine))) }),
  );
  if (order.savings) rows.push(moneyRow('Pack savings', `−${gbp(order.savings)}`, { color: C.green }));
  if (collecting(order)) rows.push(moneyRow('Collection', 'Free'));
  else if (order.deliveryFee !== null && order.deliveryFee !== undefined) rows.push(moneyRow('Delivery', order.deliveryFee ? gbp(order.deliveryFee) : 'Free'));
  rows.push(moneyRow('Paid', gbp(order.total), { bold: true, last: true }));
  return table(rows.join(''));
}

// ---------------------------------------------------------------------------
// Customer: Order confirmation (legally required)

export function confirmationEmail(order: Order, s: Settings, d: DeliveryText = NO_DELIVERY_TEXT) {
  const items = (order.items ?? []) as OrderItem[];
  const day = longDate(order.deliveryDate);
  const name = firstName(order);
  const meals = distinctMeals(items);
  const collect = collecting(order);
  const cutoff = orderCutoff(order);
  const how = collect ? 'Collection' : 'Delivery';
  const times = collect ? d.collection.times : d.deliveryWindow;

  const html = emailLayout({
    preheader: `Order ${order.number} is booked in for ${day}. Here's everything you need.`,
    strip: { title: 'Order confirmed', sub: `${how} ${day}` },
    hero: {
      label: `Order ${order.number}`,
      line1: name ? `Thank you, ${name}.` : 'Thank you.',
      line2: "We're cooking for you.",
      text: collect
        ? `We'll cook your Order fresh in our Manchester kitchen and have it ready for you to collect, chilled, on <b style="color:${C.ink};">${e(day)}</b>.`
        : `We'll cook your Order fresh in our Manchester kitchen and bring it to you chilled on <b style="color:${C.ink};">${e(day)}</b>.`,
      button: { label: 'View your Order', href: orderLink(order) },
    },
    sections: [
      s.kitchenNote ? card(para(e(s.kitchenNote), { margin: '0 0 12px' }), { eyebrow: 'A note from the kitchen', background: C.blush }) : '',
      card(orderTable(order, items), { eyebrow: 'Your Order', heading: "What's coming" }),
      collect
        ? card(para(`<b>${e(day)}${times ? `, ${e(times)}` : ''}</b><br>${e(collectAt(d)).replace(/\n/g, '<br>')}<br>Please bring your Order number, ${e(order.number)}.`, { margin: '0 0 12px' }), { eyebrow: 'Collection', heading: 'Where to collect' })
        : order.deliveryAddress
          ? card(para(`<b>${e(day)}${times ? `, ${e(times)}` : ''}</b><br>${e(order.deliveryAddress).replace(/\n/g, '<br>')}`, { margin: '0 0 12px' }), { eyebrow: 'Delivery', heading: "Where it's going" })
          : '',
      darkPanel('What happens next', 'From our kitchen to your fridge', [
        [short(shortCutoffLabel(cutoff)), 'Change of plan?', `Cancel for a full refund until ${e(cutoffLabel(cutoff))}. <a href="${e(cancelLink(order))}" style="color:${C.amber};">Cancel my Order</a>`],
        [short(weekday(order.deliveryDate)), collect ? 'Collect it chilled' : 'Delivered chilled', 'Pop your Meals straight in the fridge and eat them by the use-by date on the label.'],
        ['Minutes', 'Heat, eat, feel at home', 'Reheat until piping hot all the way through. Instructions are on every label.'],
      ]),
      card(
        meals
          .map(m => para(`<b>${e(mealLine(m))}</b><br><span style="color:${C.muted};font-size:14px;">${e(allergenText(m))}</span>`, { margin: '0 0 12px' }))
          .join('') + para(muted('Full ingredients, with allergens in bold, are on each Meal’s page and on every label.'), { margin: '0 0 12px' }),
        { eyebrow: 'Allergens', heading: "What's in your Meals" },
      ),
      card(
        para(e(cancelNotice(order)), { size: 14 }) +
          para(`<a href="${e(cancelLink(order))}" style="color:${C.green};font-weight:700;">Cancel my Order</a>`, { size: 14 }) +
          (!collect && d.failedDelivery ? para(e(d.failedDelivery), { size: 14 }) : '') +
          para(e(problemNotice(order)), { size: 14, margin: '0 0 12px' }),
        { eyebrow: 'Good to know', heading: 'Cancelling and problems' },
      ),
    ].join(''),
    footer: businessFooter(),
  });

  const text = [
    `${name ? `Thank you, ${name}.` : 'Thank you.'} We're cooking for you.`,
    `Order ${order.number} · ${how.toLowerCase()} on ${day}${times ? `, ${times}` : ''}`,
    s.kitchenNote ? `\nA note from the kitchen: ${s.kitchenNote}` : '',
    '\nYOUR ORDER',
    ...items.map(it => (it.kind === 'single' ? `${it.qty} × ${it.label}  ${gbp(it.total)}` : `${it.label}  ${gbp(it.total)}\n  ${tally(it.meals.map(mealLine))}`)),
    order.savings ? `Pack savings  −${gbp(order.savings)}` : '',
    collect ? 'Collection  Free' : order.deliveryFee !== null && order.deliveryFee !== undefined ? `Delivery  ${order.deliveryFee ? gbp(order.deliveryFee) : 'Free'}` : '',
    `Paid  ${gbp(order.total)}`,
    collect
      ? `\nCOLLECTION\n${day}${times ? `, ${times}` : ''}\n${collectAt(d)}\nPlease bring your Order number.`
      : order.deliveryAddress
        ? `\nDELIVERY\n${day}${times ? `, ${times}` : ''}\n${order.deliveryAddress}`
        : '',
    '\nALLERGENS',
    ...meals.map(m => `- ${mealLine(m)}: ${allergenText(m)}`),
    'Full ingredients are on each Meal’s page and on every label.',
    '\nCANCELLING AND PROBLEMS',
    cancelNotice(order),
    `Cancel my Order: ${cancelLink(order)}`,
    !collect && d.failedDelivery ? d.failedDelivery : '',
    problemNotice(order),
    `\nView your Order: ${orderLink(order)}`,
    `\n"Food that carries the flavour of home." The OlaJesu kitchen, Manchester`,
    businessFooterText(),
  ]
    .filter(line => line !== '')
    .join('\n');

  return { subject: `You're booked in for ${weekday(order.deliveryDate)}: Order ${order.number}`, html, text };
}

/** Sends the confirmation once; safe to call again (it checks confirmationSentAt). */
export async function sendOrderConfirmation(payload: Payload, orderId: number) {
  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true, showHiddenFields: true });
  if (!order.email || order.confirmationSentAt || !['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered'].includes(order.status)) return false;
  const [s, rules] = await Promise.all([settings(payload), getDeliveryRules(payload)]);
  const { subject, html, text } = confirmationEmail(order, s, rules);
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

export function kitchenOrderEmail(order: Order) {
  const day = longDate(order.deliveryDate);
  const items = (order.items ?? []) as OrderItem[];
  const admin = `${site()}/admin/collections/orders/${order.id}`;
  const who = order.customerName || 'a Customer';
  const html = emailLayout({
    preheader: `${gbp(order.total)} from ${who} for ${day}`,
    strip: { title: 'New Order', sub: `${gbp(order.total)} · ${day}` },
    hero: {
      label: `Order ${order.number}`,
      line1: `New Order from ${who}.`,
      line2: `${gbp(order.total)} for ${weekday(order.deliveryDate)}, ${collecting(order) ? 'collecting' : 'delivery'}.`,
      button: { label: 'Open in the dashboard', href: admin },
    },
    sections:
      (order.addressCheck ? card(para(`<b>Check the address.</b> ${e(order.addressCheck)}`, { margin: '0 0 12px' }), { background: C.blush }) : '') +
      card(orderTable(order, items), { eyebrow: 'To cook', heading: "What's in it" }),
    footer: 'Sent to the Kitchen inbox for every paid Order. Switch it off in Admin, Kitchen emails. The full lists arrive at the cut-off.',
    signOff: false,
  });
  const text = `New Order ${order.number} from ${who}\n${gbp(order.total)} for ${day}, ${collecting(order) ? 'collecting' : 'delivery'}${order.addressCheck ? `\n\nCHECK THE ADDRESS: ${order.addressCheck}` : ''}\n\n${order.summary ?? ''}\n\nOpen in the dashboard: ${admin}`;
  return { subject: `New Order ${order.number} · ${gbp(order.total)} · ${weekday(order.deliveryDate)}`, html, text };
}

export async function sendKitchenNewOrder(payload: Payload, orderId: number) {
  const s = await settings(payload);
  if (s.emailEachOrder === false) return false;
  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true });
  return (await sendEmail({ to: kitchenInbox(s), ...kitchenOrderEmail(order), idempotencyKey: `kitchen-order-${order.id}` })).sent;
}

// ---------------------------------------------------------------------------
// Customer: out for delivery / ready to collect

export function statusEmail(order: Order, d: DeliveryText = NO_DELIVERY_TEXT) {
  const out = order.status === 'out-for-delivery';
  const name = firstName(order);
  const html = emailLayout({
    preheader: out ? 'Your Meals are on their way today. Keep your phone close.' : 'Your Meals are ready to collect from our kitchen.',
    strip: { title: out ? 'On its way today' : 'Ready to collect', sub: `Order ${order.number}` },
    hero: {
      label: `Order ${order.number}`,
      line1: name ? `Good news, ${name}.` : 'Good news.',
      line2: out ? 'Your Meals are coming.' : 'Your Meals are ready.',
      text: out
        ? "We're out delivering your Order today. Please keep your phone close in case we need to find you."
        : `Your Order is ready to collect from our kitchen at ${e(collectAt(d))}${d.collection.times ? `, ${e(d.collection.times)}` : ''}. Please bring your Order number.`,
    },
    sections: darkPanel(out ? 'When it arrives' : 'When you get home', 'Keep it fresh', [
      ['Fridge', 'Straight in the fridge', 'Your Meals are chilled, so pop them in the fridge as soon as you can.'],
      ['Use-by', 'Check the label', 'Eat each Meal by the use-by date printed on its label.'],
      ['Minutes', 'Heat, eat, feel at home', 'Reheat until piping hot all the way through.'],
    ]),
    footer: businessFooter(),
  });
  const text = out
    ? `Good news${name ? `, ${name}` : ''}. Your Meals are on their way.\nOrder ${order.number}\n\nWe're out delivering your Order today. Please keep your phone close.\nWhen it arrives, pop your Meals straight in the fridge and eat them by the use-by date on the label.\n\n${businessFooterText()}`
    : `Good news${name ? `, ${name}` : ''}. Your Meals are ready.\nOrder ${order.number}\n\nCollect from ${collectAt(d)}${d.collection.times ? `, ${d.collection.times}` : ''}. Please bring your Order number.\n\n${businessFooterText()}`;
  return { subject: out ? `Your Meals are on their way (${order.number})` : `Your Meals are ready to collect (${order.number})`, html, text };
}

export async function sendStatusEmail(payload: Payload, order: Order, req?: PayloadRequest) {
  if (!order.email || (order.status !== 'out-for-delivery' && order.status !== 'ready')) return false;
  const [s, rules] = await Promise.all([settings(payload, req), getDeliveryRules(payload, req)]);
  return (await sendEmail({ to: order.email, ...statusEmail(order, rules), replyTo: kitchenInbox(s), idempotencyKey: `status-${order.id}-${order.status}` })).sent;
}

// ---------------------------------------------------------------------------
// Kitchen: Cook, Packing and Delivery lists at the Cut-off

const LIST_STATUSES = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'partly-refunded'] as const;

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
  const byPostcode = orders.filter(o => !collecting(o)).sort((a, b) => postcode(a).localeCompare(postcode(b), 'en', { numeric: true }));
  return { cook: sorted(cook), addOns: sorted(addOns), packing: orders, delivery: byPostcode, collection: orders.filter(collecting) };
}
const postcode = (o: Order) => (o.deliveryAddress ?? '').trim().split('\n').pop() ?? '';

export function listsEmail(orders: Order[], deliveryDate: string) {
  const day = longDate(deliveryDate);
  const lists = kitchenLists(orders);
  const meals = lists.cook.reduce((n, [, c]) => n + c, 0);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const counts = (rows: [string, number][]) =>
    table(rows.map(([n, c], i) => moneyRow(e(n), `<span style="color:${C.jollof};font-size:18px;">${c}</span>`, { last: i === rows.length - 1 })).join(''));

  const html = emailLayout({
    preheader: `${plural(orders.length, 'Order')}, ${plural(meals, 'Meal')} for ${day}`,
    strip: { title: 'Kitchen lists', sub: `Cut-off passed · ${day}` },
    hero: { label: 'Orders are closed', line1: `${plural(orders.length, 'Order')}, ${plural(meals, 'Meal')}.`, line2: `For ${day}.` },
    sections: orders.length
      ? [
          card(counts(lists.cook), { eyebrow: 'Cook list', heading: 'What to cook' }),
          lists.addOns.length ? card(counts(lists.addOns), { eyebrow: 'Cook list', heading: 'Add-ons' }) : '',
          card(
            lists.packing
              .map(o => para(`<b>${e(o.number)}</b> · ${e(o.customerName ?? '')}<br><span style="white-space:pre-wrap;color:${C.muted};font-size:14px;">${e(o.summary ?? '')}</span>`, { margin: '0 0 14px' }))
              .join(''),
            { eyebrow: 'Packing list', heading: 'What goes in each Order' },
          ),
          lists.delivery.length
            ? card(
                lists.delivery
                  .map(o =>
                    para(
                      `<b>${e(o.number)}</b> · ${e(o.customerName ?? '')} · ${e(o.phone ?? '')}<br><span style="color:${C.muted};font-size:14px;">${e(o.deliveryAddress ?? 'No address').replace(/\n/g, ', ')}</span>${o.addressCheck ? `<br><b style="color:${C.jollof};">Check: ${e(o.addressCheck)}</b>` : ''}`,
                      { margin: '0 0 14px' },
                    ),
                  )
                  .join('') + para(muted('Sorted by postcode. Contains Customers’ personal details: keep it to the kitchen.'), { margin: '0 0 12px' }),
                { eyebrow: 'Delivery list', heading: 'Where it all goes' },
              )
            : '',
          lists.collection.length
            ? card(lists.collection.map(o => para(`<b>${e(o.number)}</b> · ${e(o.customerName ?? '')} · ${e(o.phone ?? '')}`, { margin: '0 0 14px' })).join(''), { eyebrow: 'Collection list', heading: 'Being collected' })
            : '',
        ].join('')
      : card(para('No Orders for this delivery day.', { margin: '0 0 12px' })),
    footer: 'Sent to the Kitchen inbox at each cut-off.',
    signOff: false,
  });
  const text = orders.length
    ? [
        `Kitchen lists for ${day}: ${plural(orders.length, 'Order')}, ${plural(meals, 'Meal')}`,
        '\nCOOK LIST',
        ...lists.cook.map(([n, c]) => `${c} × ${n}`),
        ...(lists.addOns.length ? ['\nADD-ONS', ...lists.addOns.map(([n, c]) => `${c} × ${n}`)] : []),
        '\nPACKING LIST',
        ...lists.packing.map(o => `${o.number} · ${o.customerName ?? ''}\n${o.summary ?? ''}\n`),
        ...(lists.delivery.length
          ? ['\nDELIVERY LIST (by postcode)', ...lists.delivery.map(o => `${o.number} · ${o.customerName ?? ''} · ${o.phone ?? ''}\n${(o.deliveryAddress ?? 'No address').replace(/\n/g, ', ')}${o.addressCheck ? `\nCHECK: ${o.addressCheck}` : ''}\n`)]
          : []),
        ...(lists.collection.length ? ['\nCOLLECTION LIST', ...lists.collection.map(o => `${o.number} · ${o.customerName ?? ''} · ${o.phone ?? ''}`)] : []),
      ].join('\n')
    : `Kitchen lists for ${day}\nNo Orders for this delivery day.`;
  return { subject: `Kitchen lists for ${day}: ${plural(orders.length, 'Order')}, ${plural(meals, 'Meal')}`, html, text };
}

export async function sendCutoffLists(payload: Payload, deliveryDate: string) {
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    pagination: false,
    where: { and: [{ deliveryDate: { equals: deliveryDate } }, { status: { in: [...LIST_STATUSES] } }] },
  });
  const s = await settings(payload);
  return sendEmail({ to: kitchenInbox(s), ...listsEmail(docs, deliveryDate), idempotencyKey: `lists-${deliveryDate}` });
}
