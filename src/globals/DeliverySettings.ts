import type { GlobalConfig } from 'payload';

import { isMasterAdmin } from '../access/roles';
import { logActivity } from '../lib/activity';
import { businessConfig } from '../config/businessConfig';

export const WEEKDAYS = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '0' },
];

// The daily job sends the kitchen lists at about 8:15pm UK time, so a Cut-off can't be later.
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6).map(h => ({ label: h < 12 ? `${h}am` : h === 12 ? '12 noon' : `${h - 12}pm`, value: String(h) }));

/**
 * The delivery rules (capacity ticket: editable settings, values chosen before launch):
 * delivery days with their Cut-offs, closed dates, delivery areas by postcode with fees,
 * collection from the kitchen, and the limit on Meals per delivery day.
 */
export const DeliverySettings: GlobalConfig = {
  slug: 'delivery-settings',
  label: 'Delivery and collection',
  admin: { group: 'Admin' },
  // Shown in the shop, so readable by everyone; only the Master admin changes them.
  access: { read: () => true, update: isMasterAdmin },
  hooks: {
    afterChange: [
      async ({ req }) => {
        await logActivity(req, 'Delivery settings changed', 'Delivery and collection settings were saved.');
      },
    ],
  },
  fields: [
    {
      name: 'draft',
      type: 'checkbox',
      label: 'These are draft values',
      defaultValue: true,
      admin: { description: 'While ticked, the shop says delivery days, areas and fees may still change. Untick once they are final, before launch.' },
    },
    {
      name: 'deliveryDays',
      type: 'array',
      label: 'Delivery days',
      minRows: 1,
      labels: { singular: 'Delivery day', plural: 'Delivery days' },
      admin: { description: 'Each day you deliver, and its Cut-off: the latest time to order or cancel. After it, cooking starts.' },
      defaultValue: [{ day: '6', cutoffDaysBefore: 2, cutoffHour: '20' }],
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'day', type: 'select', required: true, options: WEEKDAYS, label: 'Day' },
            { name: 'cutoffDaysBefore', type: 'number', required: true, min: 1, max: 6, defaultValue: 2, label: 'Cut-off, days before' },
            { name: 'cutoffHour', type: 'select', required: true, options: HOURS, defaultValue: '20', label: 'Cut-off time' },
          ],
        },
      ],
    },
    {
      name: 'closedDates',
      type: 'array',
      label: 'Closed dates',
      labels: { singular: 'Closed date', plural: 'Closed dates' },
      admin: { description: 'Delivery days with no deliveries or collections, e.g. Christmas. Existing Orders for them are not changed.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'EEE d MMM yyyy' } } },
            { name: 'note', type: 'text', label: 'Why (staff only)' },
          ],
        },
      ],
    },
    {
      name: 'dailyMealLimit',
      type: 'number',
      label: 'Most Meals per delivery day',
      min: 1,
      admin: { description: 'All Meals together, delivered and collected. When reached, that day closes. Blank means no limit. Each Meal can have its own Daily limit too.' },
    },
    {
      name: 'areas',
      type: 'array',
      label: 'Delivery areas',
      labels: { singular: 'Delivery area', plural: 'Delivery areas' },
      admin: { description: 'Where you deliver, by the first part of the postcode. A Customer outside every area can only collect.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Name', admin: { placeholder: 'Central Manchester' } },
            { name: 'fee', type: 'number', required: true, min: 0, label: 'Delivery fee (£)' },
            { name: 'freeOver', type: 'number', min: 0, label: 'Free delivery from (£)', admin: { description: 'Blank for never free.' } },
          ],
        },
        {
          name: 'postcodes',
          type: 'textarea',
          required: true,
          label: 'Postcodes',
          admin: { description: 'The first part of each postcode, separated by commas, e.g. "M1, M3, M4, M14". Letters alone, like "M", mean every postcode starting with them.' },
        },
      ],
    },
    {
      name: 'deliveryWindow',
      type: 'text',
      label: 'Delivery times',
      admin: { description: 'Told to Customers, e.g. "between 10am and 4pm".' },
    },
    {
      name: 'failedDelivery',
      type: 'textarea',
      label: 'If no one is in',
      maxLength: 400,
      defaultValue: 'If no one is in, we’ll call you. If we can’t reach you, we’ll leave your Meals somewhere safe only if your delivery notes say where; otherwise we take them back and you can collect them the same day.',
      admin: { description: 'What happens when a delivery can’t be made. Shown in the Order confirmation.' },
    },
    {
      name: 'collection',
      type: 'group',
      label: 'Collection',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Customers can collect from the kitchen', defaultValue: true },
        { name: 'address', type: 'textarea', label: 'Collection address', defaultValue: businessConfig.contact.address.full },
        { name: 'times', type: 'text', label: 'Collection times', admin: { description: 'e.g. "between 12 noon and 6pm".' } },
      ],
    },
  ],
};
