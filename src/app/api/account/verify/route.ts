import config from '@payload-config';
import { getPayload } from 'payload';

import { consumeLinkToken, detailsFromOrder, endSession, findOrCreateCustomer, normaliseEmail, startSession } from '../../../../lib/account';
import { fromThisSite, seeOther } from '../../../../lib/http';

/**
 * Where the "Sign in" button on /account/verify posts. A Login link only works through this
 * button press, not on opening the link, because some email apps open links to scan them,
 * which would otherwise use the link up.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return new Response('Not allowed', { status: 403 });
  const form = await request.formData().catch(() => null);
  const token = String(form?.get('token') ?? '');

  const payload = await getPayload({ config });
  const row = await consumeLinkToken(payload, token);
  if (!row) return seeOther(request, '/account?error=link');

  switch (row.purpose) {
    case 'login': {
      const customer = await findOrCreateCustomer(payload, row.email);
      await startSession(customer);
      return seeOther(request, '/account');
    }
    case 'save-details': {
      const order = row.orderId ? await payload.findByID({ collection: 'orders', id: row.orderId, overrideAccess: true, disableErrors: true, depth: 0 }) : null;
      if (!order || normaliseEmail(order.email ?? '') !== row.email) return seeOther(request, '/account?error=link');
      let customer = await findOrCreateCustomer(payload, row.email, order);
      // An existing Account takes this Order's details, as the Customer asked to save them.
      customer = await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, showHiddenFields: true, data: detailsFromOrder(order) });
      await startSession(customer);
      return seeOther(request, '/account?saved=1');
    }
    case 'change-email': {
      if (!row.customerId || !row.newEmail) return seeOther(request, '/account?error=link');
      const newEmail = normaliseEmail(row.newEmail);
      const taken = await payload.count({ collection: 'customers', overrideAccess: true, where: { and: [{ email: { equals: newEmail } }, { id: { not_equals: row.customerId } }] } });
      if (taken.totalDocs) return seeOther(request, '/account?error=email-taken');
      const current = await payload.findByID({ collection: 'customers', id: row.customerId, overrideAccess: true, showHiddenFields: true, disableErrors: true });
      if (!current) return seeOther(request, '/account?error=link');
      // A new email signs out every other device.
      const customer = await payload.update({
        collection: 'customers',
        id: current.id,
        overrideAccess: true,
        showHiddenFields: true,
        data: {
          email: newEmail,
          previousEmails: [...new Set([...((current.previousEmails as string[] | null) ?? []), current.email])],
          sessionVersion: (current.sessionVersion ?? 1) + 1,
          lastActiveAt: new Date().toISOString(),
        },
      });
      await startSession(customer);
      return seeOther(request, '/account?email=changed');
    }
    case 'delete': {
      if (row.customerId) await payload.delete({ collection: 'customers', id: row.customerId, overrideAccess: true }).catch(() => null);
      await endSession();
      return seeOther(request, '/?account=deleted');
    }
  }
}
