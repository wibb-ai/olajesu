/**
 * Vercel serverless: send catering enquiries via Resend (reliable in Instagram in-app browser).
 * Env: RESEND_API_KEY, ENQUIRY_TO_EMAIL, EMAIL_FROM
 * Optional: TURNSTILE_SECRET_KEY (server verify when token is sent)
 */

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

async function verifyTurnstile(token, secret) {
  if (!token || !secret) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await r.json();
  return data.success === true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'Server email is not configured (RESEND_API_KEY).' });
  }

  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!to) {
    return res.status(500).json({ success: false, message: 'ENQUIRY_TO_EMAIL is not set.' });
  }

  const body = json(req) || {};
  const {
    name = '',
    email = '',
    phone = '',
    event: eventType = '',
    guests = '',
    date: eventDate = '',
    message = '',
    turnstileToken = '',
    honeypot = '',
    inAppBrowser = false,
  } = body;

  if (honeypot) {
    return res.status(400).json({ success: false, message: 'Blocked' });
  }

  const nameStr = String(name).trim();
  const emailStr = String(email).trim();
  if (!nameStr || !emailStr) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileToken && !inAppBrowser) {
    const ok = await verifyTurnstile(turnstileToken, turnstileSecret);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Security check failed. Please try again.' });
    }
  }

  const from = process.env.EMAIL_FROM || 'OlaJesu <onboarding@resend.dev>';
  const lines = [
    'New catering enquiry (olajesu.com)',
    '',
    `Name: ${nameStr}`,
    `Email: ${emailStr}`,
  ];
  if (phone) lines.push(`Phone: ${phone}`);
  if (eventType) lines.push(`Event: ${eventType}`);
  if (guests) lines.push(`Guests: ${guests}`);
  if (eventDate) lines.push(`Date: ${eventDate}`);
  if (message) lines.push('', 'Details:', String(message));

  const text = lines.join('\n');

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
        reply_to: emailStr,
        subject: `Catering enquiry from ${nameStr}`,
        text,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: data?.message || 'Failed to send email. Check Resend domain and from-address.',
      });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    console.error('catering-enquiry', e);
    return res.status(500).json({ success: false, message: 'Server error sending email' });
  }
}
