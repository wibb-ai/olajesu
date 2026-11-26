import config from '@payload-config';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getPayload, type Payload } from 'payload';

import type { Customer, Order } from '../payload-types';

/*
 * Customer Accounts (Accounts ticket): sign-in only by emailed Login link, a sign-in that lasts
 * 30 days on the device, and an Account that exists only once its email is proven.
 */

export const LINK_MINUTES = 15;
const SESSION_DAYS = 30;
const COOKIE = 'oj_account';
export type LinkPurpose = 'login' | 'save-details' | 'change-email' | 'delete';

export const normaliseEmail = (email: string) => email.trim().toLowerCase();
export const looksLikeEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

// ---------------------------------------------------------------------------
// Login links

/** Creates a Login link token. Returns null if this email has asked too often (5 an hour). */
export async function createLinkToken(
  payload: Payload,
  data: { email: string; purpose: LinkPurpose; orderId?: number; customerId?: number; newEmail?: string },
): Promise<string | null> {
  const email = normaliseEmail(data.email);
  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const { totalDocs } = await payload.count({ collection: 'login-tokens', overrideAccess: true, where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: hourAgo } }] } });
  if (totalDocs >= 5) return null;
  const token = randomBytes(32).toString('base64url');
  await payload.create({
    collection: 'login-tokens',
    overrideAccess: true,
    data: { ...data, email, tokenHash: hash(token), expiresAt: new Date(Date.now() + LINK_MINUTES * 6e4).toISOString() },
  });
  return token;
}

/** Uses up a Login link token: single use, and only within 15 minutes. */
export async function consumeLinkToken(payload: Payload, token: string) {
  if (!token || token.length > 100) return null;
  const { docs } = await payload.find({ collection: 'login-tokens', overrideAccess: true, limit: 1, where: { tokenHash: { equals: hash(token) } } });
  const row = docs[0];
  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) return null;
  // Mark used first, only if still unused, so two clicks can't both succeed.
  const updated = await payload.update({
    collection: 'login-tokens',
    overrideAccess: true,
    where: { and: [{ id: { equals: row.id } }, { usedAt: { exists: false } }] },
    data: { usedAt: new Date().toISOString() },
  });
  return updated.docs.length ? row : null;
}

/** Is there an unused, unexpired token? For the "Sign in" button page, without using it up. */
export async function peekLinkToken(payload: Payload, token: string) {
  if (!token || token.length > 100) return null;
  const { docs } = await payload.find({ collection: 'login-tokens', overrideAccess: true, limit: 1, where: { tokenHash: { equals: hash(token) } } });
  const row = docs[0];
  return row && !row.usedAt && new Date(row.expiresAt) > new Date() ? row : null;
}

// ---------------------------------------------------------------------------
// Sign-in cookie: "customerId.sessionVersion.expiry.signature", signed with PAYLOAD_SECRET.

const key = () => createHash('sha256').update(`customer-session:${process.env.PAYLOAD_SECRET ?? ''}`).digest();
const sign = (value: string) => createHmac('sha256', key()).update(value).digest('base64url');

