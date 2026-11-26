import { APIError, type CollectionBeforeChangeHook, type Field } from 'payload';

import { staff } from '../access/roles';

/** The 14 allergens UK law requires us to declare. */
export const ALLERGENS = [
  { label: 'Celery', value: 'celery' },
  { label: 'Cereals containing gluten', value: 'gluten' },
  { label: 'Crustaceans', value: 'crustaceans' },
  { label: 'Eggs', value: 'eggs' },
  { label: 'Fish', value: 'fish' },
  { label: 'Lupin', value: 'lupin' },
  { label: 'Milk', value: 'milk' },
  { label: 'Molluscs', value: 'molluscs' },
  { label: 'Mustard', value: 'mustard' },
  { label: 'Tree nuts', value: 'tree-nuts' },
  { label: 'Peanuts', value: 'peanuts' },
  { label: 'Sesame', value: 'sesame' },
  { label: 'Soya', value: 'soya' },
  { label: 'Sulphur dioxide and sulphites', value: 'sulphites' },
] as const;

/** Statuses that put an item in front of Customers, so they need a current Allergen check. */
export const ON_MENU = ['available', 'sold-out'];

export const STATUS_FIELD: Field = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'hidden',
  options: [
    { label: 'Not on the menu', value: 'hidden' },
    { label: 'Available', value: 'available' },
    { label: 'Sold out', value: 'sold-out' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Available or Sold out shows it on the site. Needs a current Allergen check.',
  },
};

/** Ingredients, the 14-allergen list and the Allergen check (CONTEXT.md). Kitchen and Master admin can edit these. */
export const allergenFields: Field[] = [
  {
    name: 'ingredients',
    type: 'textarea',
    admin: { description: 'Every ingredient, checked against the packet labels. Write allergens in CAPITALS, e.g. "palm oil, CRAYFISH, stock cube (CELERY)".' },
  },
  {
    name: 'allergens',
    type: 'select',
    hasMany: true,
    options: [...ALLERGENS],
    admin: { description: 'Tick every one of the 14 allergens this contains.' },
  },
  {
    name: 'mayContain',
    type: 'text',
    label: 'May contain',
    admin: { description: 'Only where there is a real cross-contamination risk. Leave blank otherwise.' },
  },
  {
    name: 'allergenCheck',
    type: 'group',
    label: 'Allergen check',
    admin: { description: 'Needed before this can be on the menu. Changing the ingredients, allergens or "may contain" clears it.' },
    fields: [
      {
        name: 'confirm',
        type: 'checkbox',
        // Not stored: it starts unticked every time, so each check is a fresh, deliberate tick.
        // Payload makes virtual fields read-only in the admin unless told otherwise.
        virtual: true,
        admin: { readOnly: false },
        hooks: { afterRead: [() => false] },
        label: 'I have checked the ingredients and allergens above against every packet label',
      },
      {
        name: 'checkedBy',
        type: 'relationship',
        relationTo: 'users',
        // Staff names and emails are never shown to Customers.
        access: { read: ({ req }) => staff(req) !== null },
        admin: { readOnly: true },
      },
      { name: 'checkedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    ],
  },
];

type AllergenData = {
  ingredients?: string | null;
  allergens?: string[] | null;
  mayContain?: string | null;
  status?: string | null;
  allergenCheck?: { confirm?: boolean | null; checkedBy?: unknown; checkedAt?: string | null } | null;
};

const sameList = (a?: string[] | null, b?: string[] | null) => [...(a ?? [])].sort().join() === [...(b ?? [])].sort().join();

/**
 * Keeps the Allergen check honest:
 * - ticking "confirm" stamps the signed-in staff member and the time;
 * - changing ingredients, allergens or "may contain" without re-confirming clears the check;
 * - nothing goes on the menu without a current check.
 */
export const allergenCheckHook: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const next = data as AllergenData;
  const prev = (originalDoc ?? {}) as AllergenData;
  const check = { ...(prev.allergenCheck ?? {}), ...(next.allergenCheck ?? {}) };

  const changed =
    (next.ingredients !== undefined && (next.ingredients ?? '') !== (prev.ingredients ?? '')) ||
    (next.allergens !== undefined && !sameList(next.allergens, prev.allergens)) ||
    (next.mayContain !== undefined && (next.mayContain ?? '') !== (prev.mayContain ?? ''));

  if (check.confirm) {
    const user = req.user as { id: number } | null | undefined;
    check.checkedBy = user?.id ?? null;
    check.checkedAt = new Date().toISOString();
  } else if (changed) {
    check.checkedBy = null;
    check.checkedAt = null;
  }
  delete check.confirm;
  next.allergenCheck = check;

  const status = next.status ?? prev.status;
  if (status && ON_MENU.includes(status) && !check.checkedAt) {
    throw new APIError(
      changed
        ? 'The ingredients or allergens changed. Tick the Allergen check again before this can stay on the menu.'
        : 'Tick the Allergen check before putting this on the menu.',
      400,
      undefined,
      true,
    );
  }
  return next;
};
