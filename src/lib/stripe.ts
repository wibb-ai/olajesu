import Stripe from 'stripe';

let client: Stripe | null = null;

/** The Stripe client, or null when STRIPE_SECRET_KEY isn't set (payments not set up yet). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (key.startsWith('sk_live_') && process.env.VERCEL_ENV !== 'production') {
    // Live keys only ever belong in Production; anywhere else, refuse rather than take real money.
    throw new Error('A live Stripe key is set outside Production. Use a test key (sk_test_…) here.');
  }
  client ??= new Stripe(key, { appInfo: { name: 'olajesu.com' } });
  return client;
}
