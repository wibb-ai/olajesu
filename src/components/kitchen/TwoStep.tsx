'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import s from '../shop/shop.module.css';

type Setup = { qr: string; secret: string; url: string };

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
  if (!res) return { ok: false, error: 'No connection. Try again.' };
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return res.ok ? { ok: true, data } : { ok: false, error: data.error ?? 'Something went wrong.' };
}

/** Two-step login: set-up with a QR code the first time, then a 6-digit code at each sign-in. */
export function TwoStep({ mode, next }: { mode: 'setup' | 'verify'; next: string }) {
  return mode === 'setup' ? <SetUp next={next} /> : <Verify next={next} />;
}

function CodeInput({ value, onChange, backup }: { value: string; onChange: (v: string) => void; backup?: boolean }) {
  return (
    <label className={s.field}>
      <span>{backup ? 'Backup code' : '6-digit code'}</span>
      <input
        className={s.input}
        style={{ fontSize: 24, letterSpacing: backup ? 2 : 8, textAlign: 'center' }}
        inputMode={backup ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        maxLength={backup ? 12 : 6}
        autoFocus
        required
        value={value}
        onChange={e => onChange(backup ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
      />
    </label>
  );
}

function SetUp({ next }: { next: string }) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    post<Setup>('/api/staff/two-step/setup', {}).then(r => {
      if (!live) return;
      if (r.ok) setSetup(r.data);
      else setError(r.error);
    });
    return () => {
      live = false;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await post<{ backupCodes: string[] }>('/api/staff/two-step/enable', { code });
    setBusy(false);
    if (r.ok) setBackupCodes(r.data.backupCodes);
    else setError(r.error);
  }

  if (backupCodes) {
    return (
      <>
        <div className={s.eyebrow}>Two-step login is on</div>
        <h1 className={s.h2}>
          Save your <span className={s.accent}>backup codes.</span>
        </h1>
        <p className={s.body}>If you lose your phone, each of these lets you in once. Keep them somewhere safe, like a password manager. They won’t be shown again.</p>
        <div className={s.panel} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 17, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'center' }}>
          {backupCodes.map(c => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <button className={s.pill} onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))} style={{ marginBottom: 12 }}>
          Copy codes
        </button>
        <a className={s.pillDark} href={next} style={{ display: 'flex' }}>
          I’ve saved them, continue →
        </a>
      </>
    );
  }

  return (
    <>
      <div className={s.eyebrow}>Master admin</div>
      <h1 className={s.h2}>
        Set up <span className={s.accent}>two-step login.</span>
      </h1>
      <p className={s.body}>Master admins can refund money and see every Customer’s details, so signing in needs a code from your phone as well as your password. This takes a minute, once.</p>
      <ol className={s.body} style={{ paddingLeft: 20 }}>
        <li>Open an authenticator app on your phone (Google Authenticator, Microsoft Authenticator, 1Password…).</li>
        <li>Add an account and scan this QR code.</li>
        <li>Type the 6-digit code it shows.</li>
      </ol>
      {setup && (
        <div className={s.panel} style={{ textAlign: 'center' }}>
          <img src={setup.qr} alt="QR code for your authenticator app" width={220} height={220} style={{ display: 'block', margin: '0 auto 12px' }} />
          <div className={s.subtle}>Can’t scan it? Enter this key in the app:</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, margin: '6px 0', wordBreak: 'break-all' }}>{setup.secret}</div>
          <a href={setup.url} className={s.linkBtn}>
            On this phone? Tap to add it to your app
          </a>
        </div>
      )}
      <form className={s.form} onSubmit={submit}>
        <CodeInput value={code} onChange={setCode} />
        {error && (
          <div className={s.calloutWarn} role="alert">
            {error}
          </div>
        )}
        <button className={s.pillDark} disabled={busy || !setup || code.length !== 6}>
          {busy ? 'Checking…' : 'Turn on two-step login'}
        </button>
      </form>
    </>
  );
}

function Verify({ next }: { next: string }) {
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await post<{ backupCodesLeft?: number }>('/api/staff/two-step/verify', { code });
    setBusy(false);
    if (r.ok) {
      if (r.data.backupCodesLeft !== undefined && r.data.backupCodesLeft < 3) {
        alert(`You have ${r.data.backupCodesLeft} backup codes left. Ask another Master admin to reset your two-step login to get new ones.`);
      }
      window.location.assign(next);
    } else {
      setError(r.error);
      setCode('');
    }
  }

  return (
    <>
      <div className={s.eyebrow}>Two-step login</div>
      <h1 className={s.h2}>
        Enter the code <span className={s.accent}>from your phone.</span>
      </h1>
      <p className={s.body}>{backup ? 'Type one of the backup codes you saved when you set up two-step login. Each works once.' : 'Open your authenticator app and type the 6-digit code for OlaJesu Admin.'}</p>
      <form className={s.form} onSubmit={submit}>
        <CodeInput value={code} onChange={setCode} backup={backup} />
        {error && (
          <div className={s.calloutWarn} role="alert">
            {error}
          </div>
        )}
        <button className={s.pillDark} disabled={busy || (!backup && code.length !== 6)}>
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </form>
      <p className={s.subtle} style={{ marginTop: 16 }}>
        <button
          className={s.linkBtn}
          onClick={() => {
            setBackup(!backup);
            setCode('');
            setError(null);
          }}
        >
          {backup ? 'Use the code from my app' : 'Lost your phone? Use a backup code'}
        </button>
      </p>
      <p style={{ marginTop: 8 }}>
        <Link href="/admin/logout" className={s.linkBtn}>
          Sign out
        </Link>
      </p>
    </>
  );
}
