'use client';

import { useState, type FormEvent } from 'react';

import type { Basket } from '../../lib/basket';
import { useShop } from './basketStore';
import s from './shop.module.css';

type Flash = { tone: 'ok' | 'warn'; text: string } | null;

export type AccountOrder = {
  id: number;
  number: string;
  placed: string;
  delivery: string;
  total: number;
  status: string;
  summary: string;
  reorder: Basket | null;
};

type Details = {
  email: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  deliveryNotes: string;
  marketingConsent: boolean;
};

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;

async function post(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? 'Something went wrong. Please try again.' };
  } catch {
    return { ok: false, error: 'We couldn’t reach the kitchen. Check your connection and try again.' };
  }
}

function FlashBox({ flash }: { flash: Flash }) {
  if (!flash) return null;
  return (
    <div className={flash.tone === 'ok' ? s.calloutGreen : s.calloutWarn} role="status">
      {flash.text}
    </div>
  );
}

/** "Sign in": email in, Login link out. The reply never says whether an Account exists. */
export function SignIn({ flash }: { flash: Flash }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    setError(null);
    const r = await post('/api/account/login', { email });
    if (r.ok) setState('sent');
    else {
      setError(r.error ?? null);
      setState('idle');
    }
  }

  return (
    <>
      <div className={s.eyebrow}>Your Account</div>
      <h1 className={s.h2}>
        Sign in with <span className={s.accent}>your email.</span>
      </h1>
      <p className={s.body}>No password to remember. We’ll email you a link that signs you in, and you’ll stay signed in on this device for 30 days.</p>
      <FlashBox flash={flash} />
      {state === 'sent' ? (
        <div className={s.calloutGreen} role="status">
          If that email can be used, we’ve sent a link to it. It works once and expires in 15 minutes. Can’t see it? Check your spam folder.
        </div>
      ) : (
        <form onSubmit={submit} className={s.form}>
          <label className={s.field}>
            <span>Email address</span>
            <input className={s.input} type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          {error && (
            <div className={s.calloutWarn} role="alert">
              {error}
            </div>
          )}
          <button className={s.pillDark} disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>
      )}
      <p className={s.subtle} style={{ marginTop: 18 }}>
        No Account yet? The link creates one, filled in from your last Order if you’ve ordered before. An Account is never needed to order.
      </p>
    </>
  );
}

export function AccountView({ flash, customer, orders }: { flash: Flash; customer: Details; orders: AccountOrder[] }) {
  const first = customer.name.split(/\s+/)[0];
  return (
    <>
      <div className={s.eyebrow}>Your Account</div>
      <h1 className={s.h2}>
        {first ? `Hello, ${first}.` : 'Hello.'} <span className={s.accent}>Good to see you.</span>
      </h1>
      <p className={s.subtle} style={{ margin: '0 0 14px' }}>
        Signed in as {customer.email}
      </p>
      <FlashBox flash={flash} />
      <OrdersCard orders={orders} />
      <DetailsCard customer={customer} />
      <EmailCard current={customer.email} />
      <DataCard />
      <form method="post" action="/api/account/logout" style={{ margin: '18px 0 8px' }}>
        <button className={s.pill}>Sign out</button>
      </form>
    </>
  );
}

function OrdersCard({ orders }: { orders: AccountOrder[] }) {
  const shop = useShop();
  return (
    <section className={s.panel}>
      <div className={s.eyebrow}>Your Orders</div>
      <h2 className={s.panelTitle}>Order history</h2>
      {!orders.length && <p className={s.body}>No Orders yet. Every Order placed with this email shows here.</p>}
      {orders.map(o => (
        <div key={o.id} className={s.rowCol}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <b>{o.number}</b>
            <b>{gbp(o.total)}</b>
          </div>
          <div className={s.subtle}>
            Placed {o.placed} · for {o.delivery} · {o.status}
          </div>
          <div className={s.subtle} style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
            {o.summary}
          </div>
          {o.reorder && (
            <button className={s.smallPill} style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={() => shop.addToBasket(o.reorder!)}>
              Reorder
            </button>
          )}
        </div>
      ))}
      {orders.some(o => o.reorder) && <p className={s.subtle}>Reorder adds the Meals to your basket at today’s prices. Anything no longer on the menu is left out, and we’ll tell you.</p>}
    </section>
  );
}

