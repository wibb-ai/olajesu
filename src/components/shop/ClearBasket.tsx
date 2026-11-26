'use client';

import { useEffect } from 'react';

import { clearSavedBasket } from './basketStore';

/** On the confirmation page of a paid Order: empty the basket, once. */
export function ClearBasket() {
  useEffect(() => {
    clearSavedBasket();
  }, []);
  return null;
}
