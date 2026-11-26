/**
 * The basket and its prices, with no UI and no database: the shop uses it in the browser,
 * and checkout will use the same functions on the server, so prices are only ever worked
 * out one way. All money is in whole pence.
 *
 * Rules (CONTEXT.md: Pack; Pack edge-cases ticket):
 * - A Pack's discount comes off each Meal's price including its Option; Add-ons are full price.
 * - Any mix of Meals in a Pack, repeats allowed; any number of Packs plus single Meals.
 * - A basket never keeps an old price: it is always priced from today's menu.
 * - Anything no longer on sale is taken out, and the Customer is told.
 */

export type MenuOption = { id: string; name: string; price: number };

export type MenuMeal = {
  id: number;
  slug: string;
  name: string;
  category: 'rice' | 'soups-stews';
  description: string;
  /** Pence. Null when the Meal has Options, each with its own price. */
  price: number | null;
  options: MenuOption[];
  addOnIds: number[];
  ingredients: string;
  allergens: string[];
  mayContain: string;
  spice: string | null;
  halal: boolean;
  portionGrams: number;
  storage: string;
  reheating: string;
  shelfLifeDays: number;
  soldOut: boolean;
};

export type MenuAddOn = {
  id: number;
  name: string;
  price: number;
  ingredients: string;
  allergens: string[];
  mayContain: string;
  soldOut: boolean;
};

export type MenuPack = { size: number; discountPercent: number };

export type Menu = { meals: MenuMeal[]; addOns: MenuAddOn[]; packs: MenuPack[] };

/** One Meal as the Customer configured it. */
export type Choice = { mealId: number; optionId: string | null; addOnIds: number[] };
export type BasketLine = { key: string; choice: Choice; qty: number };
export type BasketPack = { key: string; size: number; items: Choice[] };
export type Basket = {
  lines: BasketLine[];
  packs: BasketPack[];
  /** The Pack the Customer is filling right now, if any. */
  activePack: string | null;
};

export const emptyBasket: Basket = { lines: [], packs: [], activePack: null };

export const gbp = (pence: number) => `£${(pence / 100).toFixed(2).replace(/\.00$/, '')}`;

export const mealById = (menu: Menu, id: number) => menu.meals.find(m => m.id === id);
export const addOnById = (menu: Menu, id: number) => menu.addOns.find(a => a.id === id);
export const packOffer = (menu: Menu, size: number) => menu.packs.find(p => p.size === size);

/** Lowest price a Meal can be bought for, for "from £6" labels. */
export const fromPrice = (meal: MenuMeal) => (meal.options.length ? Math.min(...meal.options.map(o => o.price)) : (meal.price ?? 0));

export const defaultChoice = (meal: MenuMeal): Choice => ({
  mealId: meal.id,
  // Default to the first Option that includes a protein, the most common order.
  optionId: meal.options.length ? (meal.options.find(o => !/^no\b/i.test(o.name)) ?? meal.options[0]).id : null,
  addOnIds: [],
});

export const sameChoice = (a: Choice, b: Choice) =>
  a.mealId === b.mealId && a.optionId === b.optionId && [...a.addOnIds].sort().join() === [...b.addOnIds].sort().join();

/** A Meal's own price for a choice (its Option if it has one), before any Pack discount. */
export function mealPence(menu: Menu, choice: Choice): number | null {
  const meal = mealById(menu, choice.mealId);
  if (!meal) return null;
  if (meal.options.length) return meal.options.find(o => o.id === choice.optionId)?.price ?? null;
  return meal.price;
}

export const addOnsPence = (menu: Menu, choice: Choice) =>
  choice.addOnIds.reduce((sum, id) => sum + (addOnById(menu, id)?.price ?? 0), 0);

/** Pence taken off one Meal by a Pack discount. */
export const packDiscountPence = (pence: number, percent: number) => Math.round((pence * percent) / 100);

