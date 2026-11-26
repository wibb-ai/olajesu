import { redirect } from 'next/navigation';

import { requireStaff } from './shared';

/** Kitchen home: Drivers go straight to deliveries, everyone else to the Cook list. */
export default async function KitchenHome() {
  const { staff } = await requireStaff(['master-admin', 'kitchen', 'driver']);
  redirect(staff.role === 'driver' ? '/kitchen/deliver' : '/kitchen/cook');
}
