import { redirect } from 'next/navigation';

import { requireStaff } from './shared';

/** Kitchen home: the Cook list. */
export default async function KitchenHome() {
  await requireStaff(['master-admin', 'kitchen']);
  redirect('/kitchen/cook');
}
