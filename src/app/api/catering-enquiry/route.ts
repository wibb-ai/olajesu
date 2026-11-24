/**
 * Send catering enquiries via Resend (reliable in the Instagram in-app browser).
 * Env: RESEND_API_KEY, ENQUIRY_TO_EMAIL, EMAIL_FROM
 * Optional: TURNSTILE_SECRET_KEY. When set, a valid Turnstile token is required,
 * except for requests whose User-Agent is a social in-app browser (Turnstile is not shown there).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()-]{7,20}$/;
const IN_APP_UA_RE = /Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|TikTok/i;
const MAX_FIELD_LENGTH = 500;
const MAX_MESSAGE_LENGTH = 2000;

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  event: string;
  guests: string;
  date: string;
  message: string;
};

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

/** Coerce to a single-line trimmed string, capped in length. */
function field(value: unknown, max = MAX_FIELD_LENGTH) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

async function verifyTurnstile(token: string, secret: string, ip: string) {
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

function validate({ name, email, phone, guests, message }: Enquiry) {
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

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === 'object') body = parsed;
  } catch {
    // Treat an unreadable body as empty; validation rejects it below.
  }

  // Honeypot: pretend success so bots don't learn they were filtered.
  if (body.honeypot) {
    return reply(200, { success: true });
  }

  const data: Enquiry = {
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
    return reply(400, { success: false, message: validationError });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const isInAppBrowser = IN_APP_UA_RE.test(request.headers.get('user-agent') || '');
  if (turnstileSecret && !isInAppBrowser) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const ok = await verifyTurnstile(field(body.turnstileToken, 2048), turnstileSecret, ip);
    if (!ok) {
      return reply(400, { success: false, message: 'Security check failed. Please try again.' });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!apiKey || !to) {
    console.error('catering-enquiry: missing env', { RESEND_API_KEY: !!apiKey, ENQUIRY_TO_EMAIL: !!to });
    return reply(500, {
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
  if (isInAppBrowser) lines.push('(Sent from an in-app browser, no security check)');
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
      return reply(502, {
        success: false,
        message: 'We could not send your enquiry. Please try again or message us on WhatsApp.',
      });
    }

    return reply(200, { success: true, id: result.id });
  } catch (e) {
    console.error('catering-enquiry', e);
    return reply(500, { success: false, message: 'Server error sending email' });
  }
}
