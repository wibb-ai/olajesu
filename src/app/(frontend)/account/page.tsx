import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import config from '@payload-config';
import { getPayload } from 'payload';

import { AccountView, SignIn, type AccountOrder } from '../../../components/shop/AccountView';
import { ShopShell } from '../../../components/shop/ShopShell';
import s from '../../../components/shop/shop.module.css';
import { currentCustomer, ordersFor, summary } from '../../../lib/account';
import { getMenu } from '../../../lib/menu';
import { longDate } from '../../../lib/orderEmails';
import type { OrderItem } from '../../../lib/orders';
import { basketFromOrder } from '../../../lib/reorder';
import { shopEnabled } from '../../../lib/shop';

export const metadata: Metadata = { title: 'Your Account | OlaJesu', robots: { index: false, follow: false } };

const STATUS: Record<string, string> = {
  paid: 'Paid',
  preparing: 'Being cooked',
  ready: 'Ready to collect',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  'partly-refunded': 'Partly refunded',
  refunded: 'Refunded',
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

/** The Account page (Accounts ticket): saved details, Order history and reorder, email, deletion. */
export default async function AccountPage({ searchParams }: Props) {
  await connection();
  if (!shopEnabled()) notFound();
  const [params, payload, menu] = await Promise.all([searchParams, getPayload({ config }), getMenu()]);
  const customer = await currentCustomer(payload);

  const flash =
    params.error === 'link'
      ? { tone: 'warn' as const, text: 'That link has expired or has already been used. Ask for a new one below.' }
      : params.error === 'email-taken'
        ? { tone: 'warn' as const, text: 'That email is already used by another Account, so we kept your old one.' }
        : params.saved
          ? { tone: 'ok' as const, text: 'Your details are saved. Next time, checkout fills them in for you.' }
          : params.email === 'changed'
            ? { tone: 'ok' as const, text: 'Your email is updated. You’re signed out on your other devices.' }
            : null;

  if (!customer) {
    return (
      <ShopShell menu={menu}>
        <div className={s.container} style={{ maxWidth: 560, paddingTop: 36 }}>
          <SignIn flash={flash} />
        </div>
      </ShopShell>
    );
  }

  const orders: AccountOrder[] = (await ordersFor(payload, customer)).map(o => ({
    id: o.id,
    number: o.number,
    placed: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' }),
    delivery: longDate(o.deliveryDate),
    total: o.total,
    status: STATUS[o.status] ?? o.status,
    summary: o.summary ?? '',
    reorder: basketFromOrder((o.items ?? []) as OrderItem[]),
  }));

  return (
    <ShopShell menu={menu} account={summary(customer)}>
      <div className={s.container} style={{ maxWidth: 720, paddingTop: 28 }}>
        <AccountView
          flash={flash}
          customer={{
            email: customer.email,
            name: customer.name ?? '',
            phone: customer.phone ?? '',
            addressLine1: customer.addressLine1 ?? '',
            addressLine2: customer.addressLine2 ?? '',
            city: customer.city ?? '',
            postcode: customer.postcode ?? '',
            deliveryNotes: customer.deliveryNotes ?? '',
            marketingConsent: !!customer.marketingConsent,
          }}
          orders={orders}
        />
      </div>
    </ShopShell>
  );
}
