import config from '@payload-config';
import { getPayload } from 'payload';

import { currentCustomer } from '../../../../lib/account';
import { fromThisSite, json } from '../../../../lib/http';

const LIMITS = { name: 100, phone: 30, addressLine1: 120, addressLine2: 120, city: 60, postcode: 10, deliveryNotes: 300 } as const;

/** Saves the signed-in Customer's own details and Marketing consent. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const payload = await getPayload({ config });
  const customer = await currentCustomer(payload);
  if (!customer) return json({ error: 'Please sign in again.' }, 401);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, string | boolean | null> = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    const v = body[field];
    if (v === undefined) continue;
    if (typeof v !== 'string' || v.length > max) return json({ error: 'Please check your details.' }, 400);
    data[field] = v.trim() || null;
  }
  if (typeof data.postcode === 'string') {
    const pc = data.postcode.toUpperCase().replace(/\s+/g, ' ');
    if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(pc)) return json({ error: 'That postcode doesn’t look right.' }, 400);
    data.postcode = pc;
  }
  if (typeof body.marketingConsent === 'boolean') data.marketingConsent = body.marketingConsent;

  await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, data: { ...data, lastActiveAt: new Date().toISOString() } });
  return json({ ok: true });
}
