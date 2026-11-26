import { PackToggle } from '../../../../components/kitchen/KitchenActions';
import { DayPicker, KitchenChrome } from '../../../../components/kitchen/KitchenChrome';
import s from '../../../../components/shop/shop.module.css';
import { longDay, pickDay, requireStaff } from '../shared';

type Props = { searchParams: Promise<{ date?: string }> };

/** Packing list: what goes in each Order, ticked off as it's packed. Names and contents only. */
export default async function Pack({ searchParams }: Props) {
  const { payload, staff } = await requireStaff(['master-admin', 'kitchen']);
  const { date, orders, days } = await pickDay(payload, (await searchParams).date);
  const packed = orders.filter(o => o.packedAt).length;
  // Not packed first, so the next one to do is at the top.
  const sorted = [...orders].sort((a, b) => Number(!!a.packedAt) - Number(!!b.packedAt));

  return (
    <KitchenChrome role={staff.role} name={staff.name ?? undefined}>
      <DayPicker days={days} current={date} base="/kitchen/pack" />
      <div className={s.eyebrow}>Packing list</div>
      <h1 className={s.h2}>
        {packed} of {orders.length} <span className={s.accent}>packed.</span>
      </h1>
      <p className={s.subtle} style={{ margin: '0 0 14px' }}>For {longDay(date)}.</p>
      {!orders.length && <div className={s.empty}>No Orders for this day yet.</div>}
      {sorted.map(o => (
        <section key={o.id} className={s.panel} style={{ opacity: o.packedAt ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{o.customerName || 'Customer'}</div>
              <div className={s.subtle}>{o.number}</div>
            </div>
            <PackToggle orderId={o.id} packed={!!o.packedAt} />
          </div>
          <div style={{ whiteSpace: 'pre-line', marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>{o.summary}</div>
        </section>
      ))}
    </KitchenChrome>
  );
}
