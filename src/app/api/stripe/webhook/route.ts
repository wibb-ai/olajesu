import config from '@payload-config';
import { getPayload } from 'payload';
import type Stripe from 'stripe';

import { notifyPaid } from '../../../../lib/orderEmails';
import { markExpiredFromSession, markPaidFromSession } from '../../../../lib/orders';
import { getStripe } from '../../../../lib/stripe';

/**
 * Stripe tells us here when a Checkout Session is paid or expires. The signature is checked
 * with STRIPE_WEBHOOK_SECRET before anything is trusted, and handling is safe to repeat:
 * Stripe may send the same event more than once.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response('Payments are not set up', { status: 503 });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const payload = await getPayload({ config });
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const result = await markPaidFromSession(payload, event.data.object);
      if (result.changed) {
        payload.logger.info(`Order ${result.number} paid`);
        await notifyPaid(payload, result.id);
      }
      break;
    }
    case 'checkout.session.expired':
      await markExpiredFromSession(payload, event.data.object);
      break;
    default:
      // Not an event we act on; acknowledge it so Stripe stops retrying.
      break;
  }
  return new Response('ok');
}
