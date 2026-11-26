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
    // Local development only: print the plain-text email so links can be followed, and treat it as sent.
    if (process.env.NODE_ENV === 'development') {
      console.info(`email (dev, not sent) to ${String(email.to)}:\n${email.text}`);
      return { sent: true };
    }
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
const e = escapeHtml;

/*
 * Email pieces in the shop's A4 "Bold landing" style: cream page, a dark strip like the
 * countdown, heavy two-tone headlines, orange eyebrow labels, rounded white cards, green pill
 * buttons and a dark panel like "What's in every pot".
 *
 * Email apps ignore most CSS, so everything is tables and inline styles. Plus Jakarta Sans
 * loads where the app allows web fonts (Apple Mail, iOS); elsewhere it falls back to Helvetica.
 */
export const C = {
  ink: '#1A1A1A',
  cream: '#F7F2E8',
  blush: '#FBF3EC',
  card: '#EDE6D3',
  border: '#DDD6C4',
  green: '#1B4332',
  muted: '#6B6355',
  jollof: '#C2652A',
  amber: '#F4A261',
  white: '#FFFFFF',
};
const FONT = `'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;

/** The site's address for links in emails: the preview's own URL on Vercel previews, so links work there. */
export const site = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL;
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  if (process.env.NODE_ENV === 'development') return `http://localhost:${process.env.PORT ?? 3000}`;
  return 'https://olajesu.com';
};

/** Small uppercase orange label above a section, as on the site. */
export const eyebrow = (s: string, color = C.jollof) =>
  `<div style="font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${color};margin:0 0 6px;">${e(s)}</div>`;

/** Section heading, heavy and uppercase, as on the site. */
export const heading = (s: string, color = C.ink) =>
  `<div style="font-family:${FONT};font-size:20px;line-height:1.15;font-weight:800;letter-spacing:-0.3px;text-transform:uppercase;color:${color};margin:0 0 12px;">${e(s)}</div>`;

export const para = (html: string, opts: { size?: number; color?: string; margin?: string } = {}) =>
  `<p style="font-family:${FONT};font-size:${opts.size ?? 15}px;line-height:1.6;color:${opts.color ?? C.ink};margin:${opts.margin ?? '0 0 14px'};">${html}</p>`;

export const muted = (html: string) => `<span style="color:${C.muted};font-size:13px;">${html}</span>`;

/** Green pill button that works in every email app (a table cell, not CSS). */
export const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;"><tr><td style="background:${C.green};border-radius:999px;">
<a href="${e(href)}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:13px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;color:${C.white};text-decoration:none;border-radius:999px;">${e(label)} &rarr;</a></td></tr></table>`;

/** Rounded white card with an optional eyebrow and heading. */
export const card = (html: string, opts: { eyebrow?: string; heading?: string; background?: string; border?: boolean } = {}) =>
  `<tr><td style="padding:0 16px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${opts.background ?? C.white};border-radius:18px;${opts.border === false ? '' : `border:1px solid ${C.border};`}"><tr><td style="padding:20px 20px 8px;">
${opts.eyebrow ? eyebrow(opts.eyebrow) : ''}${opts.heading ? heading(opts.heading) : ''}${html}</td></tr></table></td></tr>`;

/** The dark "What's in every pot" panel: a big amber figure beside a line of text. */
export const darkPanel = (label: string, title: string, rows: [string, string, string][]) =>
  `<tr><td style="padding:0 16px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink};border-radius:20px;"><tr><td style="padding:22px 20px 10px;">
