import config from '@payload-config';
import { headers } from 'next/headers';
import { getPayload, type Payload } from 'payload';

import type { Role } from '../access/roles';
import type { User } from '../payload-types';

/*
 * The screens for the day (staff-roles ticket): kitchen staff work from simple phone
 * screens at /kitchen. Delivery details (address, phone) are shown to them only on the delivery
 * day itself; the Master admin sees any day.
 */

export type Staff = User & { role: Role };

/** The signed-in, switched-on staff member (from Payload's login cookie), or null. */
export async function currentStaff(payload?: Payload): Promise<Staff | null> {
  const p = payload ?? (await getPayload({ config }));
  const { user } = await p.auth({ headers: await headers() });
  const u = user as (User & { collection?: string }) | null;
  if (!u || u.collection !== 'users' || u.active === false || !u.role) return null;
  return u as Staff;
}

/** Today's date in the UK (YYYY-MM-DD). */
export function londonToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** May this person see Customers' addresses and phone numbers for this delivery day? */
export const canSeeDeliveryDetails = (staff: Staff, deliveryDate: string) => staff.role === 'master-admin' || deliveryDate.slice(0, 10) === londonToday();

/** Orders the kitchen works on: paid and not cancelled or refunded. */
export const KITCHEN_STATUSES = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'partly-refunded'] as const;

export async function ordersForDay(payload: Payload, deliveryDate: string) {
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    pagination: false,
    sort: 'createdAt',
    where: { and: [{ deliveryDate: { equals: deliveryDate } }, { status: { in: [...KITCHEN_STATUSES] } }] },
  });
  return docs;
}

/** Delivery days that have Orders, from today on, soonest first (for the day picker). */
export async function upcomingDays(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    limit: 200,
    sort: 'deliveryDate',
    where: { and: [{ deliveryDate: { greater_than_equal: `${londonToday()}T00:00:00.000Z` } }, { status: { in: [...KITCHEN_STATUSES] } }] },
  });
  return [...new Set(docs.map(d => d.deliveryDate.slice(0, 10)))];
}
