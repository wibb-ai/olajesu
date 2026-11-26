'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import s from '../shop/shop.module.css';

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
  if (!res) return 'No connection. Try again.';
  if (res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? 'Something went wrong.';
}

/** A big tick box for the packing list. */
export function PackToggle({ orderId, packed }: { orderId: number; packed: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(packed);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        className={on ? s.chipOn : s.chip}
        style={{ minWidth: 120, fontSize: 15, padding: '12px 16px' }}
        aria-pressed={on}
        onClick={async () => {
          const next = !on;
          setOn(next);
          const err = await post(`/api/kitchen/orders/${orderId}`, { action: next ? 'packed' : 'unpacked' });
          if (err) {
            setOn(!next);
            setError(err);
          } else router.refresh();
        }}
      >
        {on ? '✓ Packed' : 'Mark packed'}
      </button>
      {error && <div className={s.calloutWarn}>{error}</div>}
    </>
  );
}

/** "Out for delivery" (emails the Customer) and "Delivered". */
export function DeliveryButtons({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const act = async (action: 'out-for-delivery' | 'delivered') => {
    setBusy(true);
    setError(null);
    const err = await post(`/api/kitchen/orders/${orderId}`, { action });
    setBusy(false);
    if (err) setError(err);
    else router.refresh();
  };
  if (status === 'delivered') return <span className={s.tag} style={{ background: '#e3efe7', color: 'var(--green)', fontSize: 13 }}>✓ Delivered</span>;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {status !== 'out-for-delivery' && (
        <button className={s.smallPillLight} disabled={busy} onClick={() => act('out-for-delivery')} style={{ fontSize: 12, padding: '12px 14px' }}>
          Out for delivery
        </button>
      )}
      <button className={s.smallPill} disabled={busy} onClick={() => act('delivered')} style={{ fontSize: 12, padding: '12px 16px' }}>
        Delivered
      </button>
      {error && <div className={s.calloutWarn} style={{ width: '100%' }}>{error}</div>}
    </div>
  );
}

export function StartCooking({ date, paid }: { date: string; paid: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!paid) return null;
  return (
    <button
      className={s.pillDark}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await post('/api/kitchen/start-cooking', { date });
        router.refresh();
        setBusy(false);
      }}
    >
      {busy ? 'Updating…' : `Start cooking · ${paid} new Order${paid === 1 ? '' : 's'}`}
    </button>
  );
}

/** Sign-in for Kitchen and Driver staff, straight into the screens. Uses Payload's own login. */
export function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className={s.form}
      onSubmit={async e => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).catch(() => null);
        setBusy(false);
        if (res?.ok) return router.replace('/kitchen');
        const data = (await res?.json().catch(() => ({}))) as { errors?: { message?: string }[] } | undefined;
        setError(data?.errors?.[0]?.message ?? 'That email or password didn’t work.');
      }}
    >
      <label className={s.field}>
        <span>Email</span>
        <input className={s.input} type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label className={s.field}>
        <span>Password</span>
        <input className={s.input} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      {error && (
        <div className={s.calloutWarn} role="alert">
          {error}
        </div>
      )}
      <button className={s.pillDark} disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