${eyebrow(label, C.amber)}${heading(title, C.white)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
    .map(
      ([big, t, text], i) =>
        `<tr><td valign="top" style="padding:12px 12px 12px 0;${i ? 'border-top:1px solid #333333;' : ''}width:84px;font-family:${FONT};font-size:19px;font-weight:800;color:${C.amber};">${e(big)}</td><td valign="top" style="padding:12px 0;${i ? 'border-top:1px solid #333333;' : ''}font-family:${FONT};"><div style="font-size:14px;font-weight:800;color:${C.white};">${e(t)}</div><div style="font-size:13px;line-height:1.5;color:#BDB6A8;">${text}</div></td></tr>`,
    )
    .join('')}</table></td></tr></table></td></tr>`;

/** A row in a money table: label on the left, amount on the right. */
export const moneyRow = (label: string, amount: string, opts: { bold?: boolean; color?: string; sub?: string; last?: boolean } = {}) =>
  `<tr><td style="padding:10px 0;${opts.last ? '' : `border-bottom:1px solid ${C.card};`}font-family:${FONT};font-size:14px;color:${opts.color ?? C.ink};${opts.bold ? 'font-weight:800;font-size:16px;' : 'font-weight:600;'}">${label}${opts.sub ? `<div style="font-weight:500;font-size:12px;line-height:1.5;color:${C.muted};margin-top:2px;">${opts.sub}</div>` : ''}</td><td align="right" valign="top" style="padding:10px 0 10px 12px;${opts.last ? '' : `border-bottom:1px solid ${C.card};`}font-family:${FONT};font-size:14px;white-space:nowrap;color:${opts.color ?? C.ink};${opts.bold ? 'font-weight:800;font-size:16px;' : 'font-weight:700;'}">${amount}</td></tr>`;

export const table = (rows: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">${rows}</table>`;

export type Hero = {
  /** The little pill above the headline, e.g. "Order OJ-ABC123". */
  label: string;
  /** Headline in two tones: first line ink, second line green. */
  line1: string;
  line2: string;
  text?: string;
  button?: { label: string; href: string };
};

/**
 * The full email: dark strip, logo, a blush hero with a two-tone headline, the content
 * cards, the "flavour of home" sign-off and the business footer.
 */
export function emailLayout({
  preheader,
  strip,
  hero,
  sections,
  footer,
  signOff = true,
}: {
  preheader: string;
  strip: { title: string; sub?: string };
  hero: Hero;
  /** Rows made with card(), darkPanel() or raw <tr> rows. */
  sections: string;
  footer: string;
  signOff?: boolean;
}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>OlaJesu</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(preheader)}&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};"><tr><td align="center" style="padding:0 0 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

<tr><td align="center" style="background:${C.ink};padding:14px 16px 13px;font-family:${FONT};">
<div style="font-size:14px;font-weight:800;letter-spacing:0.6px;color:${C.white};text-transform:uppercase;">${e(strip.title)}</div>
${strip.sub ? `<div style="font-size:11px;font-weight:700;letter-spacing:0.4px;color:${C.amber};text-transform:uppercase;margin-top:3px;">${e(strip.sub)}</div>` : ''}
</td></tr>

<tr><td align="center" style="background:${C.white};padding:12px 16px;border-bottom:1px solid ${C.border};">
<a href="${site()}"><img src="${site()}/olajesu_logo.png" alt="OlaJesu" height="48" style="display:block;height:48px;border:0;"></a></td></tr>

<tr><td align="center" style="background:${C.blush};padding:30px 22px 28px;">
<span style="display:inline-block;font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${C.jollof};background:${C.white};border:1px solid #E8C3A8;border-radius:999px;padding:6px 12px;">&#9679; ${e(hero.label)}</span>
<div style="font-family:${FONT};font-size:28px;line-height:1.12;font-weight:800;letter-spacing:-0.7px;color:${C.ink};margin:16px 0 0;">${e(hero.line1)}</div>
<div style="font-family:${FONT};font-size:28px;line-height:1.12;font-weight:800;letter-spacing:-0.7px;color:${C.green};margin:0 0 ${hero.text ? 12 : 4}px;">${e(hero.line2)}</div>
${hero.text ? para(hero.text, { color: C.muted, margin: '0 auto 6px' }) : ''}
${hero.button ? `<div align="center">${button(hero.button.label, hero.button.href)}</div>` : ''}
</td></tr>

<tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
${sections}

${
  signOff
    ? `<tr><td align="center" style="padding:10px 24px 18px;"><div style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:${C.green};">&ldquo;Food that carries the flavour of home.&rdquo;</div>
<div style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.muted};margin-top:6px;">The OlaJesu kitchen, Manchester</div></td></tr>`
    : ''
}

<tr><td align="center" style="padding:16px 24px 0;border-top:1px solid ${C.border};font-family:${FONT};font-size:12px;line-height:1.7;color:${C.muted};">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}
