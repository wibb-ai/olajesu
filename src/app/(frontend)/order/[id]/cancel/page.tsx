import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getPayload } from 'payload';

import { CancelOrder } from '../../../../../components/shop/CancelOrder';
import { ShopShell } from '../../../../../components/shop/ShopShell';
import s from '../../../../../components/shop/shop.module.css';
import { currentCustomer, summary } from '../../../../../lib/account';
import { orderCutoff } from '../../../../../lib/orderEmails';
import { loadShopDelivery } from '../../../../../lib/deliverySettings';
import { getMenu } from '../../../../../lib/menu';
import { longDate } from '../../../../../lib/orderEmails';
import { canCustomerCancel } from '../../../../../lib/refunds';

export const metadata: Metadata = { title: 'Cancel your Order | OlaJesu', robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> };

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
const when = (d: Date) => d.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' });

/** The Customer's own cancel page, from the link in their emails (refunds ticket). */
export default async function CancelPage({ params, searchParams }: Props) {
  await connection();
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id) || !t) notFound();
  const payload = await getPayload({ config });
  const order = await payload.findByID({ collection: 'orders', id: Number(id), overrideAccess: true, showHiddenFields: true, disableErrors: true, depth: 0 });
  if (!order?.accessToken || order.accessToken.length !== t.length || !timingSafeEqual(Buffer.from(order.accessToken), Buffer.from(t))) notFound();

  const [menu, customer] = await Promise.all([getMenu(), currentCustomer(payload)]);
  const cutoff = orderCutoff(order);
  const can = canCustomerCancel(order);

  return (
    <ShopShell menu={menu} delivery={await loadShopDelivery()} account={summary(customer)}>
      <div className={s.container} style={{ maxWidth: 600, paddingTop: 32 }}>
        <div className={s.eyebrow}>Order {order.number}</div>
        {order.status === 'cancelled' ? (
          <>
            <h1 className={s.h2}>
              This Order is <span className={s.accent}>cancelled.</span>
            </h1>
            <p className={s.body}>{order.refundedTotal ? `${gbp(order.refundedTotal)} was refunded to your card.` : ''}</p>
          </>
        ) : can ? (
          <>
            <h1 className={s.h2}>
              Cancel your Order <span className={s.accent}>for {longDate(order.deliveryDate)}?</span>
            </h1>
            <p className={s.body}>
              You’ll get a full refund of <b style={{ color: 'var(--ink)' }}>{gbp(order.total)}</b> to your card. You can cancel until {when(cutoff)}.
            </p>
            <div className={s.panel} style={{ whiteSpace: 'pre-line', fontSize: 15 }}>
              {order.summary}
            </div>
            <CancelOrder orderId={order.id} token={t} amount={order.total} />
          </>
        ) : (
          <>
            <h1 className={s.h2}>
              It’s too late <span className={s.accent}>to cancel online.</span>
            </h1>
            <p className={s.body}>
              The cut-off was {when(cutoff)}, so we’ve started cooking your Order: fresh food isn’t covered by the 14-day right to cancel. If something’s wrong, reply to your confirmation email and we’ll help.
            </p>
          </>
        )}
        <p style={{ marginTop: 20 }}>
          <Link href={`/order/${order.id}/confirmed?t=${t}`} className={s.linkBtn}>
            Back to your Order
          </Link>
        </p>
      </div>
    </ShopShell>
  );
}
