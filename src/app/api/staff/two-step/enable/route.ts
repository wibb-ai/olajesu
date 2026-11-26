import { logActivityAs } from '../../../../../lib/activity';
import { fromThisSite, json } from '../../../../../lib/http';
import { decryptSecret, hashBackupCode, newBackupCodes, verifyTotp } from '../../../../../lib/twoFactor';
import { grantPass, signedInUser } from '../../../../../lib/twoStepServer';

/** Finishes set-up: the first code from the app proves it has the secret. Returns the backup codes, once. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const { payload, user } = await signedInUser();
  if (!user) return json({ error: 'Please sign in again.' }, 401);
  if (user.role !== 'master-admin' || user.twoStepEnabledAt || !user.totpPendingSecret) return json({ error: 'Start set-up again.' }, 400);

  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === 'string' ? body.code.replace(/\s+/g, '') : '';
  const secret = decryptSecret(user.totpPendingSecret);
  const step = verifyTotp(secret, code, null);
  if (step === null) return json({ error: 'That code didn’t match. Check the time on your phone is set automatically, and try the newest code.' }, 400);

  const backupCodes = newBackupCodes();
  await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    data: {
      totpSecret: user.totpPendingSecret,
      totpPendingSecret: null,
      totpLastStep: step,
      totpBackupCodes: backupCodes.map(hashBackupCode),
      totpFailures: 0,
      totpLockedUntil: null,
      twoStepEnabledAt: new Date().toISOString(),
    },
  });
  await logActivityAs(payload, user.id, 'Two-step login set up', user.email);
  await grantPass(user);
  return json({ ok: true, backupCodes });
}
