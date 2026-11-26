import config from '@payload-config';
import { getPayload } from 'payload';

import { fromThisSite, json } from '../../../../../../lib/http';
import { refundOrder, RefundError } from '../../../../../../lib/refunds';
import { sendRefundEmails } from '../../../../../../lib/refundEmails';
import { currentStaff } from '../../../../../../lib/staff';
import { getStripe } from '../../../../../../lib/stripe';

/**
 * Master admin only (staff-roles ticket): refund chosen Meals, or cancel the Order for the kitchen
 * with a full refund. Body: { kind: 'refund', unitKeys, reason } or { kind: 'kitchen-cancel', reason }.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const staff = await currentStaff();
  if (!staff || staff.role !== 'master-admin') return json({ error: 'Only a Master admin can refund.' }, 403);

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { kind?: unknown; unitKeys?: unknown; reason?: unknown };
  const kind = body.kind === 'kitchen-cancel' ? 'kitchen-cancel' : body.kind === 'refund' ? 'refund' : null;
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const unitKeys = Array.isArray(body.unitKeys) ? body.unitKeys.filter((k): k is string => typeof k === 'string' && /^\d+\.\d+$/.test(k)) : [];
  if (!kind || !/^\d+$/.test(id)) return json({ error: 'Something went wrong.' }, 400);
  if (!reason) return json({ error: 'Add a short reason, e.g. “Missing Meal”.' }, 400);

  const stripe = getStripe();
  if (!stripe) return json({ error: 'Card payments aren’t set up, so refunds can’t be made yet.' }, 503);

  const payload = await getPayload({ config });
  try {
    const result = await refundOrder(payload, stripe, Number(id), { kind, unitKeys, reason, staffId: staff.id });
    if (!result.repeated) await sendRefundEmails(payload, result.order, kind, result.amount, result.units, reason);
    return json({ ok: true, amount: result.amount });
  } catch (err) {
    if (err instanceof RefundError) return json({ error: err.message }, 400);
    payload.logger.error({ err, msg: `Refund failed for Order ${id}` });
    return json({ error: 'Stripe didn’t accept the refund. Nothing was changed; please try again.' }, 502);
  }
}