export async function startSession(customer: Pick<Customer, 'id' | 'sessionVersion'>) {
  const expires = Date.now() + SESSION_DAYS * 864e5;
  const value = `${customer.id}.${customer.sessionVersion ?? 1}.${expires}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in Customer, or null. A changed sessionVersion (email change, deletion) signs them out. */
export async function currentCustomer(payload?: Payload): Promise<Customer | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !process.env.PAYLOAD_SECRET) return null;
  const [id, version, expires, signature] = raw.split('.');
  const expected = sign(`${id}.${version}.${expires}`);
  if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  if (Number(expires) < Date.now() || !/^\d+$/.test(id)) return null;
  const p = payload ?? (await getPayload({ config }));
  const customer = await p.findByID({ collection: 'customers', id: Number(id), overrideAccess: true, showHiddenFields: true, disableErrors: true, depth: 0 });
  if (!customer || String(customer.sessionVersion ?? 1) !== version) return null;
  return customer;
}

/** What a client component may know about the signed-in Customer. */
export type AccountSummary = { firstName: string; email: string } | null;
export const summary = (c: Customer | null): AccountSummary => (c ? { firstName: (c.name ?? '').split(/\s+/)[0] ?? '', email: c.email } : null);

// ---------------------------------------------------------------------------
// Details

/** Saved details from an Order's Stripe details: name, phone and the UK address lines. */
export function detailsFromOrder(order: Order): Partial<Customer> {
  const lines = (order.deliveryAddress ?? '').split('\n').map(l => l.trim()).filter(Boolean);
  // deliveryAddress is "name, line1, [line2], city, [county], postcode" (see formatAddress in orders.ts).
  const [, line1, ...rest] = lines[0] === order.customerName ? lines : ['', ...lines];
  const postcode = rest.pop() ?? '';
  const city = rest.pop() ?? '';
  return {
    name: order.customerName ?? undefined,
    phone: order.phone ?? undefined,
    addressLine1: line1 ?? undefined,
    addressLine2: rest.join(', ') || undefined,
    city: city || undefined,
    postcode: postcode || undefined,
  };
}

/** The newest paid Order for an email, to fill in a new Account. */
export async function latestOrder(payload: Payload, email: string) {
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    limit: 1,
    sort: '-createdAt',
    where: { and: [{ email: { equals: normaliseEmail(email) } }, { status: { not_in: ['awaiting-payment', 'expired'] } }] },
  });
  return docs[0] ?? null;
}

/** Find the Account for an email, or create it (the email has just been proven by a Login link). */
export async function findOrCreateCustomer(payload: Payload, email: string, fillFrom?: Order | null) {
  const e = normaliseEmail(email);
  const { docs } = await payload.find({ collection: 'customers', overrideAccess: true, limit: 1, showHiddenFields: true, where: { email: { equals: e } } });
  if (docs[0]) return payload.update({ collection: 'customers', id: docs[0].id, overrideAccess: true, showHiddenFields: true, data: { lastActiveAt: new Date().toISOString() } });
  const source = fillFrom ?? (await latestOrder(payload, e));
  return payload.create({
    collection: 'customers',
    overrideAccess: true,
    showHiddenFields: true,
    data: { email: e, ...(source ? detailsFromOrder(source) : {}), marketingConsent: !!source?.marketingConsent, lastActiveAt: new Date().toISOString(), sessionVersion: 1 },
  });
}

/**
 * After a paid Order: if the Customer has an Account and ticked "Update my saved details",
 * copy this Order's details across; a Marketing consent tick at checkout is recorded too.
 */
export async function syncAccountFromOrder(payload: Payload, orderId: number) {
  const order = await payload.findByID({ collection: 'orders', id: orderId, overrideAccess: true, showHiddenFields: true, depth: 0 });
  if (!order.email) return;
  const { docs } = await payload.find({ collection: 'customers', overrideAccess: true, limit: 1, where: { email: { equals: normaliseEmail(order.email) } } });
  const customer = docs[0];
  if (!customer) return;
  await payload.update({
    collection: 'customers',
    id: customer.id,
    overrideAccess: true,
    data: {
      lastActiveAt: new Date().toISOString(),
      ...(order.updateSavedDetails ? detailsFromOrder(order) : {}),
      ...(order.marketingConsent && !customer.marketingConsent ? { marketingConsent: true } : {}),
    },
  });
}

/** Every Order placed with this Account's emails, newest first (Accounts ticket: guest or not, before or after). */
export async function ordersFor(payload: Payload, customer: Pick<Customer, 'email' | 'previousEmails'>) {
  const emails = [customer.email, ...((customer.previousEmails as string[] | null) ?? [])].map(normaliseEmail);
  const { docs } = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    limit: 50,
    sort: '-createdAt',
    showHiddenFields: true,
    where: { and: [{ email: { in: emails } }, { status: { not_in: ['awaiting-payment', 'expired'] } }] },
  });
  return docs;
}
