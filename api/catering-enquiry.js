/**
 * Vercel serverless: send catering enquiries via Resend (reliable in Instagram in-app browser).
 * Env: RESEND_API_KEY, ENQUIRY_TO_EMAIL, EMAIL_FROM
 * Optional: TURNSTILE_SECRET_KEY — when set, a valid Turnstile token is required,
 * except for requests whose User-Agent is a social in-app browser (Turnstile is not shown there).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()-]{7,20}$/;
const IN_APP_UA_RE = /Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|TikTok/i;
const MAX_FIELD_LENGTH = 500;
const MAX_MESSAGE_LENGTH = 2000;

function json(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body && typeof req.body === 'object' ? req.body : null;
}

/** Coerce to a single-line trimmed string, capped in length. */
function field(value, max = MAX_FIELD_LENGTH) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

async function verifyTurnstile(token, secret, ip) {
  if (!token || !secret) return false;
  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.set('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await r.json();
    return data.success === true;
  } catch (e) {
    console.error('turnstile verify failed', e);
    return false;
  }
}

function validate({ name, email, phone, guests, message }) {
  if (name.length < 2) return 'Please enter your full name.';
  if (!email || !EMAIL_RE.test(email)) return 'Please enter a valid email address.';
  if (phone && !PHONE_RE.test(phone)) return 'Please enter a valid phone number.';
  if (guests) {
    const n = Number(guests);
    if (!Number.isFinite(n) || n < 1 || n > 10000) return 'Please enter a valid number of guests (1–10,000).';
  }
  if (message.length > MAX_MESSAGE_LENGTH) return 'Additional details is too long (max 2,000 characters).';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = json(req) || {};

  // Honeypot: pretend success so bots don't learn they were filtered.
  if (body.honeypot) {
    return res.status(200).json({ success: true });
  }

  const data = {
    name: field(body.name),
    email: field(body.email),
    phone: field(body.phone, 30),
    event: field(body.event),
    guests: field(body.guests, 10),
    date: field(body.date, 20),
    message: String(body.message ?? '').trim().slice(0, MAX_MESSAGE_LENGTH + 1),
  };

  const validationError = validate(data);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const isInAppBrowser = IN_APP_UA_RE.test(req.headers['user-agent'] || '');
  if (turnstileSecret && !isInAppBrowser) {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ok = await verifyTurnstile(field(body.turnstileToken, 2048), turnstileSecret, ip);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Security check failed. Please try again.' });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!apiKey || !to) {
    console.error('catering-enquiry: missing env', { RESEND_API_KEY: !!apiKey, ENQUIRY_TO_EMAIL: !!to });
    return res.status(500).json({
      success: false,
      message: 'Our enquiry form is temporarily unavailable. Please message us on WhatsApp.',
    });
  }

  const from = process.env.EMAIL_FROM || 'OlaJesu <onboarding@resend.dev>';
  const lines = [
    'New catering enquiry (olajesu.com)',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
  ];
  if (data.phone) lines.push(`Phone: ${data.phone}`);
  if (data.event) lines.push(`Event: ${data.event}`);
  if (data.guests) lines.push(`Guests: ${data.guests}`);
  if (data.date) lines.push(`Date: ${data.date}`);
  if (isInAppBrowser) lines.push('(Sent from an in-app browser — no security check)');
  if (data.message) lines.push('', 'Details:', data.message);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Catering enquiry from ${data.name}`,
        text: lines.join('\n'),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('catering-enquiry: resend error', response.status, result);
      return res.status(502).json({
        success: false,
        message: 'We could not send your enquiry. Please try again or message us on WhatsApp.',
      });
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (e) {
    console.error('catering-enquiry', e);
    return res.status(500).json({ success: false, message: 'Server error sending email' });
  }
}
