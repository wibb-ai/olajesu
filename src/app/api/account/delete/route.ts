import config from '@payload-config';
import { getPayload } from 'payload';

import { createLinkToken, currentCustomer } from '../../../../lib/account';
import { sendLinkEmail } from '../../../../lib/accountEmails';
import { fromThisSite, json } from '../../../../lib/http';

/** "Delete my Account": confirmed by a link to the Account's email (Accounts ticket). */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const payload = await getPayload({ config });
  const customer = await currentCustomer(payload);
  if (!customer) return json({ error: 'Please sign in again.' }, 401);

  const token = await createLinkToken(payload, { email: customer.email, purpose: 'delete', customerId: customer.id });
  if (!token) return json({ error: 'We’ve sent a few links already. Please try again in an hour.' }, 429);
  const sent = await sendLinkEmail(customer.email, 'delete', token);
  if (!sent.sent) return json({ error: 'We couldn’t send the email just now. Please try again soon.' }, 502);
  return json({ ok: true });
}