export function describeChoice(menu: Menu, choice: Choice) {
  const meal = mealById(menu, choice.mealId);
  const option = meal?.options.find(o => o.id === choice.optionId);
  const name = meal ? (option ? `${meal.name}, ${option.name.toLowerCase()}` : meal.name) : 'Meal no longer on the menu';
  const addOns = choice.addOnIds.map(id => addOnById(menu, id)?.name).filter(Boolean).join(', ');
  return { name, addOns };
}

export type PricedPack = {
  pack: BasketPack;
  discountPercent: number;
  total: number;
  saved: number;
  complete: boolean;
  /** Empty slots left. */
  missing: number;
  /** The Pack's whole saving once full, estimating empty slots from the Meals chosen so far. */
  potentialSaving: number;
};

export function priceBasket(menu: Menu, basket: Basket) {
  const lines = basket.lines.map(line => {
    const unit = (mealPence(menu, line.choice) ?? 0) + addOnsPence(menu, line.choice);
    return { line, unit, total: unit * line.qty };
  });

  const packs: PricedPack[] = basket.packs.map(pack => {
    const discountPercent = packOffer(menu, pack.size)?.discountPercent ?? 0;
    const complete = pack.items.length === pack.size;
    const missing = pack.size - pack.items.length;
    let total = 0;
    let saved = 0;
    let potential = 0;
    for (const item of pack.items) {
      const full = mealPence(menu, item) ?? 0;
      const off = packDiscountPence(full, discountPercent);
      potential += off;
      // A part-filled Pack gets no discount until it is full.
      total += full - (complete ? off : 0) + addOnsPence(menu, item);
      if (complete) saved += off;
    }
    // Estimate the rest of the saving from the Meals chosen so far.
    if (missing > 0 && pack.items.length) potential += Math.round((potential / pack.items.length) * missing);
    return { pack, discountPercent, total, saved, complete, missing, potentialSaving: potential };
  });

  const total = lines.reduce((s, l) => s + l.total, 0) + packs.reduce((s, p) => s + p.total, 0);
  const saved = packs.reduce((s, p) => s + p.saved, 0);
  const mealCount = basket.lines.reduce((s, l) => s + l.qty, 0) + basket.packs.reduce((s, p) => s + p.items.length, 0);
  return { lines, packs, total, saved, mealCount, incompletePacks: packs.filter(p => !p.complete) };
}

/** What a part-filled Pack's Meals would cost bought as single Meals instead. */
export function singlesPrice(menu: Menu, pack: BasketPack) {
  return pack.items.reduce((s, it) => s + (mealPence(menu, it) ?? 0) + addOnsPence(menu, it), 0);
}

export function addLine(basket: Basket, choice: Choice, qty = 1): Basket {
  const existing = basket.lines.find(l => sameChoice(l.choice, choice));
  if (existing) return { ...basket, lines: basket.lines.map(l => (l === existing ? { ...l, qty: l.qty + qty } : l)) };
  return { ...basket, lines: [...basket.lines, { key: newKey(), choice, qty }] };
}

export function startPack(basket: Basket, size: number): Basket {
  const key = newKey();
  return { ...basket, packs: [...basket.packs, { key, size, items: [] }], activePack: key };
}

/** Add Meals to the Pack being filled. Returns how many fitted; the Pack closes when full. */
export function addToActivePack(basket: Basket, choice: Choice, qty: number): { basket: Basket; added: number; completed: boolean } {
  const pack = basket.packs.find(p => p.key === basket.activePack);
  if (!pack) return { basket, added: 0, completed: false };
  const added = Math.min(qty, pack.size - pack.items.length);
  const items = [...pack.items, ...Array.from({ length: added }, () => choice)];
  const completed = items.length === pack.size;
  return {
    basket: {
      ...basket,
      packs: basket.packs.map(p => (p.key === pack.key ? { ...p, items } : p)),
      activePack: completed ? null : basket.activePack,
    },
    added,
    completed,
  };
}

export function removeFromPack(basket: Basket, packKey: string, index: number): Basket {
  return { ...basket, packs: basket.packs.map(p => (p.key === packKey ? { ...p, items: p.items.filter((_, i) => i !== index) } : p)) };
}

