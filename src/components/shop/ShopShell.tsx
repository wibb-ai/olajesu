'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { businessConfig, whatsappLink } from '../../config/businessConfig';
import type { AccountSummary } from '../../lib/account';
import type { ShopDelivery } from '../../lib/deliverySettings';
import { gbp, type Menu } from '../../lib/basket';
import { BasketSheet } from './BasketSheet';
import { ShopProvider, useShop } from './basketStore';
import { display } from './fonts';
import { MealSheet } from './MealSheet';
import { Countdown } from './parts';
import s from './shop.module.css';

const YEAR = new Date().getFullYear();

/** Everything around a shop page: countdown, header, footer, basket bar, and the Meal and basket sheets. */
export function ShopShell({ menu, account = null, delivery, children }: { menu: Menu; account?: AccountSummary; delivery: ShopDelivery; children: ReactNode }) {
  return (
    <ShopProvider menu={menu} account={account} delivery={delivery}>
      <div className={`${s.page} ${display.variable}`}>
        <Countdown />
        <Header />
        <main>{children}</main>
        <Footer />
        <BasketBar />
        <MealSheet />
        <BasketSheet />
        <Toast />
      </div>
    </ShopProvider>
  );
}

function Header() {
  const shop = useShop();
  return (
    <header className={s.header}>
      <div className={`${s.container} ${s.headerInner}`}>
        <Link href="/" aria-label="OlaJesu home">
          <img src="/olajesu_logo.png" alt="OlaJesu" className={s.logo} />
        </Link>
        <nav className={s.nav} aria-label="Main">
          <Link href="/#menu">Menu</Link>
          <Link href="/catering" className={s.navOptional}>
            Catering
          </Link>
          <Link href="/account">{shop.account ? 'Account' : 'Sign in'}</Link>
          <button className={s.basketBtn} onClick={() => shop.setBasketOpen(true)}>
            Basket{shop.priced.mealCount ? ` (${shop.priced.mealCount})` : ''}
          </button>
        </nav>
      </div>
    </header>
  );
}

function BasketBar() {
  const shop = useShop();
  if (!shop.priced.mealCount || shop.basketOpen || shop.sheet) return null;
  return (
    <div className={s.basketBar}>
      <button className={s.basketBarBtn} onClick={() => shop.setBasketOpen(true)}>
        <span>View basket · {shop.priced.mealCount}</span>
        <span>{gbp(shop.priced.total)}</span>
      </button>
    </div>
  );
}

function Toast() {
  const { toast } = useShop();
  if (!toast) return null;
  return (
    <div className={s.toast} role="status">
      ✓ {toast}
    </div>
  );
}

function Footer() {
  const { contact, social } = businessConfig;
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerGrid}>
          <div>
            <img src="/olajesu_logo.png" alt="OlaJesu" style={{ height: 56, display: 'block', marginBottom: 12 }} />
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              Nigerian home cooking from our Manchester kitchen.
              <br />
              {contact.address.full}
            </p>
          </div>
          <div className={s.footerLinks}>
            <b style={{ color: 'var(--ink)' }}>OlaJesu</b>
            <Link href="/#menu">Meal prep menu</Link>
            <Link href="/catering">Catering for events</Link>
          </div>
          <div className={s.footerLinks}>
            <b style={{ color: 'var(--ink)' }}>Contact</b>
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        </div>
        <div className={s.footerBase}>
          <span>© {YEAR} OlaJesu</span>
          <span>Business details, hygiene rating, Terms and Privacy to come before launch.</span>
        </div>
      </div>
    </footer>
  );
}
