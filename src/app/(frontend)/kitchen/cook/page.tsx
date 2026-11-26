import { StartCooking } from '../../../../components/kitchen/KitchenActions';
import { DayPicker, KitchenChrome } from '../../../../components/kitchen/KitchenChrome';
import s from '../../../../components/shop/shop.module.css';
import { kitchenLists } from '../../../../lib/orderEmails';
import { longDay, pickDay, requireStaff } from '../shared';

type Props = { searchParams: Promise<{ date?: string }> };

/** Cook list: how many of each Meal and Option, and each Add-on, for a delivery day. */
export default async function Cook({ searchParams }: Props) {
  const { payload, staff } = await requireStaff(['master-admin', 'kitchen']);
  const { date, orders, days } = await pickDay(payload, (await searchParams).date);
  const lists = kitchenLists(orders);
  const meals = lists.cook.reduce((n, [, c]) => n + c, 0);
  const paid = orders.filter(o => o.status === 'paid').length;

  return (
    <KitchenChrome role={staff.role} name={staff.name ?? undefined}>
      <DayPicker days={days} current={date} base="/kitchen/cook" />
      <div className={s.eyebrow}>Cook list</div>
      <h1 className={s.h2}>
        {meals} Meal{meals === 1 ? '' : 's'} <span className={s.accent}>for {longDay(date)}.</span>
      </h1>
      <p className={s.subtle} style={{ margin: '0 0 14px' }}>
        {orders.length} Order{orders.length === 1 ? '' : 's'} so far. The list updates as Orders come in until the cut-off.
      </p>
      <div style={{ margin: '0 0 16px' }}>
        <StartCooking date={date} paid={paid} />
      </div>

      {!orders.length && <div className={s.empty}>No Orders for this day yet.</div>}

      {lists.cook.length > 0 && (
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Meals</h2>
          {lists.cook.map(([name, count]) => (
            <div key={name} className={s.row} style={{ fontSize: 17, alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>{name}</span>
              <b style={{ color: 'var(--jollof)', fontSize: 24 }}>{count}</b>
            </div>
          ))}
        </section>
      )}
      {lists.addOns.length > 0 && (
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Add-ons</h2>
          {lists.addOns.map(([name, count]) => (
            <div key={name} className={s.row} style={{ fontSize: 17, alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>{name}</span>
              <b style={{ color: 'var(--jollof)', fontSize: 24 }}>{count}</b>
            </div>
          ))}
        </section>
      )}
    </KitchenChrome>
  );
}
