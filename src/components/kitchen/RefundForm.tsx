'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import s from '../shop/shop.module.css';

type Unit = { key: string; label: string; amount: number; refunded: boolean };
const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;
const REASONS = ['Missing Meal', 'Wrong Meal', 'Damaged or leaking', 'Arrived warm', 'Went off before its use-by date', 'Missed delivery (our fault)', 'Goodwill'];

/** Choose Meals and a reason, then refund; or cancel the whole Order for the kitchen. */
export function RefundForm({ orderId, units, left, hasPayment }: { orderId: number; units: Unit[]; left: number; hasPayment: boolean }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const total = Math.min(units.filter(u => chosen.has(u.key)).reduce((s, u) => s + u.amount, 0), left);

  async function send(body: object) {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/kitchen/orders/${orderId}/refund`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { amount?: number; error?: string } | undefined;
    setBusy(false);
    if (res?.ok) {
      setMessage({ ok: true, text: `Refunded ${gbp(data?.amount ?? 0)}. The Customer has been emailed.` });
      setChosen(new Set());
      setConfirmCancel(false);
      router.refresh();
    } else setMessage({ ok: false, text: data?.error ?? 'No connection. Try again.' });
  }

  if (!hasPayment) return <div className={s.calloutWarn}>There’s no card payment recorded on this Order, so it can’t be refunded here.</div>;

  return (
    <>
      {message && (
        <div className={message.ok ? s.calloutGreen : s.calloutWarn} role="status">
          {message.text}
        </div>
      )}

      <section className={s.panel}>
        <h2 className={s.panelTitle}>Refund Meals</h2>
        <p className={s.subtle}>For a problem the kitchen is responsible for: tick the Meals affected. Each refund includes that Meal’s Add-ons.</p>
        {units.map(u => (
          <label key={u.key} className={s.row} style={{ alignItems: 'center', cursor: u.refunded ? 'default' : 'pointer', opacity: u.refunded ? 0.5 : 1 }}>
            <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="checkbox"
                disabled={u.refunded}
                checked={chosen.has(u.key)}
                onChange={e => setChosen(c => {
                  const next = new Set(c);
                  if (e.target.checked) next.add(u.key);
                  else next.delete(u.key);
                  return next;
                })}
                style={{ width: 20, height: 20 }}
              />
              {u.label}
            </span>
            <span>{u.refunded ? 'Refunded' : gbp(u.amount)}</span>
          </label>
        ))}
        <div className={s.chips} style={{ margin: '14px 0 8px' }}>
          {REASONS.map(r => (
            <button key={r} type="button" className={reason === r ? s.chipOn : s.chip} onClick={() => setReason(r)}>
              {r}
            </button>
          ))}
        </div>
        <input className={s.input} placeholder="Reason (shown in the Activity log)" value={reason} maxLength={200} onChange={e => setReason(e.target.value)} />
        <button
          className={s.pillDark}
          style={{ marginTop: 12 }}
          disabled={busy || !chosen.size || !reason.trim()}
          onClick={() => send({ kind: 'refund', unitKeys: [...chosen], reason })}
        >
          {busy ? 'Refunding…' : chosen.size ? `Refund ${gbp(total)} to the card` : 'Tick the Meals to refund'}
        </button>
      </section>

      <section className={s.panel} style={{ borderColor: '#e7b9a0' }}>
        <h2 className={s.panelTitle}>Kitchen can’t deliver this Order</h2>
        <p className={s.subtle}>
          Cancels the Order and refunds everything left ({gbp(left)}). The Customer gets an apology email offering the next delivery day.
        </p>
        <input className={s.input} placeholder="What happened, e.g. “The kitchen is closed for illness.”" value={cancelReason} maxLength={200} onChange={e => setCancelReason(e.target.value)} />
        {confirmCancel ? (
          <div className={s.calloutActions}>
            <button className={s.smallPill} disabled={busy} onClick={() => send({ kind: 'kitchen-cancel', reason: cancelReason })}>
              {busy ? 'Cancelling…' : `Yes, cancel and refund ${gbp(left)}`}
            </button>
            <button className={s.linkBtn} onClick={() => setConfirmCancel(false)}>
              Keep the Order
            </button>
          </div>
        ) : (
          <button className={s.pill} style={{ marginTop: 12 }} disabled={!cancelReason.trim()} onClick={() => setConfirmCancel(true)}>
            Cancel for the kitchen
          </button>
        )}
      </section>
    </>
  );
}
