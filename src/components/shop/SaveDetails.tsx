'use client';

import { useState } from 'react';

import s from './shop.module.css';

/** The one-tap Account offer on the confirmation page (Accounts ticket). Never required. */
export function SaveDetails({ orderId, token, email }: { orderId: number; token: string; email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'dismissed'>('idle');
  const [error, setError] = useState<string | null>(null);
  if (state === 'dismissed') return null;

  async function save() {
    setState('sending');
    setError(null);
    try {
      const res = await fetch('/api/account/save-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, token }) });
      if (res.ok) return setState('sent');
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'Something went wrong. Please try again.');
    } catch {
      setError('We couldn’t reach the kitchen. Please try again.');
    }
    setState('idle');
  }

  return (
    <div className={s.standard} style={{ marginTop: 24 }}>
      {state === 'sent' ? (
        <>
          <div className={s.eyebrow} style={{ color: 'var(--amber)' }}>
            Nearly done
          </div>
          <h2 className={`${s.h2} ${s.upper}`}>Check your email</h2>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>We’ve sent a link to {email}. Tap it to finish saving your details. It expires in 15 minutes.</p>
        </>
      ) : (
        <>
          <div className={s.eyebrow} style={{ color: 'var(--amber)' }}>
            Next time, in seconds
          </div>
          <h2 className={`${s.h2} ${s.upper}`}>Save your details</h2>
          <p style={{ margin: '0 0 16px', opacity: 0.8, lineHeight: 1.6 }}>
            Keep your address for a faster checkout, see your Orders and reorder in one tap. No password: we’ll email a link to {email}.
          </p>
          {error && (
            <div className={s.calloutWarn} role="alert">
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={s.pillWhite} onClick={save} disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Save my details'}
            </button>
            <button className={s.linkBtn} style={{ color: '#BDB6A8' }} onClick={() => setState('dismissed')}>
              No thanks
            </button>
          </div>
        </>
      )}
    </div>
  );
}
