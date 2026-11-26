import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getPayload } from 'payload';

import { ClearBasket } from '../../../../../components/shop/ClearBasket';
import { ShopShell } from '../../../../../components/shop/ShopShell';
import s from '../../../../../components/shop/shop.module.css';
import { businessConfig } from '../../../../../config/businessConfig';
import { getMenu } from '../../../../../lib/menu';
import { notifyPaid } from '../../../../../lib/orderEmails';
import { markPaidFromSession, type OrderItem } from '../../../../../lib/orders';
import { getStripe } from '../../../../../lib/stripe';

export const metadata: Metadata = { title: 'Order confirmed | OlaJesu', robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string; session_id?: string }> };

const sameToken = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;

/** Where Stripe sends the Customer after paying. Only reachable with the Order's private link. */
export default async function OrderConfirmed({ params, searchParams }: Props) {
  await connection();
  const [{ id }, { t, session_id }] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id) || !t) notFound();

  const payload = await getPayload({ config });
  let order = await payload.findByID({ collection: 'orders', id: Number(id), depth: 0, overrideAccess: true, showHiddenFields: true, disableErrors: true });
  if (!order?.accessToken || !sameToken(order.accessToken, t)) notFound();

  // The webhook usually arrives first; if not, ask Stripe directly rather than show "unpaid".
  if (order.status === 'awaiting-payment' && session_id && session_id === order.stripeSessionId) {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const result = await markPaidFromSession(payload, session);
      if (result.changed) {
        await notifyPaid(payload, result.id);
        order = await payload.findByID({ collection: 'orders', id: order.id, depth: 0, overrideAccess: true });
      }
    }
  }

  const paid = !['awaiting-payment', 'expired'].includes(order.status);
  const items = (order.items ?? []) as OrderItem[];
  const delivery = new Date(`${order.deliveryDate.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' });
  const menu = await getMenu();

  return (
    <ShopShell menu={menu}>
      {paid && <ClearBasket />}
      <div className={s.container} style={{ maxWidth: 640, paddingTop: 32 }}>
        {paid ? (
          <>
            <div className={s.tick} style={{ width: 44, height: 44, fontSize: 22 }}>
              ✓
            </div>
            <h1 className={s.h2}>Thank you, your Order is confirmed</h1>
            <p className={s.body}>
              Order <b style={{ color: 'var(--ink)' }}>{order.number}</b> · for delivery on <b style={{ color: 'var(--ink)' }}>{delivery}</b>.
            </p>
          </>
        ) : (
          <>
            <h1 className={s.h2}>We&apos;re waiting for your payment</h1>
            <p className={s.body}>
              Order {order.number} isn&apos;t paid yet. If you&apos;ve just paid, refresh this page in a moment. If you left the payment page, your basket is still saved.
            </p>
            <Link href="/" className={s.pillDark}>
              Back to the shop
            </Link>
          </>
        )}

        <h2 className={s.label} style={{ marginTop: 28 }}>
          Your Order
        </h2>
        {items.map((item, i) => (
          <div key={i} className={s.rowCol}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <b>{item.kind === 'single' ? `${item.qty} × ${item.label}` : item.label}</b>
              <span>{gbp(item.total)}</span>
            </div>
            {item.kind === 'pack' &&
              item.meals.map((m, j) => (
                <div key={j} className={s.subtle}>
                  {m.name}
                  {m.addOns && ` + ${m.addOns}`}
                </div>
              ))}
          </div>
        ))}
        {(order.savings ?? 0) > 0 && (
          <div className={s.row} style={{ color: 'var(--green)' }}>
            <span>Pack savings</span>
            <span>−{gbp(order.savings ?? 0)}</span>
          </div>
        )}
        <div className={s.total}>
          <span>{paid ? 'Paid' : 'Total'}</span>
          <span>{gbp(order.total)}</span>
        </div>

        {paid && (
          <div className={s.callout} style={{ marginTop: 20 }}>
            Keep your Order number for reference. Fresh food can be cancelled for a full refund until the order cut-off; after that, cooking has started. Questions, or a problem with your Order? Email{' '}
            <a href={`mailto:${businessConfig.contact.email}?subject=${encodeURIComponent(`Order ${order.number}`)}`}>{businessConfig.contact.email}</a> with your Order number.
          </div>
        )}
      </div>
    </ShopShell>
  );
}
