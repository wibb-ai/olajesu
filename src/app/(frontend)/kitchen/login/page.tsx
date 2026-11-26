import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { StaffLogin } from '../../../../components/kitchen/KitchenActions';
import { KitchenChrome } from '../../../../components/kitchen/KitchenChrome';
import s from '../../../../components/shop/shop.module.css';
import { currentStaff } from '../../../../lib/staff';

/** Sign-in for the screens for the day, sized for a phone. */
export default async function KitchenLogin() {
  await connection();
  if (await currentStaff()) redirect('/kitchen');
  return (
    <KitchenChrome role={null}>
      <div style={{ maxWidth: 420, margin: '20px auto 0' }}>
        <div className={s.eyebrow}>OlaJesu kitchen</div>
        <h1 className={s.h2}>
          Sign in for <span className={s.accent}>today’s lists.</span>
        </h1>
        <p className={s.body}>Use your staff email and password. Each person has their own login.</p>
        <StaffLogin />
      </div>
    </KitchenChrome>
  );
}