function DetailsCard({ customer }: { customer: Details }) {
  const [form, setForm] = useState(customer);
  const [state, setState] = useState<{ saving: boolean; message: Flash }>({ saving: false, message: null });
  const set = (k: keyof Details) => (e: { target: { value: string; checked?: boolean } }) =>
    setForm(f => ({ ...f, [k]: k === 'marketingConsent' ? !!e.target.checked : e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState({ saving: true, message: null });
    const { email: _email, ...details } = form;
    void _email;
    const r = await post('/api/account/details', details);
    setState({ saving: false, message: r.ok ? { tone: 'ok', text: 'Saved.' } : { tone: 'warn', text: r.error ?? 'Something went wrong.' } });
  }

  const field = (k: keyof Details, label: string, props: Record<string, unknown> = {}) => (
    <label className={s.field}>
      <span>{label}</span>
      <input className={s.input} value={form[k] as string} onChange={set(k)} {...props} />
    </label>
  );

  return (
    <section className={s.panel}>
      <div className={s.eyebrow}>Saved details</div>
      <h2 className={s.panelTitle}>For a faster checkout</h2>
      <form onSubmit={submit} className={s.form}>
        {field('name', 'Name', { autoComplete: 'name', maxLength: 100 })}
        {field('phone', 'Phone', { autoComplete: 'tel', type: 'tel', maxLength: 30 })}
        {field('addressLine1', 'Address line 1', { autoComplete: 'address-line1', maxLength: 120 })}
        {field('addressLine2', 'Address line 2 (optional)', { autoComplete: 'address-line2', maxLength: 120 })}
        <div className={s.fieldRow}>
          {field('city', 'Town or city', { autoComplete: 'address-level2', maxLength: 60 })}
          {field('postcode', 'Postcode', { autoComplete: 'postal-code', maxLength: 10 })}
        </div>
        <label className={s.field}>
          <span>Delivery notes (optional)</span>
          <textarea className={s.input} rows={2} maxLength={300} value={form.deliveryNotes} onChange={set('deliveryNotes')} placeholder="e.g. Leave with the neighbour at number 14" />
        </label>
        <label className={s.subtle} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.marketingConsent} onChange={set('marketingConsent')} style={{ marginTop: 3 }} />
          <span>Email me about new Meals and offers. Optional; you can stop any time.</span>
        </label>
        <FlashBox flash={state.message} />
        <button className={s.pillDark} disabled={state.saving} style={{ alignSelf: 'flex-start' }}>
          {state.saving ? 'Saving…' : 'Save details'}
        </button>
      </form>
    </section>
  );
}

function EmailCard({ current }: { current: string }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<Flash>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = await post('/api/account/email', { email });
    setMessage(r.ok ? { tone: 'ok', text: `Check ${email}: tap the link we’ve sent to switch your Account to it. Until then, nothing changes.` } : { tone: 'warn', text: r.error ?? 'Something went wrong.' });
  }
  return (
    <section className={s.panel}>
      <div className={s.eyebrow}>Email</div>
      <h2 className={s.panelTitle}>Change your email</h2>
      <p className={s.subtle}>Now: {current}. Your Orders stay with your Account.</p>
      <form onSubmit={submit} className={s.form}>
        <label className={s.field}>
          <span>New email address</span>
          <input className={s.input} type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <FlashBox flash={message} />
        <button className={s.pill} style={{ alignSelf: 'flex-start' }}>
          Send a link to confirm
        </button>
      </form>
    </section>
  );
}

function DataCard() {
  const [message, setMessage] = useState<Flash>(null);
  const [confirming, setConfirming] = useState(false);
  async function remove() {
    const r = await post('/api/account/delete', {});
    setMessage(r.ok ? { tone: 'ok', text: 'Check your email and tap the link to confirm. Until then, nothing is deleted.' } : { tone: 'warn', text: r.error ?? 'Something went wrong.' });
    setConfirming(false);
  }
  return (
    <section className={s.panel}>
      <div className={s.eyebrow}>Your data</div>
      <h2 className={s.panelTitle}>Privacy</h2>
      <p className={s.subtle}>
        Want a copy of the data we hold about you? Reply to any email from us and we’ll send it. Accounts not used for 3 years are deleted, after a warning email.
      </p>
      <FlashBox flash={message} />
      {confirming ? (
        <div className={s.calloutWarn}>
          This deletes your saved details and signs you out everywhere. Your past Orders are kept as sales records, as the law requires.
          <div className={s.calloutActions}>
            <button className={s.smallPill} onClick={remove}>
              Email me a link to confirm
            </button>
            <button className={s.linkBtn} onClick={() => setConfirming(false)}>
              Keep my Account
            </button>
          </div>
        </div>
      ) : (
        <button className={s.linkBtn} onClick={() => setConfirming(true)}>
          Delete my Account
        </button>
      )}
    </section>
  );
}
