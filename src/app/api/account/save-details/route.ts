import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import { getPayload } from 'payload';

import { createLinkToken } from '../../../../lib/account';
import { sendLinkEmail } from '../../../../lib/accountEmails';
import { fromThisSite, json } from '../../../../lib/http';

const PAID = ['paid', 'preparing', 'ready', 'out-for-delivery', 'delivered'];

/**
 * "Save my details" on the confirmation page: emails a Login link to the Order's email. The
 * Account is only created when the link is clicked, which proves the email (Accounts ticket).
 * Needs the Order's private link token, so only the person who paid can ask.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const body = (await request.json().catch(() => ({}))) as { orderId?: unknown; token?: unknown };
  if (!Number.isInteger(body.orderId) || typeof body.token !== 'string') return json({ error: 'Something went wrong.' }, 400);

  const payload = await getPayload({ config });
  const order = await payload.findByID({ collection: 'orders', id: body.orderId as number, overrideAccess: true, showHiddenFields: true, disableErrors: true, depth: 0 });
  const ok = order?.accessToken && order.accessToken.length === body.token.length && timingSafeEqual(Buffer.from(order.accessToken), Buffer.from(body.token));
  if (!order || !ok || !order.email || !PAID.includes(order.status)) return json({ error: 'Something went wrong.' }, 400);

  const token = await createLinkToken(payload, { email: order.email, purpose: 'save-details', orderId: order.id });
  if (!token) return json({ error: 'We’ve sent a few links already. Please check your email, or try again in an hour.' }, 429);
  const sent = await sendLinkEmail(order.email, 'save-details', token);
  if (!sent.sent) return json({ error: 'We couldn’t send the email just now. Please try again soon.' }, 502);
  return json({ ok: true, email: order.email });
}
