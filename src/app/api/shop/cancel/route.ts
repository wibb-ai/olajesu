import config from '@payload-config';
import { timingSafeEqual } from 'crypto';
import { getPayload } from 'payload';

import { fromThisSite, json } from '../../../../lib/http';
import { refundOrder, RefundError } from '../../../../lib/refunds';
import { sendRefundEmails } from '../../../../lib/refundEmails';
import { getStripe } from '../../../../lib/stripe';

/**
 * "Cancel my Order": a full refund until the Cut-off (refunds ticket). Needs the Order's private
 * link token, which only the person who paid has (it's in their emails and confirmation page).
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const body = (await request.json().catch(() => ({}))) as { orderId?: unknown; token?: unknown };
  if (!Number.isInteger(body.orderId) || typeof body.token !== 'string') return json({ error: 'Something went wrong.' }, 400);

  const payload = await getPayload({ config });
  const order = await payload.findByID({ collection: 'orders', id: body.orderId as number, overrideAccess: true, showHiddenFields: true, disableErrors: true, depth: 0 });
  const ok = order?.accessToken && order.accessToken.length === body.token.length && timingSafeEqual(Buffer.from(order.accessToken), Buffer.from(body.token));
  if (!order || !ok) return json({ error: 'Something went wrong.' }, 400);

  const stripe = getStripe();
  if (!stripe) return json({ error: 'We can’t refund cards just now. Please reply to your confirmation email and we’ll cancel it for you.' }, 503);
  try {
    const result = await refundOrder(payload, stripe, order.id, { kind: 'customer-cancel', reason: 'Cancelled by the Customer before the cut-off' });
    if (!result.repeated) await sendRefundEmails(payload, result.order, 'customer-cancel', result.amount, result.units, '');
    return json({ ok: true, amount: result.amount });
  } catch (err) {
    if (err instanceof RefundError) return json({ error: err.message }, 400);
    payload.logger.error({ err, msg: `Cancellation failed for Order ${order.number}` });
    return json({ error: 'We couldn’t cancel it just now. Please try again, or reply to your confirmation email.' }, 502);
  }
}
