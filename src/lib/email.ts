/**
 * Sends email through Resend's API (the same service as the catering form).
 * Env: RESEND_API_KEY; ORDERS_EMAIL_FROM (e.g. "OlaJesu <orders@olajesu.com>" once olajesu.com
 * is verified in Resend), falling back to EMAIL_FROM.
 *
 * Until the domain is verified, Resend only delivers to the account owner's own address, so
 * sends to Customers fail. Failures are logged and returned, never thrown: an email problem
 * must not undo a payment.
 */
export type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Stops Resend sending the same email twice if we retry (kept by Resend for 24 hours). */
  idempotencyKey?: string;
};

export async function sendEmail(email: Email): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`email: RESEND_API_KEY not set; not sending "${email.subject}"`);
    return { sent: false, error: 'not configured' };
  }
  const from = process.env.ORDERS_EMAIL_FROM || process.env.EMAIL_FROM || 'OlaJesu <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(email.idempotencyKey ? { 'Idempotency-Key': email.idempotencyKey } : {}),
      },
      body: JSON.stringify({ from, to: email.to, subject: email.subject, html: email.html, text: email.text, reply_to: email.replyTo }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`email: Resend refused "${email.subject}" (${res.status}) ${body.slice(0, 300)}`);
      return { sent: false, error: `resend ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error(`email: could not reach Resend for "${email.subject}"`, err);
    return { sent: false, error: 'network' };
  }
}

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The branded email shell: logo, cream and green, one column that reads well on a phone.
 * Table-based and inline-styled, because email apps ignore most CSS.
 */
export function emailLayout({ preheader, body, footer }: { preheader: string; body: string; footer: string }) {
  const site = process.env.NEXT_PUBLIC_SERVER_URL || 'https://olajesu.com';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OlaJesu</title></head>
<body style="margin:0;padding:0;background:#F7F2E8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2E8;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;font-family:Helvetica,Arial,sans-serif;color:#1A1A1A;">
<tr><td style="padding:20px 24px;border-bottom:1px solid #DDD6C4;"><img src="${site}/olajesu_logo.png" alt="OlaJesu" height="44" style="display:block;height:44px;"></td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55;">${body}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #DDD6C4;font-size:12px;line-height:1.6;color:#6B6355;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

export const h1 = (s: string) => `<h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;color:#1B4332;">${escapeHtml(s)}</h1>`;
export const p = (html: string) => `<p style="margin:0 0 14px;">${html}</p>`;
export const muted = (html: string) => `<span style="color:#6B6355;font-size:13px;">${html}</span>`;
