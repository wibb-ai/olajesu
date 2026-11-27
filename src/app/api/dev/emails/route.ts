import { inactivityEmail, linkEmail } from '../../../../lib/accountEmails';
import { customerCancelledEmail, kitchenCancelledEmail, kitchenNoticeEmail, refundMadeEmail } from '../../../../lib/refundEmails';
import { confirmationEmail, kitchenOrderEmail, listsEmail, statusEmail } from '../../../../lib/orderEmails';
import type { OrderItem, OrderMeal } from '../../../../lib/orders';
import type { Order } from '../../../../payload-types';

/**
 * Preview of every Order email with sample Orders, for designing and checking the wording.
 * Local dev and Vercel previews only; Production returns 404. No database, nothing is sent.
 *
 *   /api/dev/emails                      list
 *   /api/dev/emails?name=confirmation    one email as it would arrive
 *   /api/dev/emails?name=confirmation&format=text   its plain-text version
 */
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production') return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const name = url.searchParams.get('name');
  const emails = build();

  if (!name || !(name in emails)) {
    const links = Object.entries(emails)
      .map(([key, m]) => `<li style="margin:8px 0;"><a href="?name=${key}">${key}</a> · <a href="?name=${key}&format=text">plain text</a><br><small>${m.subject}</small></li>`)
      .join('');
    return html(`<!doctype html><meta charset="utf-8"><title>Email previews</title><body style="font-family:system-ui;padding:24px;max-width:640px;"><h1>Order email previews</h1><p>Sample Orders, nothing sent.</p><ul>${links}</ul></body>`);
  }
  const email = emails[name as keyof typeof emails];
  if (url.searchParams.get('format') === 'text') return new Response(`Subject: ${email.subject}\n\n${email.text}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return html(email.html);
}

const html = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } });

function meal(name: string, allergens: string[], addOns: string[] = [], price = 13, paid = price): OrderMeal {
  return { name, addOns: addOns.join(', '), addOnNames: addOns, mealPrice: price, paidForMeal: paid, addOnsPrice: addOns.length * 3, allergens, mayContain: '' };
}

function sample(over: Partial<Order> = {}): Order {
  const egusi = meal('Egusi Soup', ['Fish', 'Crustaceans', 'Celery'], ['Pounded Yam'], 13, 11.7);
  const items: OrderItem[] = [
    { kind: 'single', label: 'Jollof Rice, chicken + Plantain', qty: 2, discountPercent: 0, meals: [meal('Jollof Rice, chicken', ['Celery'], ['Plantain'], 10)], total: 26 },
    { kind: 'pack', label: '5-Pack, 10% off each Meal', qty: 5, discountPercent: 10, meals: [egusi, egusi, egusi, meal('Efo Riro', ['Fish', 'Crustaceans', 'Celery'], [], 15, 13.5), meal('Efo Riro', ['Fish', 'Crustaceans', 'Celery'], [], 15, 13.5)], total: 71.1 },
  ];
  return {
    id: 1042,
    number: 'OJ-7KQ4MX',
    status: 'paid',
    deliveryDate: '2026-11-28T00:00:00.000Z',
    cutoffAt: '2026-11-26T20:00:00.000Z',
    fulfilment: 'delivery',
    deliveryFee: 3.5,
    summary: '2 × Jollof Rice, chicken + Plantain\n5-Pack, 10% off each Meal:\nEgusi Soup + Pounded Yam × 3\nEfo Riro × 2',
    items,
    subtotal: 97.1,
    savings: 6.9,
    total: 100.6,
    customerName: 'Adaeze Okafor',
    email: 'ada@example.com',
    phone: '+44 7700 900123',
    deliveryAddress: 'Adaeze Okafor\n12 Example Road\nManchester\nM14 5AB',
    accessToken: 'sample',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...over,
  } as Order;
}

const DELIVERY = {
  deliveryWindow: 'between 10am and 4pm',
  failedDelivery: 'If no one is in, we’ll call you. If we can’t reach you, we take your Meals back and you can collect them the same day.',
  collection: { enabled: true, address: 'Unit 3, 20-22 Mary Street, Manchester M3 1DZ', times: 'between 12 noon and 6pm' },
};

function build() {
  const order = sample();
  const collecting = sample({ fulfilment: 'collection', deliveryFee: 0, total: 97.1, deliveryAddress: null });
  const second = sample({ id: 1043, number: 'OJ-3HV9TC', customerName: 'Tunde Bello', deliveryAddress: 'Tunde Bello\n4 Sample Street\nSalford\nM5 4WT', summary: '3 × Egusi Soup + Pounded Yam', items: [{ kind: 'single', label: 'Egusi Soup + Pounded Yam', qty: 3, discountPercent: 0, meals: [meal('Egusi Soup', ['Fish', 'Crustaceans', 'Celery'], ['Pounded Yam'])], total: 49.5 }], savings: 0, total: 49.5, subtotal: 49.5 });
  return {
    confirmation: confirmationEmail(order, { kitchenNote: null }, DELIVERY),
    'confirmation-collection': confirmationEmail(collecting, { kitchenNote: null }, DELIVERY),
    'confirmation-with-note': confirmationEmail(order, { kitchenNote: 'We’re closed from 24 to 27 December. Orders for 2 January open on Boxing Day.' }),
    'out-for-delivery': statusEmail({ ...order, status: 'out-for-delivery' }),
    'ready-to-collect': statusEmail({ ...collecting, status: 'ready' }, DELIVERY),
    'kitchen-new-order-address-check': kitchenOrderEmail({ ...order, addressCheck: 'SK4 1AA is outside the delivery areas. Call the Customer, or refund.' }),
    'kitchen-new-order': kitchenOrderEmail(order),
    'kitchen-lists': listsEmail([order, second], '2026-11-28'),
    'kitchen-lists-empty': listsEmail([], '2026-12-05'),
    'cancelled-by-customer': customerCancelledEmail(order, 97.1),
    'cancelled-kitchen-notice': kitchenNoticeEmail(order, 97.1),
    'cancelled-by-kitchen': kitchenCancelledEmail(order, 97.1, 'Our kitchen is closed today because of illness.'),
    'refund-made': refundMadeEmail(order, 14.7, [{ key: '1.0', label: 'Egusi Soup + Pounded Yam (in the 5-Pack)', amount: 14.7 }], false),
    'account-sign-in': linkEmail('login', 'sample-token'),
    'account-save-details': linkEmail('save-details', 'sample-token'),
    'account-change-email': linkEmail('change-email', 'sample-token'),
    'account-delete': linkEmail('delete', 'sample-token'),
    'account-inactive': inactivityEmail('2026-12-26T12:00:00Z'),
  };
}
