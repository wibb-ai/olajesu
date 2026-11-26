import config from '@payload-config';
import { getPayload } from 'payload';

import { createLinkToken, currentCustomer, looksLikeEmail, normaliseEmail } from '../../../../lib/account';
import { sendLinkEmail } from '../../../../lib/accountEmails';
import { fromThisSite, json } from '../../../../lib/http';

/** Change email: takes effect only once the Customer clicks the link sent to the new address. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const payload = await getPayload({ config });
  const customer = await currentCustomer(payload);
  if (!customer) return json({ error: 'Please sign in again.' }, 401);

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : '';
  if (!looksLikeEmail(email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (email === customer.email) return json({ error: 'That’s already your email address.' }, 400);

  const token = await createLinkToken(payload, { email, purpose: 'change-email', customerId: customer.id, newEmail: email });
  if (!token) return json({ error: 'We’ve sent a few links already. Please try again in an hour.' }, 429);
  const sent = await sendLinkEmail(email, 'change-email', token);
  if (!sent.sent) return json({ error: 'We couldn’t send the email just now. Please try again soon.' }, 502);
  return json({ ok: true });
}