/** The Customer's choice for a part-filled Pack: buy its Meals as single Meals at full price. */
export function packToSingles(basket: Basket, packKey: string): Basket {
  const pack = basket.packs.find(p => p.key === packKey);
  if (!pack) return basket;
  let next: Basket = { ...basket, packs: basket.packs.filter(p => p.key !== packKey), activePack: basket.activePack === packKey ? null : basket.activePack };
  for (const item of pack.items) next = addLine(next, item);
  return next;
}

export function removePack(basket: Basket, packKey: string): Basket {
  return { ...basket, packs: basket.packs.filter(p => p.key !== packKey), activePack: basket.activePack === packKey ? null : basket.activePack };
}

/**
 * Two full 5-Packs could be one 10-Pack when 10 is on offer. Returns the extra saving, or null.
 * The basket only suggests this; merging is the Customer's choice.
 */
export function mergeSuggestion(menu: Menu, basket: Basket) {
  for (const small of menu.packs) {
    const big = packOffer(menu, small.size * 2);
    if (!big || big.discountPercent <= small.discountPercent) continue;
    const full = basket.packs.filter(p => p.size === small.size && p.items.length === p.size);
    if (full.length < 2) continue;
    const [a, b] = full;
    const items = [...a.items, ...b.items];
    const extra = items.reduce((s, it) => {
      const pence = mealPence(menu, it) ?? 0;
      return s + packDiscountPence(pence, big.discountPercent) - packDiscountPence(pence, small.discountPercent);
    }, 0);
    if (extra > 0) return { from: [a.key, b.key] as const, size: big.size, extra };
  }
  return null;
}

export function mergePacks(basket: Basket, keys: readonly [string, string], size: number): Basket {
  const [a, b] = keys.map(k => basket.packs.find(p => p.key === k));
  if (!a || !b) return basket;
  const merged: BasketPack = { key: newKey(), size, items: [...a.items, ...b.items] };
  return { ...basket, packs: [...basket.packs.filter(p => p.key !== a.key && p.key !== b.key), merged] };
}

/**
 * Brings a basket up to date with today's menu. Anything no longer on sale is taken out
 * (its Pack slot reopens); a Pack size no longer offered becomes single Meals. Returns the
 * Customer-facing messages for whatever changed.
 */
export function reconcile(menu: Menu, basket: Basket): { basket: Basket; changes: string[] } {
  const changes: string[] = [];
  const fix = (choice: Choice): Choice | null => {
    const meal = mealById(menu, choice.mealId);
    if (!meal || meal.soldOut) {
      changes.push(meal ? `${meal.name} has sold out and was taken out.` : 'A Meal is no longer on the menu and was taken out.');
      return null;
    }
    if (meal.options.length ? !meal.options.some(o => o.id === choice.optionId) : choice.optionId !== null) {
      changes.push(`${meal.name} changed its choices, so it was taken out. Please add it again.`);
      return null;
    }
    const addOnIds = choice.addOnIds.filter(id => {
      const a = addOnById(menu, id);
      const ok = !!a && !a.soldOut && meal.addOnIds.includes(id);
      if (!ok) changes.push(`${a?.name ?? 'An Add-on'} is no longer available with ${meal.name} and was taken out.`);
      return ok;
    });
    return { ...choice, addOnIds };
  };

  let next: Basket = { lines: [], packs: [], activePack: basket.activePack };
  for (const line of basket.lines) {
    const choice = fix(line.choice);
    if (choice) next = addLine(next, choice, line.qty);
  }
  for (const pack of basket.packs) {
    const items = pack.items.map(fix).filter((c): c is Choice => c !== null);
    if (!packOffer(menu, pack.size)) {
      if (items.length) changes.push(`Packs of ${pack.size} are no longer offered, so those Meals are now single Meals.`);
      for (const it of items) next = addLine(next, it);
      continue;
    }
    // A Pack emptied by the menu change goes; one the Customer has only just started stays.
    if (!items.length && pack.items.length) continue;
    next.packs.push({ ...pack, items });
  }
  if (next.activePack && !next.packs.some(p => p.key === next.activePack && p.items.length < p.size)) next.activePack = null;
  return { basket: next, changes: [...new Set(changes)] };
}

const newKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
