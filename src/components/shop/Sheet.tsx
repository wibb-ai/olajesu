'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import s from './shop.module.css';

/** Bottom sheet on phones, centred panel on wider screens. Escape or tapping outside closes it. */
export function Sheet({ onClose, label, children }: { onClose: () => void; label: string; children: ReactNode }) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div className={s.backdrop} onClick={() => close.current()}>
      <div className={s.sheet} role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>
        <div className={s.grabber} />
        <div style={{ position: 'relative' }}>
          <button className={s.sheetClose} onClick={() => close.current()} aria-label="Close" style={{ zIndex: 2 }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
