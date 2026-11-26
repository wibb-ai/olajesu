import type { CollectionConfig, FieldAccess } from 'payload';

import { hasRole, isKitchenOrAbove, isMasterAdmin } from '../access/roles';

/** Customers' contact details are for the Master admin only (staff-roles ticket). */
const masterOnlyRead: FieldAccess = ({ req }) => hasRole(req, 'master-admin');
const contact = { access: { read: masterOnlyRead, update: masterOnlyRead } };

export const ORDER_STATUSES = [
  { label: 'Awaiting payment', value: 'awaiting-payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready to collect', value: 'ready' },
  { label: 'Out for delivery', value: 'out-for-delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Partly refunded', value: 'partly-refunded' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Checkout abandoned', value: 'expired' },
] as const;

/**
 * A one-time purchase of Meals and/or Packs, paid by card at checkout (CONTEXT.md: Order).
 *
 * Created by the checkout endpoint as "awaiting payment", with a snapshot of what was bought
 * at today's prices; marked paid only by Stripe (webhook or confirmation page, both checked
 * with Stripe). Nobody creates or deletes Orders by hand: they are sales records kept 6 years.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'status', 'deliveryDate', 'total', 'createdAt'],
    group: 'Orders',
  },
  defaultSort: '-createdAt',
  access: {
    read: isKitchenOrAbove,
    create: () => false,
    update: isMasterAdmin,
    delete: () => false,
  },
  fields: [
    { name: 'number', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'awaiting-payment',
      options: [...ORDER_STATUSES],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'deliveryDate',
      type: 'date',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayOnly', displayFormat: 'EEE d MMM yyyy' } },
    },
    { name: 'summary', type: 'textarea', label: 'What was ordered', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', label: 'Total (£)', admin: { readOnly: true }, required: true },
        { name: 'savings', type: 'number', label: 'Pack savings (£)', admin: { readOnly: true } },
      ],
    },
    {
      name: 'total',
      type: 'number',
      label: 'Paid (£)',
      required: true,
      admin: { readOnly: true, description: 'Delivery fees come with the delivery rules.' },
    },
    {
      name: 'items',
      type: 'json',
      admin: { readOnly: true, description: 'Exactly what was bought, at the prices paid.' },
    },
    {
      type: 'collapsible',
      label: 'Customer',
      fields: [
        { name: 'customerName', type: 'text', admin: { readOnly: true } },
        { name: 'email', type: 'email', index: true, admin: { readOnly: true }, ...contact },
        { name: 'phone', type: 'text', admin: { readOnly: true }, ...contact },
        { name: 'deliveryAddress', type: 'textarea', admin: { readOnly: true }, ...contact },
        {
          name: 'marketingConsent',
          type: 'checkbox',
          label: 'Agreed to marketing emails',
          admin: { readOnly: true, description: 'Ticked by the Customer at checkout (CONTEXT.md: Marketing consent).' },
          ...contact,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Payment',
      admin: { initCollapsed: true },
      fields: [
        { name: 'stripeSessionId', type: 'text', index: true, admin: { readOnly: true }, access: { read: masterOnlyRead } },
        { name: 'stripePaymentIntentId', type: 'text', admin: { readOnly: true }, access: { read: masterOnlyRead } },
        { name: 'paidAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
        // Lets the Customer open their own confirmation page; never shown to staff.
        { name: 'accessToken', type: 'text', hidden: true },
      ],
    },
  ],
};
