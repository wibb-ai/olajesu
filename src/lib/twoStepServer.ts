import config from '@payload-config';
import { cookies, headers } from 'next/headers';
import { getPayload, type Payload } from 'payload';

import type { User } from '../payload-types';
import { COOKIE, passCookie, passedTwoStep } from './twoFactor';

export type SignedIn = User & { _sid?: string; collection?: string };

/** The person signed in to the dashboard (password done), with the two-step fields, or null. */
export async function signedInUser(payload?: Payload) {
  const p = payload ?? (await getPayload({ config }));
  const h = await headers();
  const { user } = await p.auth({ headers: h });
  const u = user as SignedIn | null;
  if (!u || u.collection !== 'users' || u.active === false) return { payload: p, user: null, passed: false };
  const full = (await p.findByID({ collection: 'users', id: u.id, overrideAccess: true, showHiddenFields: true, depth: 0 })) as SignedIn;
  full._sid = u._sid;
  return { payload: p, user: full, passed: passedTwoStep(h.get('cookie'), u) };
}

export async function grantPass(user: SignedIn) {
  if (!user._sid) throw new Error('No Payload session id: is useSessions on?');
  const c = passCookie(user.id, user._sid);
  (await cookies()).set(c.name, c.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: c.expires });
}

export async function clearPass() {
  (await cookies()).delete(COOKIE);
}

/** Only send people back to the dashboard or the kitchen screens, never elsewhere. */
export const safeNext = (next: string | null | undefined) =>
  next && /^\/(admin|kitchen)(\/|$|\?)/.test(next) && !next.startsWith('//') ? next : '/admin';
