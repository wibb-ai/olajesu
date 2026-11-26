import QRCode from 'qrcode';

import { fromThisSite, json } from '../../../../../lib/http';
import { encryptSecret, newSecret, otpauthUrl } from '../../../../../lib/twoFactor';
import { signedInUser } from '../../../../../lib/twoStepServer';

/**
 * First sign-in for a Master admin without two-step login: makes a new secret (kept encrypted and
 * "pending" until a code proves the app has it) and returns the QR code and key to add to the app.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return json({ error: 'Not allowed.' }, 403);
  const { payload, user } = await signedInUser();
  if (!user) return json({ error: 'Please sign in again.' }, 401);
  if (user.role !== 'master-admin') return json({ error: 'Not needed for this login.' }, 400);
  if (user.twoStepEnabledAt) return json({ error: 'Two-step login is already set up.' }, 400);

  const secret = newSecret();
  await payload.update({ collection: 'users', id: user.id, overrideAccess: true, data: { totpPendingSecret: encryptSecret(secret) } });
  const url = otpauthUrl(secret, user.email);
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 220, errorCorrectionLevel: 'M' });
  return json({ qr, secret: secret.match(/.{1,4}/g)!.join(' '), url });
}
