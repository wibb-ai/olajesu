import type { CollectionConfig } from 'payload';

import { isKitchenOrAbove, isMasterAdmin } from '../access/roles';
import { allergenCheckHook, allergenFields, STATUS_FIELD } from '../fields/allergens';
import { checkPounds, fillSlug, logMenuChanges, masterOnly, priceField, readMenu, slugify, sortOrderField, validatePounds } from '../fields/menu';

/**
 * A single portioned, freshly cooked ready meal (CONTEXT.md: Meal). One 500 g Portion,
 * at most one Option (a protein choice, each with its own price), plus the Add-ons it offers.
 *
 * Master admin sets names, prices and settings. Kitchen records ingredients, allergens,
 * the Allergen check and availability.
 */
export const Meals: CollectionConfig = {
  slug: 'meals',
  labels: { singular: 'Meal', plural: 'Meals' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'status'],
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
    beforeValidate: [fillSlug],
    beforeChange: [allergenCheckHook],
    afterChange: [logMenuChanges('Meal')],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu',
          fields: [
            { name: 'name', type: 'text', required: true, ...masterOnly },
            {
              name: 'category',
              type: 'select',
              required: true,
              options: [
                { label: 'Rice', value: 'rice' },
                { label: 'Soups and stews', value: 'soups-stews' },
              ],
              ...masterOnly,
            },
            { name: 'description', type: 'textarea', ...masterOnly },
            priceField({
              admin: {
                step: 0.01,
                description: 'In pounds. Leave blank if the Meal has Options below; each Option has its own price.',
              },
              validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
                const options = (siblingData as { options?: unknown[] }).options;
                if ((value === null || value === undefined) && !options?.length) return 'Set a price, or add Options with their own prices.';
                return checkPounds(value);
              },
            }),
            {
              name: 'options',
              type: 'array',
              label: 'Options (protein choice)',
              labels: { singular: 'Option', plural: 'Options' },
              admin: { description: 'Only for Meals with a protein choice, e.g. Jollof Rice. The Customer must pick one.' },
              ...masterOnly,
              fields: [
                { name: 'name', type: 'text', required: true, admin: { placeholder: 'e.g. Chicken' } },
                { name: 'price', type: 'number', required: true, min: 0, validate: validatePounds, admin: { step: 0.01 } },
              ],
            },
            {
              name: 'addOns',
              type: 'relationship',
              relationTo: 'add-ons',
              hasMany: true,
              label: 'Add-ons offered',
              ...masterOnly,
            },
          ],
        },
        {
          label: 'Ingredients and allergens',
          fields: allergenFields,
        },
        {
          label: 'Details',
          fields: [
            { name: 'portionGrams', type: 'number', label: 'Portion (g)', defaultValue: 500, min: 1, ...masterOnly },
            {
              name: 'spice',
              type: 'select',
              options: [
                { label: 'Not spicy', value: 'none' },
                { label: 'Mild', value: 'mild' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hot', value: 'hot' },
              ],
              ...masterOnly,
            },
            {
              name: 'halal',
              type: 'checkbox',
              admin: { description: 'Only tick if the meat supplier is halal certified.' },
              ...masterOnly,
            },
            { name: 'storage', type: 'textarea', label: 'Storage instructions', ...masterOnly },
            { name: 'reheating', type: 'textarea', label: 'Reheating instructions', ...masterOnly },
            {
              name: 'shelfLifeDays',
              type: 'number',
              label: 'Shelf life (days)',
              defaultValue: 2,
              min: 1,
              required: true,
              admin: { description: 'Days from the Batch cook date to the use-by date. 2 until the council confirms.' },
              ...masterOnly,
            },
          ],
        },
      ],
    },
    STATUS_FIELD,
    {
      name: 'dailyLimit',
      type: 'number',
      label: 'Daily limit',
      min: 1,
      admin: { position: 'sidebar', description: 'Most that can be ordered for one delivery day. Blank means no limit.' },
      ...masterOnly,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Web address',
      validate: (value: string | null | undefined) =>
        !value || value === slugify(value) || 'Use lowercase letters, numbers and hyphens, e.g. egusi-soup.',
      admin: { position: 'sidebar', description: 'olajesu.com/meals/… Filled in from the name if left blank.' },
      ...masterOnly,
    },
    sortOrderField,
  ],
};
