import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/*
 * Two-step login for Master admins (staff-roles ticket): a 6-digit code from an authenticator
 * app (TOTP, RFC 6238: SHA-1, 30-second steps, 6 digits), or a single-use backup code.
 * Built on Node's own crypto, no third-party code on the sign-in path.
 *
 * A passed check is remembered in a signed cookie tied to the Payload session (its "sid"), so a
 * new sign-in always needs a new code and signing out ends it.
 */

export const COOKIE = 'oj_staff_2fa';
const PASS_HOURS = 12;
const STEP_SECONDS = 30;
export const MAX_FAILURES = 5;
export const LOCK_MINUTES = 10;
/** When a pause after too many wrong codes ends. */
export const lockedUntil = () => new Date(Date.now() + LOCK_MINUTES * 6e4).toISOString();

const key = (purpose: string) => createHash('sha256').update(`${purpose}:${process.env.PAYLOAD_SECRET ?? ''}`).digest();

// ---------------------------------------------------------------------------
// Base32 (RFC 4648), as authenticator apps expect

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Encode(buf: Buffer) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}
export function base32Decode(s: string) {
  const clean = s.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('bad base32');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

// ---------------------------------------------------------------------------
// TOTP

export function totpAt(secretBase32: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = createHmac('sha1', base32Decode(secretBase32)).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

/**
 * Checks a code against the previous, current and next 30-second step (phones drift).
 * Returns the step it matched, which must be later than the last one used, so a code
 * can't be replayed.
 */
export function verifyTotp(secretBase32: string, code: string, lastUsedStep: number | null | undefined, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const step = currentStep(now);
  for (const s of [step - 1, step, step + 1]) {
    if (lastUsedStep != null && s <= lastUsedStep) continue;
    const expected = totpAt(secretBase32, s);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return s;
  }
  return null;
}

export const newSecret = () => base32Encode(randomBytes(20));

export function otpauthUrl(secret: string, email: string) {
  const label = encodeURIComponent(`OlaJesu Admin:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent('OlaJesu Admin')}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;
}

// ---------------------------------------------------------------------------
// The secret is stored encrypted (AES-256-GCM), so a database leak alone can't produce codes.

export function encryptSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key('totp-secret'), iv);
  const data = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(b => b.toString('base64url')).join('.');
}
export function decryptSecret(stored: string) {
  const [iv, tag, data] = stored.split('.').map(p => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key('totp-secret'), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

// ---------------------------------------------------------------------------
// Backup codes: shown once, stored only as hashes, each usable once.

const BACKUP_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function newBackupCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const raw = Array.from(randomBytes(10), b => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join('');
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
export const hashBackupCode = (code: string) => createHash('sha256').update(`backup:${code.replace(/[\s-]/g, '').toUpperCase()}`).digest('hex');

/** Returns the remaining hashes if the code matched one (it is then used up), else null. */
export function redeemBackupCode(hashes: string[], code: string) {
  const h = hashBackupCode(code);
  const i = hashes.findIndex(x => x.length === h.length && timingSafeEqual(Buffer.from(x), Buffer.from(h)));
  return i < 0 ? null : hashes.filter((_, j) => j !== i);
}

// ---------------------------------------------------------------------------
// "Code entered" cookie: userId.sid.expiry.signature, tied to one Payload session.

const sign = (v: string) => createHmac('sha256', key('staff-2fa')).update(v).digest('base64url');

export function passCookie(userId: number | string, sid: string) {
  const exp = Date.now() + PASS_HOURS * 36e5;
  const value = `${userId}.${sid}.${exp}`;
  return { name: COOKIE, value: `${value}.${sign(value)}`, expires: new Date(exp) };
}

/** Has this person entered a code in this Payload session? Reads the raw Cookie header. */
export function passedTwoStep(cookieHeader: string | null | undefined, user: { id: number | string; _sid?: string }) {
  if (!cookieHeader || !user._sid) return false;
  const raw = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [id, sid, exp, sig] = decodeURIComponent(raw).split('.');
  const expected = sign(`${id}.${sid}.${exp}`);
  if (!sig || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return String(user.id) === id && user._sid === sid && Number(exp) > Date.now();
}
