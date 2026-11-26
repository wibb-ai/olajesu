import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import { getPayload } from 'payload';

import { inactivityEmail } from '../../../../lib/accountEmails';
import { deliveryDateClosedToday } from '../../../../lib/delivery';
import { sendEmail } from '../../../../lib/email';
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

  // Used or expired Login links are only kept a day.
  await payload.delete({ collection: 'login-tokens', overrideAccess: true, where: { createdAt: { less_than: new Date(Date.now() - 864e5).toISOString() } } });

  // Accounts unused for 3 years: warn, then delete a month later (Accounts ticket).
  const year = 365.25 * 864e5;
  const warnBefore = new Date(Date.now() - 3 * year + 30 * 864e5).toISOString();
  const toWarn = await payload.find({
    collection: 'customers',
    overrideAccess: true,
    pagination: false,
    where: { and: [{ lastActiveAt: { less_than: warnBefore } }, { inactivityWarnedAt: { exists: false } }] },
  });
  for (const c of toWarn.docs) {
    const sent = await sendEmail({ to: c.email, ...inactivityEmail(new Date(Date.now() + 30 * 864e5).toISOString()) });
    if (sent.sent) await payload.update({ collection: 'customers', id: c.id, overrideAccess: true, data: { inactivityWarnedAt: new Date().toISOString() } });
  }
  const warnedLongAgo = new Date(Date.now() - 30 * 864e5).toISOString();
  const toDelete = await payload.find({
    collection: 'customers',
    overrideAccess: true,
    pagination: false,
    where: { and: [{ inactivityWarnedAt: { less_than: warnedLongAgo } }, { lastActiveAt: { less_than: warnBefore } }] },
  });
  for (const c of toDelete.docs) await payload.delete({ collection: 'customers', id: c.id, overrideAccess: true });
  report.accounts = { warned: toWarn.docs.length, deleted: toDelete.docs.length };

  payload.logger.info({ msg: 'daily job', ...report });
  return Response.json(report);
}
