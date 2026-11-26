import config from '@payload-config';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getPayload } from 'payload';

import type { Role } from '../../../access/roles';
import { DELIVERY_PLACEHOLDER } from '../../../lib/delivery';
import { deliveryDateFor } from '../../../lib/delivery';
import { currentStaff, londonToday, ordersForDay, upcomingDays } from '../../../lib/staff';

/** Signed-in staff with one of these roles, or off to the kitchen sign-in. */
export async function requireStaff(roles: Role[]) {
  await connection();
  const payload = await getPayload({ config });
  const staff = await currentStaff(payload);
  if (!staff) redirect('/kitchen/login');
  if (!roles.includes(staff.role)) redirect('/kitchen');
  return { payload, staff };
}

const dayLabel = (iso: string) => {
  const label = new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' });
  return iso === londonToday() ? `Today, ${label}` : label;
};
export const longDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' });

/**
 * The delivery day a screen shows: the one asked for, else the next day with Orders, else the
 * next delivery day. Returns the choices for the day picker too.
 */
export async function pickDay(payload: Awaited<ReturnType<typeof getPayload>>, asked: string | undefined) {
  const days = await upcomingDays(payload);
  const fallback = days[0] ?? deliveryDateFor(new Date());
  const date = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) ? asked : fallback;
  const all = [...new Set([...days, date])].sort();
  const orders = await ordersForDay(payload, date);
  return { date, orders, days: all.map(d => ({ value: d, label: dayLabel(d) })), placeholder: DELIVERY_PLACEHOLDER.isPlaceholder };
}
