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
import type { AccountSummary } from '../../lib/account';
import { areaFor, deliveryFee, normalisePostcode, type Fulfilment } from '../../lib/delivery';
import type { ShopDelivery } from '../../lib/deliverySettings';

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

function useShopState(menu: Menu, account: AccountSummary, delivery: ShopDelivery) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { basket, changes } = useMemo(() => reconcile(menu, stored), [menu, stored]);
  const [notices, setNotices] = useState<string[]>([]);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  // Signed-in Customers: copy this Order's details to the Account (ticked by default; Accounts ticket).
  const [updateSavedDetails, setUpdateSavedDetails] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // How and when: delivery or collection, the day, and (for delivery) the postcode for the fee.
  const [fulfilment, setFulfilment] = useState<Fulfilment>(delivery.areas.length || !delivery.collection.enabled ? 'delivery' : 'collection');
  const [chosenDate, setDeliveryDate] = useState<string | null>(null);
  const [postcode, setPostcode] = useState(account?.postcode ?? '');

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

  // The day: the Customer's choice while it's still open, else the soonest day not fully booked.
  const day = delivery.dates.find(d => d.date === chosenDate && !d.full) ?? delivery.dates.find(d => !d.full) ?? null;
  const validPostcode = normalisePostcode(postcode);
  const area = fulfilment === 'delivery' && validPostcode ? areaFor(delivery, validPostcode) : null;
  const feePence = fulfilment === 'delivery' && area ? Math.round(deliveryFee(area, priced.total / 100) * 100) : 0;
  /** Sold out by hand, or for the chosen day by its Daily limit. */
  const isSoldOut = (mealId: number) => !!mealById(menu, mealId)?.soldOut || !!day?.soldOut.includes(mealId);
  const soldOutInBasket = [...new Set([...basket.lines.map(l => l.choice.mealId), ...basket.packs.flatMap(p => p.items.map(i => i.mealId))])].filter(isSoldOut);
  const howProblem = !day
    ? 'There are no delivery days open right now.'
    : fulfilment === 'delivery' && !validPostcode
      ? 'Enter your delivery postcode.'
      : fulfilment === 'delivery' && !area
        ? `Sorry, we don’t deliver to ${validPostcode} yet.${delivery.collection.enabled ? ' You can collect from our kitchen instead.' : ''}`
        : soldOutInBasket.length
          ? `${soldOutInBasket.map(id => mealById(menu, id)?.name).join(', ')} ${soldOutInBasket.length === 1 ? 'is' : 'are'} sold out for that day. Remove ${soldOutInBasket.length === 1 ? 'it' : 'them'}, or choose another day.`
          : null;
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
      if (!meal || isSoldOut(mealId)) return;
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
    account,
    marketingConsent,
    setMarketingConsent,
    updateSavedDetails,
    setUpdateSavedDetails,

    /** Reorder: add a past Order to the basket. Today's menu and prices apply (reconcile tells the Customer what changed). */
    addToBasket(extra: Basket) {
      setBasket({ lines: [...basket.lines, ...extra.lines], packs: [...basket.packs, ...extra.packs], activePack: basket.activePack });
      setBasketOpen(true);
    },
    checkingOut,
    checkoutError,

    delivery,
    fulfilment,
    setFulfilment,
    day,
    setDeliveryDate,
    postcode,
    setPostcode,
    area,
    feePence,
    totalPence: priced.total + feePence,
    isSoldOut,
    howProblem,

    /** Hands the basket to the server, which re-checks and prices it, then sends the Customer to Stripe. */
    async checkout() {
      setCheckingOut(true);
      setCheckoutError(null);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            basket: { ...basket, activePack: null },
            marketingConsent,
            updateSavedDetails: !!account && updateSavedDetails,
            fulfilment,
            deliveryDate: day?.date ?? null,
            postcode: fulfilment === 'delivery' ? postcode : null,
          }),
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

export function ShopProvider({ menu, account, delivery, children }: { menu: Menu; account: AccountSummary; delivery: ShopDelivery; children: ReactNode }) {
  const shop = useShopState(menu, account, delivery);
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('useShop must be used inside <ShopProvider>');
  return shop;
}
