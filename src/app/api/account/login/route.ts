import config from '@payload-config';
import { getPayload } from 'payload';

import { createLinkToken, looksLikeEmail, normaliseEmail } from '../../../../lib/account';
import { sendLinkEmail } from '../../../../lib/accountEmails';
import { fromThisSite, json } from '../../../../lib/http';
import { shopEnabled } from '../../../../lib/shop';

/**
 * "Sign in": emails a Login link to any address. The answer is always the same, so nobody can
 * use this to find out which emails have Accounts (Accounts ticket). If no Account exists,
 * clicking the link creates one.
 */
export async function POST(request: Request) {
  if (!shopEnabled()) return json({ error: 'Not available yet.' }, 404);
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : '';
  if (!looksLikeEmail(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  const payload = await getPayload({ config });
  const token = await createLinkToken(payload, { email, purpose: 'login' });
  if (token) await sendLinkEmail(email, 'login', token);
  return json({ ok: true });
}
