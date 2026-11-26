import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import { getPayload } from 'payload';

import { deliveryDateClosedToday } from '../../../../lib/delivery';
import { sendCutoffLists, sendOrderConfirmation } from '../../../../lib/orderEmails';
import { shopEnabled } from '../../../../lib/shop';

/**
 * Run once a day by Vercel Cron (vercel.json), after the evening Cut-off.
 * - On Cut-off day, emails the kitchen the Cook, Packing and Delivery lists.
 * - Every day, retries any paid Order's confirmation email that failed to send.
 * Vercel sends "Authorization: Bearer $CRON_SECRET"; anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  if (!secret || auth.length !== expected.length || !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Nothing to do until ordering is live.
  if (!shopEnabled()) return Response.json({ skipped: 'shop not live' });

  const payload = await getPayload({ config });
  const report: Record<string, unknown> = {};

  const closed = deliveryDateClosedToday(new Date());
  if (closed) {
    const sent = await sendCutoffLists(payload, closed);
    report.lists = { deliveryDate: closed, sent: sent.sent, error: sent.error };
  }

  const since = new Date(Date.now() - 3 * 864e5).toISOString();
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    pagination: false,
    where: { and: [{ status: { in: ['paid', 'preparing'] } }, { confirmationSentAt: { exists: false } }, { paidAt: { greater_than: since } }] },
  });
  let retried = 0;
  for (const o of docs) if (await sendOrderConfirmation(payload, o.id)) retried++;
  report.confirmations = { unsent: docs.length, sentNow: retried };

  payload.logger.info({ msg: 'daily job', ...report });
  return Response.json(report);
}
