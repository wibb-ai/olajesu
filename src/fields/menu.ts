import type { Access, CollectionAfterChangeHook, CollectionBeforeValidateHook, Field, NumberField, NumberFieldValidation } from 'payload';

import { masterAdminField, staff } from '../access/roles';
import { logActivity } from '../lib/activity';

/** Menu fields that only a Master admin may set: names, prices, Options, settings. */
export const masterOnly = { access: { create: masterAdminField, update: masterAdminField } };

/** Customers only see what is on the menu; staff see everything. */
export const readMenu: Access = ({ req }) => (staff(req) ? true : { status: { not_equals: 'hidden' } });

/** Pounds with at most two decimal places. */
export const checkPounds = (value: unknown): true | string => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'number' || value < 0) return 'Price can’t be negative.';
  if (Math.abs(Math.round(value * 100) - value * 100) > 1e-6) return 'Use pounds and pence, e.g. 12.50.';
  return true;
};
export const validatePounds: NumberFieldValidation = value => checkPounds(value);

export const priceField = (overrides: Partial<NumberField> = {}): NumberField => ({
  name: 'price',
  type: 'number',
  min: 0,
  validate: validatePounds,
  admin: { step: 0.01, description: 'In pounds, e.g. 12.50.' },
  ...masterOnly,
  ...overrides,
} as NumberField);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

export const fillSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && !data.slug && typeof data.name === 'string') data.slug = slugify(data.name);
  return data;
};

const gbp = (n?: number | null) => (n === null || n === undefined ? 'none' : `£${n.toFixed(2)}`);

type MenuDoc = {
  name?: string;
  price?: number | null;
  options?: { name?: string; price?: number | null }[] | null;
  status?: string;
  allergenCheck?: { checkedAt?: string | null } | null;
};

/** Activity log entries for price, availability and Allergen check changes on a Meal or Add-on. */
export const logMenuChanges =
  (kind: 'Meal' | 'Add-on'): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req }) => {
    const now = doc as MenuDoc;
    const was = (operation === 'create' ? {} : previousDoc) as MenuDoc;
    const name = now.name ?? kind;

    if (operation === 'create') await logActivity(req, `${kind} added`, name);

    const prices = (d: MenuDoc) =>
      d.options?.length ? d.options.map(o => `${o.name} ${gbp(o.price)}`).join(', ') : gbp(d.price);
    if (operation === 'update' && prices(was) !== prices(now)) {
      await logActivity(req, 'Price changed', `${name}: ${prices(was)} → ${prices(now)}`);
    }
    if ((was.status ?? 'hidden') !== now.status) {
      await logActivity(req, 'Availability changed', `${name}: ${was.status ?? 'new'} → ${now.status}`);
    }
    const checkedNow = now.allergenCheck?.checkedAt ?? null;
    if (checkedNow !== (was.allergenCheck?.checkedAt ?? null)) {
      await logActivity(req, checkedNow ? 'Allergen check recorded' : 'Allergen check cleared', name);
    }
  };

export const sortOrderField: Field = {
  name: 'sortOrder',
  type: 'number',
  label: 'Order on the menu',
  admin: { position: 'sidebar', description: 'Lower numbers show first.' },
  ...masterOnly,
};
