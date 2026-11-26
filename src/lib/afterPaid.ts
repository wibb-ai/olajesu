import type { Payload } from 'payload';

import { syncAccountFromOrder } from './account';
import { notifyPaid } from './orderEmails';

/**
 * Everything that follows a payment, from either payment path (Stripe webhook or the
 * confirmation page): the emails, and the Customer's Account if they have one.
 */
export async function afterPaid(payload: Payload, orderId: number) {
  await Promise.all([notifyPaid(payload, orderId), syncAccountFromOrder(payload, orderId)]);
}
