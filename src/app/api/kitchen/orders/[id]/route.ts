import config from '@payload-config';
import { getPayload } from 'payload';

import { fromThisSite, json } from '../../../../../lib/http';
import { canSeeDeliveryDetails, currentStaff, KITCHEN_STATUSES } from '../../../../../lib/staff';

type Action = 'packed' | 'unpacked' | 'out-for-delivery' | 'ready' | 'delivered';

/**
 * The buttons on the screens for the day. Orders are otherwise changed only by the Master admin;
 * this endpoint lets Kitchen staff tick off packing and mark deliveries, on the delivery day only
 * (staff-roles ticket). "Out for delivery" emails the Customer.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const payload = await getPayload({ config });
  const staff = await currentStaff(payload);
  if (!staff) return json({ error: 'Please sign in again.' }, 401);

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { action?: Action };
  const order = /^\d+$/.test(id) ? await payload.findByID({ collection: 'orders', id: Number(id), overrideAccess: true, disableErrors: true, depth: 0 }) : null;
  if (!order || !(KITCHEN_STATUSES as readonly string[]).includes(order.status)) return json({ error: 'Order not found.' }, 404);

  switch (body.action) {
    case 'packed':
    case 'unpacked':
      await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { packedAt: body.action === 'packed' ? new Date().toISOString() : null } });
      return json({ ok: true });

    case 'out-for-delivery':
    case 'ready':
    case 'delivered':
      if (!canSeeDeliveryDetails(staff, order.deliveryDate)) return json({ error: 'Deliveries can only be marked on the delivery day.' }, 403);
      // "Ready to collect" is for collections, "Out for delivery" for deliveries.
      if ((body.action === 'ready') !== (order.fulfilment === 'collection') && body.action !== 'delivered') return json({ error: 'That doesn’t apply to this Order.' }, 400);
      if (order.status === body.action) return json({ ok: true });
      await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { status: body.action } });
      return json({ ok: true });

    default:
      return json({ error: 'Unknown action.' }, 400);
  }
}
