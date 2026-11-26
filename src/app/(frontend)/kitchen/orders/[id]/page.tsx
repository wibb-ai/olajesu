import { notFound } from 'next/navigation';

import { KitchenChrome } from '../../../../../components/kitchen/KitchenChrome';
import { RefundForm } from '../../../../../components/kitchen/RefundForm';
import s from '../../../../../components/shop/shop.module.css';
import { cutoffFor } from '../../../../../lib/delivery';
import { orderUnits, refundable, refundedUnits } from '../../../../../lib/refunds';
import { longDay, requireStaff } from '../../shared';

type Props = { params: Promise<{ id: string }> };

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
const STATUS: Record<string, string> = {
  paid: 'Paid', preparing: 'Being cooked', ready: 'Ready to collect', 'out-for-delivery': 'Out for delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', 'partly-refunded': 'Partly refunded', refunded: 'Refunded', 'awaiting-payment': 'Not paid', expired: 'Checkout abandoned',
};

/** Refund chosen Meals, or cancel for the kitchen. Master admin only (staff-roles ticket). */
export default async function OrderRefunds({ params }: Props) {
  const { payload, staff } = await requireStaff(['master-admin']);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const order = await payload.findByID({ collection: 'orders', id: Number(id), overrideAccess: true, showHiddenFields: true, disableErrors: true, depth: 0 });
  if (!order) notFound();

  const done = refundedUnits(order);
  const units = orderUnits(order).map(u => ({ ...u, refunded: done.has(u.key) }));
  const left = refundable(order);
  const paid = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'partly-refunded'].includes(order.status);

  return (
    <KitchenChrome role={staff.role} name={staff.name ?? undefined}>
      <div className={s.eyebrow}>Order {order.number}</div>
      <h1 className={s.h2}>
        {order.customerName || 'Customer'} <span className={s.accent}>· {gbp(order.total)}</span>
      </h1>
      <p className={s.subtle} style={{ margin: '0 0 14px' }}>
        {STATUS[order.status] ?? order.status} · for {longDay(order.deliveryDate.slice(0, 10))} · cut-off {cutoffFor(order.deliveryDate).toLocaleString('en-GB', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' })}
        {(order.refundedTotal ?? 0) > 0 && ` · ${gbp(order.refundedTotal ?? 0)} refunded, ${gbp(left)} left`}
      </p>

      {(order.refunds ?? []).length > 0 && (
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Refunds so far</h2>
          {(order.refunds ?? []).map((r, i) => (
            <div key={i} className={s.rowCol}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b>{gbp(r.amount ?? 0)}</b>
                <span className={s.subtle}>{r.at ? new Date(r.at).toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
              </div>
              <div className={s.subtle}>{r.reason}</div>
              <div className={s.subtle} style={{ whiteSpace: 'pre-line' }}>
                {r.details}
              </div>
            </div>
          ))}
        </section>
      )}

      {paid && left > 0 ? (
        <RefundForm orderId={order.id} units={units} left={left} hasPayment={!!order.stripePaymentIntentId} />
      ) : (
        <div className={s.empty}>{order.status === 'cancelled' ? 'This Order is cancelled.' : left <= 0 ? 'Everything on this Order has been refunded.' : 'This Order isn’t paid, so there’s nothing to refund.'}</div>
      )}

      <p style={{ marginTop: 18 }}>
        <a href={`/admin/collections/orders/${order.id}`} className={s.linkBtn}>
          Back to the Order in the dashboard
        </a>
      </p>
    </KitchenChrome>
  );
}
