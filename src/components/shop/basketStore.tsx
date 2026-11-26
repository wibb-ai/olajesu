'use client';

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

import {
  addLine,
  addOnsPence,
  addToActivePack,
  defaultChoice,
  emptyBasket,
  mealById,
  mealPence,
  mergePacks,
  mergeSuggestion,
  packDiscountPence,
  packOffer,
  packToSingles,
  priceBasket,
  reconcile,
  removeFromPack,
  removePack,
  startPack,
  type Basket,
  type Choice,
  type Menu,
} from '../../lib/basket';

/*
 * The basket lives in the browser (localStorage) so it survives a refresh, and is always
 * re-priced from today's menu. A small external store rather than React state, so the
 * saved basket can be read on the client without a setState-in-effect.
 */

const KEY = 'olajesu-basket-v1';
let state: Basket = emptyBasket;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...emptyBasket, ...(JSON.parse(raw) as Basket) };
  } catch {
    // Private browsing or a corrupt value: start with an empty basket.
  }
}

function setBasket(next: Basket) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the basket still works for this visit.
  }
  listeners.forEach(l => l());
}

/** After a paid Order: start the next visit with an empty basket. */
export const clearSavedBasket = () => setBasket(emptyBasket);

const subscribe = (l: () => void) => {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => emptyBasket;

type Sheet = { choice: Choice; qty: number };

function useShopState(menu: Menu) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { basket, changes } = useMemo(() => reconcile(menu, stored), [menu, stored]);
  const [notices, setNotices] = useState<string[]>([]);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Write the up-to-date basket back once, and tell the Customer what changed.
  useEffect(() => {
    if (!changes.length) return;
    setBasket(basket);
    queueMicrotask(() => setNotices(n => [...n, ...changes]));
  }, [basket, changes]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const priced = useMemo(() => priceBasket(menu, basket), [menu, basket]);
  const activePack = basket.packs.find(p => p.key === basket.activePack) ?? null;
  const activeOffer = activePack ? packOffer(menu, activePack.size) : undefined;

  const sheetMeal = sheet ? mealById(menu, sheet.choice.mealId) : undefined;
  const room = activePack ? activePack.size - activePack.items.length : 20;
  const sheetUnit = sheet
    ? (() => {
        const meal = mealPence(menu, sheet.choice) ?? 0;
        const off = activeOffer ? packDiscountPence(meal, activeOffer.discountPercent) : 0;
        return meal - off + addOnsPence(menu, sheet.choice);
      })()
    : 0;

  return {
    menu,
    basket,
    priced,
    activePack,
    activeOffer,
    notices,
    dismissNotices: () => setNotices([]),
    toast,
    basketOpen,
    setBasketOpen,
    sheet,
    sheetMeal,
    sheetUnit,
    sheetMaxQty: Math.max(1, room),

    openMeal(mealId: number) {
      const meal = mealById(menu, mealId);
      if (!meal || meal.soldOut) return;
      setSheet({ choice: defaultChoice(meal), qty: 1 });
    },
    closeMeal: () => setSheet(null),
    setChoice: (choice: Choice) => setSheet(s => (s ? { ...s, choice } : s)),
    setQty: (qty: number) => setSheet(s => (s ? { ...s, qty: Math.max(1, Math.min(qty, Math.max(1, room))) } : s)),

    confirmMeal() {
      if (!sheet || !sheetMeal) return;
      if (activePack) {
        const result = addToActivePack(basket, sheet.choice, sheet.qty);
        setBasket(result.basket);
        if (result.completed) {
          setToast(`${activePack.size}-Pack complete`);
          setBasketOpen(true);
        } else {
          const left = activePack.size - activePack.items.length - result.added;
          setToast(`${sheetMeal.name} added · ${left} to go`);
        }
      } else {
        setBasket(addLine(basket, sheet.choice, sheet.qty));
        setToast(`${sheet.qty > 1 ? `${sheet.qty} × ` : ''}${sheetMeal.name} added`);
      }
      setSheet(null);
    },

    startPack(size: number) {
      // Only one Pack is filled at a time; an empty one being filled is replaced.
      let next = basket;
      if (activePack && activePack.items.length === 0) next = removePack(next, activePack.key);
      setBasket(startPack(next, size));
      setBasketOpen(false);
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    },
    resumePack(key: string) {
      setBasket({ ...basket, activePack: key });
      setBasketOpen(false);
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    },
    stopFillingPack() {
      if (!activePack) return;
      setBasket(activePack.items.length ? { ...basket, activePack: null } : removePack(basket, activePack.key));
    },
    removeFromPack: (packKey: string, index: number) => setBasket(removeFromPack(basket, packKey, index)),
    packToSingles: (packKey: string) => setBasket(packToSingles(basket, packKey)),
    removePack: (packKey: string) => setBasket(removePack(basket, packKey)),
    removeLine: (key: string) => setBasket({ ...basket, lines: basket.lines.filter(l => l.key !== key) }),
    setLineQty: (key: string, qty: number) =>
      setBasket({ ...basket, lines: qty < 1 ? basket.lines.filter(l => l.key !== key) : basket.lines.map(l => (l.key === key ? { ...l, qty } : l)) }),
    marketingConsent,
    setMarketingConsent,
    checkingOut,
    checkoutError,

    /** Hands the basket to the server, which re-checks and prices it, then sends the Customer to Stripe. */
    async checkout() {
      setCheckingOut(true);
      setCheckoutError(null);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basket: { ...basket, activePack: null }, marketingConsent }),
        });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; changes?: string[]; basket?: Basket };
        if (res.ok && data.url) {
          window.location.assign(data.url);
          return;
        }
        if (res.status === 409 && data.basket) {
          // The menu changed since the page loaded: show the new basket before any payment.
          setBasket(data.basket);
          setNotices(n => [...n, ...(data.changes ?? [])]);
        }
        setCheckoutError(data.error ?? 'Something went wrong. Please try again.');
      } catch {
        setCheckoutError('We couldn’t reach the kitchen. Check your connection and try again.');
      }
      setCheckingOut(false);
    },

    merge: mergeSuggestion(menu, basket),
    mergePacks(keys: readonly [string, string], size: number) {
      setBasket(mergePacks(basket, keys, size));
      setToast(`Now a ${size}-Pack`);
    },
  };
}

export type Shop = ReturnType<typeof useShopState>;
const ShopContext = createContext<Shop | null>(null);

export function ShopProvider({ menu, children }: { menu: Menu; children: ReactNode }) {
  const shop = useShopState(menu);
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('useShop must be used inside <ShopProvider>');
  return shop;
}
