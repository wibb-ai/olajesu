'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import type { Role } from '../../access/roles';
import { display } from '../shop/fonts';
import s from '../shop/shop.module.css';

const TABS = [
  { href: '/kitchen/cook', label: 'Cook', roles: ['master-admin', 'kitchen'] },
  { href: '/kitchen/pack', label: 'Pack', roles: ['master-admin', 'kitchen'] },
  { href: '/kitchen/deliver', label: 'Deliver', roles: ['master-admin', 'kitchen'] },
] as const;

/** The frame of the screens for the day: big tabs for a phone, the staff member's name, sign out. */
export function KitchenChrome({ role, name, children }: { role: Role | null; name?: string; children: ReactNode }) {
  const path = usePathname();
  return (
    <div className={`${s.page} ${display.variable}`} style={{ paddingBottom: 40 }}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerInner}`}>
          <Link href="/kitchen" aria-label="Kitchen home">
            <img src="/olajesu_logo.png" alt="OlaJesu" className={s.logo} />
          </Link>
          {role && (
            <nav className={s.nav} aria-label="Kitchen">
              {name && <span className={s.navOptional} style={{ fontWeight: 600, color: 'var(--muted)' }}>{name}</span>}
              <Link href="/admin">Dashboard</Link>
              <SignOut />
            </nav>
          )}
        </div>
        {role && (
          <div className={s.container} style={{ paddingBottom: 10 }}>
            <div className={s.toggle} style={{ margin: 0, maxWidth: 'none' }} role="tablist">
              {TABS.filter(t => (t.roles as readonly string[]).includes(role)).map(t => (
                <Link key={t.href} href={t.href} role="tab" aria-selected={path.startsWith(t.href)} className={path.startsWith(t.href) ? s.toggleOn : s.toggleBtn} style={{ textAlign: 'center', textDecoration: 'none' }}>
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className={s.container} style={{ maxWidth: 760, paddingTop: 18 }}>
        {children}
      </main>
    </div>
  );
}

function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={s.basketBtn}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/users/logout', { method: 'POST' }).catch(() => null);
        router.replace('/kitchen/login');
      }}
    >
      Sign out
    </button>
  );
}

/** Day picker: a row of delivery days that have Orders. */
export function DayPicker({ days, current, base }: { days: { value: string; label: string }[]; current: string; base: string }) {
  if (days.length < 2) return null;
  return (
    <div className={s.chips} style={{ margin: '0 0 14px' }}>
      {days.map(d => (
        <Link key={d.value} href={`${base}?date=${d.value}`} className={d.value === current ? s.chipOn : s.chip} style={{ textDecoration: 'none' }}>
          {d.label}
        </Link>
      ))}
    </div>
  );
}
