import config from '@payload-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { getPayload } from 'payload';

import { ShopShell } from '../../../../components/shop/ShopShell';
import s from '../../../../components/shop/shop.module.css';
import { peekLinkToken } from '../../../../lib/account';
import { getMenu } from '../../../../lib/menu';

// "same-origin": the token in this page's address is never sent to other sites, but our own
// form post still carries its Origin (no-referrer would make it "null" and fail the check).
export const metadata: Metadata = { title: 'Sign in | OlaJesu', robots: { index: false, follow: false }, referrer: 'same-origin' };

const BUTTON = { login: 'Sign in', 'save-details': 'Save my details', 'change-email': 'Use this email', delete: 'Delete my Account' } as const;
const TITLE = {
  login: ['One tap and', 'you’re in.'],
  'save-details': ['One tap to', 'save your details.'],
  'change-email': ['One tap to', 'confirm your email.'],
  delete: ['Delete your', 'Account?'],
} as const;

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where a Login link lands. Opening the link doesn't use it up (email apps open links to scan
 * them); pressing the button does, by posting to /api/account/verify.
 */
export default async function Verify({ searchParams }: Props) {
  await connection();
  const [{ token = '' }, payload, menu] = await Promise.all([searchParams, getPayload({ config }), getMenu()]);
  const row = await peekLinkToken(payload, token);

  return (
    <ShopShell menu={menu}>
      <div className={s.container} style={{ maxWidth: 520, paddingTop: 40, textAlign: 'center' }}>
        {row ? (
          <>
            <div className={s.eyebrow}>OlaJesu Account</div>
            <h1 className={s.h2}>
              {TITLE[row.purpose][0]} <span className={s.accent}>{TITLE[row.purpose][1]}</span>
            </h1>
            <p className={s.body}>{row.purpose === 'change-email' ? row.newEmail : row.email}</p>
            <form method="post" action="/api/account/verify" style={{ marginTop: 18 }}>
              <input type="hidden" name="token" value={token} />
              <button className={s.pillDark}>{BUTTON[row.purpose]} →</button>
            </form>
            {row.purpose === 'delete' && <p className={s.subtle} style={{ marginTop: 14 }}>Your past Orders are kept as sales records, as the law requires.</p>}
          </>
        ) : (
          <>
            <div className={s.eyebrow}>OlaJesu Account</div>
            <h1 className={s.h2}>
              This link has <span className={s.accent}>run out.</span>
            </h1>
            <p className={s.body}>Links work once and expire after 15 minutes. Ask for a new one and we’ll send it straight away.</p>
            <Link href="/account" className={s.pillDark} style={{ marginTop: 12 }}>
              Get a new link
            </Link>
          </>
        )}
      </div>
    </ShopShell>
  );
}
