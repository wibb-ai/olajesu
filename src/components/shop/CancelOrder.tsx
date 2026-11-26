'use client';

import { useState } from 'react';

import s from './shop.module.css';

const gbp = (n: number) => `£${n.toFixed(2).replace(/\.00$/, '')}`;

/** The confirm-and-cancel button on the Customer's cancel page. */
export function CancelOrder({ orderId, token, amount }: { orderId: number; token: string; amount: number }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setState('busy');
    setError(null);
    const res = await fetch('/api/shop/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, token }) }).catch(() => null);
    if (res?.ok) return setState('done');
    const data = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
    setError(data?.error ?? 'No connection. Please try again.');
    setState('idle');
  }

  if (state === 'done') {
    return (
      <div className={s.calloutGreen} role="status">
        Your Order is cancelled and {gbp(amount)} is on its way back to your card. We’ve emailed you to confirm. Refunds usually take 5 to 10 working days to show.
      </div>
    );
  }
  return (
    <>
      {error && (
        <div className={s.calloutWarn} role="alert">
          {error}
        </div>
      )}
      <button className={s.pillDark} onClick={cancel} disabled={state === 'busy'}>
        {state === 'busy' ? 'Cancelling…' : `Yes, cancel and refund ${gbp(amount)}`}
      </button>
    </>
  );
}
