import type { Payload } from 'payload';

import { businessConfig } from '../config/businessConfig';
import type { Order } from '../payload-types';
import { C, card, emailLayout, escapeHtml as e, moneyRow, para, sendEmail, site, table } from './email';
import { kitchenInboxFor, longDate } from './orderEmails';
import type { Unit } from './refunds';

/** Emails for cancellations and refunds (notifications ticket), in the same A4 style. */

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
const first = (o: Order) => (o.customerName ?? '').trim().split(/\s+/)[0] || '';
const footer = () => {
  const { business, contact } = businessConfig;
  return `<b style="color:${C.ink};">${e(business.name)}</b> · ${e(contact.address.full)}<br><a href="mailto:${e(contact.email)}" style="color:${C.muted};">${e(contact.email)}</a>`;
};
const cardNote = 'Refunds usually reach your card in 5 to 10 working days, depending on your bank.';

/** The Customer cancelled before the Cut-off. */
export function customerCancelledEmail(order: Order, amount: number) {
  const name = first(order);
  const day = longDate(order.deliveryDate);
  const html = emailLayout({
    preheader: `Order ${order.number} is cancelled and ${gbp(amount)} is on its way back to your card.`,
    strip: { title: 'Order cancelled', sub: `Refund ${gbp(amount)}` },
    hero: {
      label: `Order ${order.number}`,
      line1: name ? `All done, ${name}.` : 'All done.',
      line2: 'Your Order is cancelled.',
      text: `We won’t cook or deliver it on ${e(day)}, and we’ve refunded <b style="color:${C.ink};">${gbp(amount)}</b> to your card. ${cardNote}`,
      button: { label: 'Order again', href: site() },
    },
    sections: '',
    footer: footer(),
  });
  const text = `All done${name ? `, ${name}` : ''}. Your Order is cancelled.\nOrder ${order.number}\n\nWe won't cook or deliver it on ${day}, and we've refunded ${gbp(amount)} to your card. ${cardNote}\n\nOrder again: ${site()}`;
  return { subject: `Order ${order.number} cancelled: ${gbp(amount)} refunded`, html, text };
}

/** The kitchen cancelled: an apology, the full refund, and the next delivery day offered. */
export function kitchenCancelledEmail(order: Order, amount: number, reason: string) {
  const name = first(order);
  const html = emailLayout({
    preheader: `We’re sorry: we’ve had to cancel Order ${order.number} and refunded ${gbp(amount)}.`,
    strip: { title: 'We’re sorry', sub: `Order ${order.number} cancelled` },
    hero: {
      label: `Order ${order.number}`,
      line1: name ? `We’re so sorry, ${name}.` : 'We’re so sorry.',
      line2: 'We’ve had to cancel your Order.',
      text: `${reason ? `${e(reason)} ` : ''}We’ve refunded the full <b style="color:${C.ink};">${gbp(amount)}</b> to your card. ${cardNote}`,
      button: { label: 'Order for the next delivery day', href: site() },
    },
    sections: card(para('We hate letting anyone down. If you’d like your Meals on the next delivery day instead, order again with the button above, or reply to this email and we’ll sort it out for you.', { margin: '0 0 12px' })),
    footer: footer(),
  });
  const text = `We're so sorry${name ? `, ${name}` : ''}. We've had to cancel your Order.\nOrder ${order.number}\n\n${reason ? `${reason} ` : ''}We've refunded the full ${gbp(amount)} to your card. ${cardNote}\n\nOrder for the next delivery day: ${site()}\nOr reply to this email and we'll sort it out for you.`;
  return { subject: `We're sorry: Order ${order.number} is cancelled and refunded`, html, text };
}

/** Staff refunded part or all of an Order, e.g. for a missing or damaged Meal. */
export function refundMadeEmail(order: Order, amount: number, units: Unit[], whole: boolean) {
  const name = first(order);
  const rows = units.map((u, i) => moneyRow(e(u.label), gbp(u.amount), { last: i === units.length - 1 })).join('');
  const html = emailLayout({
    preheader: `We’ve refunded ${gbp(amount)} for Order ${order.number}.`,
    strip: { title: 'Refund made', sub: `${gbp(amount)} · Order ${order.number}` },
    hero: {
      label: `Order ${order.number}`,
      line1: name ? `Sorry about that, ${name}.` : 'Sorry about that.',
      line2: `We’ve refunded ${gbp(amount)}.`,
      text: `${whole ? 'That’s the whole Order.' : 'For the Meals below.'} ${cardNote}`,
    },
    sections: whole ? '' : card(table(rows), { eyebrow: 'Refunded', heading: 'What it covers' }),
    footer: footer(),
  });
  const text = `Sorry about that${name ? `, ${name}` : ''}. We've refunded ${gbp(amount)} for Order ${order.number}.\n\n${whole ? "That's the whole Order." : units.map(u => `- ${u.label}  ${gbp(u.amount)}`).join('\n')}\n\n${cardNote}`;
  return { subject: `Refund of ${gbp(amount)} for Order ${order.number}`, html, text };
}

/** To the kitchen when a Customer cancels: take it off the lists. */
export function kitchenNoticeEmail(order: Order, amount: number) {
  const day = longDate(order.deliveryDate);
  const html = emailLayout({
    preheader: `${order.number} cancelled by the Customer: don’t cook it`,
    strip: { title: 'Order cancelled', sub: `Don’t cook · ${day}` },
    hero: { label: `Order ${order.number}`, line1: `${order.customerName || 'A Customer'} cancelled.`, line2: `${gbp(amount)} refunded.`, text: `It’s been taken off the lists for ${e(day)}.` },
    sections: card(`<div style="white-space:pre-wrap;font-size:14px;margin:0 0 12px;">${e(order.summary ?? '')}</div>`, { eyebrow: 'Was going to be', heading: 'Not needed now' }),
    footer: 'Sent to the Kitchen inbox when a Customer cancels.',
    signOff: false,
  });
  const text = `${order.number} cancelled by ${order.customerName || 'the Customer'}. ${gbp(amount)} refunded.\nTaken off the lists for ${day}.\n\n${order.summary ?? ''}`;
  return { subject: `Cancelled: ${order.number} for ${day}`, html, text };
}

export async function sendRefundEmails(payload: Payload, order: Order, kind: 'customer-cancel' | 'kitchen-cancel' | 'refund', amount: number, units: Unit[], reason: string) {
  const inbox = await kitchenInboxFor(payload);
  const sends: Promise<unknown>[] = [];
  const key = `${kind}-${order.id}-${(order.refunds ?? []).length}`;
  if (order.email) {
    const mail =
      kind === 'customer-cancel'
        ? customerCancelledEmail(order, amount)
        : kind === 'kitchen-cancel'
          ? kitchenCancelledEmail(order, amount, reason)
          : refundMadeEmail(order, amount, units, (order.refundedTotal ?? 0) >= order.total);
    sends.push(sendEmail({ to: order.email, ...mail, replyTo: inbox, idempotencyKey: key }));
  }
  if (kind === 'customer-cancel') sends.push(sendEmail({ to: inbox, ...kitchenNoticeEmail(order, amount), idempotencyKey: `${key}-kitchen` }));
  await Promise.all(sends);
}
