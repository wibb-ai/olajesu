import { businessConfig } from '../config/businessConfig';
import { LINK_MINUTES, type LinkPurpose } from './account';
import { C, card, emailLayout, escapeHtml as e, para, sendEmail, site } from './email';

/** Login link and Account emails (Accounts ticket), in the same A4 style as the Order emails. */

const COPY: Record<LinkPurpose, { subject: string; strip: string; line1: string; line2: string; text: string; button: string }> = {
  login: {
    subject: 'Your OlaJesu sign-in link',
    strip: 'Sign in',
    line1: 'Welcome back.',
    line2: "Here's your link.",
    text: `Tap the button to sign in to your OlaJesu Account. It works once and expires in ${LINK_MINUTES} minutes.`,
    button: 'Sign in',
  },
  'save-details': {
    subject: 'Save your details for next time',
    strip: 'Save your details',
    line1: 'Nearly done.',
    line2: 'Save your details.',
    text: `Tap the button to save your details from your Order, so next time checkout takes seconds. No password needed, ever. The link works once and expires in ${LINK_MINUTES} minutes.`,
    button: 'Save my details',
  },
  'change-email': {
    subject: 'Confirm your new email address',
    strip: 'Change email',
    line1: 'One quick check.',
    line2: 'Is this your new email?',
    text: `Tap the button to use this address for your OlaJesu Account. Your past Orders stay with your Account. The link works once and expires in ${LINK_MINUTES} minutes.`,
    button: 'Confirm this email',
  },
  delete: {
    subject: 'Confirm you want to delete your OlaJesu Account',
    strip: 'Delete Account',
    line1: 'Sorry to see you go.',
    line2: 'Delete your Account?',
    text: `Tap the button to delete your saved details and sign out everywhere. Your past Orders are kept as sales records, as the law requires. The link works once and expires in ${LINK_MINUTES} minutes.`,
    button: 'Delete my Account',
  },
};

const footer = () => {
  const { business, contact } = businessConfig;
  return `Didn’t ask for this? You can ignore this email: nothing changes.<br><br><b style="color:${C.ink};">${e(business.name)}</b> · ${e(contact.address.full)}<br><a href="mailto:${e(contact.email)}" style="color:${C.muted};">${e(contact.email)}</a>`;
};

export function linkEmail(purpose: LinkPurpose, token: string) {
  const c = COPY[purpose];
  const href = `${site()}/account/verify?token=${encodeURIComponent(token)}`;
  const html = emailLayout({
    preheader: c.text,
    strip: { title: c.strip, sub: `Expires in ${LINK_MINUTES} minutes` },
    hero: { label: 'OlaJesu Account', line1: c.line1, line2: c.line2, text: e(c.text), button: { label: c.button, href } },
    sections: card(para(`Button not working? Copy this link into your browser:<br><a href="${e(href)}" style="color:${C.green};word-break:break-all;font-size:13px;">${e(href)}</a>`, { size: 13, margin: '0 0 12px' })),
    footer: footer(),
    signOff: purpose !== 'delete',
  });
  const text = `${c.line1} ${c.line2}\n\n${c.text}\n\n${c.button}: ${href}\n\nDidn't ask for this? You can ignore this email: nothing changes.\n\n${businessConfig.business.name} · ${businessConfig.contact.address.full}`;
  return { subject: c.subject, html, text };
}

export async function sendLinkEmail(to: string, purpose: LinkPurpose, token: string) {
  return sendEmail({ to, ...linkEmail(purpose, token) });
}

/** Sent a month before an unused Account is deleted (3 years without signing in or ordering). */
export function inactivityEmail(deleteOn: string) {
  const day = new Date(deleteOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
  const text = `You haven't signed in or ordered for nearly three years, so we'll delete your saved details on ${day}. Sign in before then to keep your Account. Your past Orders are kept as sales records either way.`;
  const html = emailLayout({
    preheader: `Your OlaJesu Account closes on ${day}`,
    strip: { title: 'Your Account', sub: `Closes ${day}` },
    hero: { label: 'OlaJesu Account', line1: "We've missed you.", line2: 'Your Account closes soon.', text: e(text), button: { label: 'Keep my Account', href: `${site()}/account` } },
    sections: '',
    footer: footer(),
  });
  return { subject: `Your OlaJesu Account closes on ${day}`, html, text: `We've missed you. Your Account closes soon.\n\n${text}\n\nKeep my Account: ${site()}/account` };
}
