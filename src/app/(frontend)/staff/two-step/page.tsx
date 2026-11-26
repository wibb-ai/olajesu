import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { TwoStep } from '../../../../components/kitchen/TwoStep';
import { display } from '../../../../components/shop/fonts';
import s from '../../../../components/shop/shop.module.css';
import { safeNext, signedInUser } from '../../../../lib/twoStepServer';

export const metadata: Metadata = { title: 'Two-step login | OlaJesu', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string }> };

/** After the password: Master admins set up or enter their two-step code; Kitchen staff pass straight on. */
export default async function TwoStepPage({ searchParams }: Props) {
  await connection();
  const next = safeNext((await searchParams).next);
  const { user, passed } = await signedInUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'master-admin') redirect(`/api/staff/two-step/pass?next=${encodeURIComponent(next)}`);
  if (passed) redirect(next);

  return (
    <div className={`${s.page} ${display.variable}`}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerInner}`}>
          <img src="/olajesu_logo.png" alt="OlaJesu" className={s.logo} />
          <span className={s.subtle}>{user.email}</span>
        </div>
      </header>
      <main className={s.container} style={{ maxWidth: 460, paddingTop: 32 }}>
        <TwoStep mode={user.twoStepEnabledAt ? 'verify' : 'setup'} next={next} />
      </main>
    </div>
  );
}
