import config from '@payload-config';
import { getPayload } from 'payload';

import { fromThisSite, json } from '../../../../lib/http';
import { currentStaff } from '../../../../lib/staff';

/** "Start cooking": moves a delivery day's paid Orders to "Preparing". Kitchen and Master admin. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const payload = await getPayload({ config });
  const staff = await currentStaff(payload);
  if (!staff || staff.role === 'driver') return json({ error: 'Not allowed.' }, 403);

  const body = (await request.json().catch(() => ({}))) as { date?: unknown };
  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  if (!date) return json({ error: 'Pick a delivery day.' }, 400);

  const { docs } = await payload.update({
    collection: 'orders',
    overrideAccess: true,
    where: { and: [{ deliveryDate: { equals: date } }, { status: { equals: 'paid' } }] },
    data: { status: 'preparing' },
  });
  return json({ ok: true, updated: docs.length });
}
