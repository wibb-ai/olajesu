import { DeliveryButtons } from '../../../../components/kitchen/KitchenActions';
import { DayPicker, KitchenChrome } from '../../../../components/kitchen/KitchenChrome';
import s from '../../../../components/shop/shop.module.css';
import { canSeeDeliveryDetails, londonToday } from '../../../../lib/staff';
import { longDay, pickDay, requireStaff } from '../shared';

type Props = { searchParams: Promise<{ date?: string }> };

const postcode = (address: string) => address.trim().split('\n').pop() ?? '';
const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ', '))}`;

/**
 * Delivery list, by postcode: address with a maps link, tap to call, and the delivery buttons.
 * Kitchen staff see addresses only on the delivery day itself (staff-roles ticket).
 */
export default async function Deliver({ searchParams }: Props) {
  const { payload, staff } = await requireStaff(['master-admin', 'kitchen']);
  const asked = (await searchParams).date;
  // Kitchen staff only ever see today; the Master admin can look at any day.
  const { date, orders, days } = await pickDay(payload, staff.role === 'master-admin' ? asked : londonToday());
  const allowed = canSeeDeliveryDetails(staff, date);
  const sorted = [...orders].sort((a, b) => postcode(a.deliveryAddress ?? '').localeCompare(postcode(b.deliveryAddress ?? ''), 'en', { numeric: true }));
  const done = orders.filter(o => o.status === 'delivered').length;

  return (
    <KitchenChrome role={staff.role} name={staff.name ?? undefined}>
      {staff.role === 'master-admin' && <DayPicker days={days} current={date} base="/kitchen/deliver" />}
      <div className={s.eyebrow}>Delivery list</div>
      <h1 className={s.h2}>
        {done} of {orders.length} <span className={s.accent}>delivered.</span>
      </h1>
      <p className={s.subtle} style={{ margin: '0 0 14px' }}>
        {longDay(date)} · sorted by postcode
      </p>
      {!orders.length && <div className={s.empty}>No deliveries today.</div>}
      {allowed &&
        sorted.map(o => (
          <section key={o.id} className={s.panel} style={{ opacity: o.status === 'delivered' ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{o.customerName || 'Customer'}</div>
              <div className={s.subtle}>{o.number}</div>
            </div>
            <div style={{ whiteSpace: 'pre-line', margin: '8px 0', fontSize: 16, lineHeight: 1.5 }}>{o.deliveryAddress || 'No address'}</div>
            {o.deliveryNotes && <div className={s.calloutWarn} style={{ margin: '0 0 10px' }}>Note: {o.deliveryNotes}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 12px' }}>
              {o.deliveryAddress && (
                <a className={s.smallPillLight} href={mapsLink(o.deliveryAddress)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: '12px 14px' }}>
                  Open in maps
                </a>
              )}
              {o.phone && (
                <a className={s.smallPillLight} href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} style={{ fontSize: 12, padding: '12px 14px' }}>
                  Call {o.phone}
                </a>
              )}
            </div>
            <div className={s.subtle} style={{ whiteSpace: 'pre-line', margin: '0 0 12px' }}>
              {o.summary}
            </div>
            <DeliveryButtons orderId={o.id} status={o.status} />
          </section>
        ))}
    </KitchenChrome>
  );
}
