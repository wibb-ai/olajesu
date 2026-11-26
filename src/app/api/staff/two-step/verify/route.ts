import { logActivityAs } from '../../../../../lib/activity';
import { fromThisSite, json } from '../../../../../lib/http';
import { decryptSecret, LOCK_MINUTES, lockedUntil, MAX_FAILURES, redeemBackupCode, verifyTotp } from '../../../../../lib/twoFactor';
import { grantPass, signedInUser } from '../../../../../lib/twoStepServer';

/**
 * The code step at each sign-in: a 6-digit code from the app, or a backup code. Five wrong codes
 * in a row pause it for 10 minutes.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const { payload, user } = await signedInUser();
  if (!user) return json({ error: 'Please sign in again.' }, 401);
  if (user.role !== 'master-admin' || !user.twoStepEnabledAt || !user.totpSecret) return json({ error: 'Start again.' }, 400);
  if (user.totpLockedUntil && new Date(user.totpLockedUntil) > new Date()) {
    return json({ error: `Too many wrong codes. Try again in ${LOCK_MINUTES} minutes.` }, 429);
  }

  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  // A 6-digit code from the app.
  const step = /^\d{6}$/.test(code.replace(/\s+/g, '')) ? verifyTotp(decryptSecret(user.totpSecret), code.replace(/\s+/g, ''), user.totpLastStep) : null;
  if (step !== null) {
    await payload.update({ collection: 'users', id: user.id, overrideAccess: true, data: { totpLastStep: step, totpFailures: 0, totpLockedUntil: null } });
    await grantPass(user);
    return json({ ok: true });
  }

  // Or a backup code, used up once accepted.
  const remaining = code.length >= 10 ? redeemBackupCode((user.totpBackupCodes as string[] | null) ?? [], code) : null;
  if (remaining) {
    await payload.update({ collection: 'users', id: user.id, overrideAccess: true, data: { totpBackupCodes: remaining, totpFailures: 0, totpLockedUntil: null } });
    await logActivityAs(payload, user.id, 'Backup code used', `${user.email}: ${remaining.length} left`);
    await grantPass(user);
    return json({ ok: true, backupCodesLeft: remaining.length });
  }

  const failures = (user.totpFailures ?? 0) + 1;
  const lock = failures >= MAX_FAILURES;
  await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    data: { totpFailures: lock ? 0 : failures, totpLockedUntil: lock ? lockedUntil() : null },
  });
  if (lock) await logActivityAs(payload, user.id, 'Two-step login paused', `${user.email}: ${MAX_FAILURES} wrong codes`);
  return json({ error: lock ? `Too many wrong codes. Try again in ${LOCK_MINUTES} minutes.` : 'That code didn’t work. Try the newest one from your app.' }, lock ? 429 : 400);
}
