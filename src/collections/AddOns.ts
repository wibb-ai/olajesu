import type { CollectionConfig } from 'payload';

import { isKitchenOrAbove, isMasterAdmin } from '../access/roles';
import { allergenCheckHook, allergenFields, STATUS_FIELD } from '../fields/allergens';
import { logMenuChanges, masterOnly, priceField, readMenu, sortOrderField } from '../fields/menu';

/**
 * An extra item added alongside a Meal (CONTEXT.md: Add-on), priced separately and
 * never discounted by a Pack. Each Meal lists which Add-ons it offers.
 * Add-ons are food too, so they carry allergens and need an Allergen check.
 */
export const AddOns: CollectionConfig = {
  slug: 'add-ons',
  labels: { singular: 'Add-on', plural: 'Add-ons' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status'],
    group: 'Menu',
  },
  defaultSort: 'sortOrder',
  access: {
    read: readMenu,
    create: isMasterAdmin,
    update: isKitchenOrAbove,
    delete: isMasterAdmin,
  },
  hooks: {
    beforeChange: [allergenCheckHook],
    afterChange: [logMenuChanges('Add-on')],
  },
  fields: [
    { name: 'name', type: 'text', required: true, ...masterOnly },
    priceField({ required: true }),
    ...allergenFields,
    STATUS_FIELD,
    sortOrderField,
  ],
};
