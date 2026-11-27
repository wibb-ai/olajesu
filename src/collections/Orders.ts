import type { CollectionConfig, FieldAccess } from 'payload';

import { hasRole, isKitchenOrAbove, isMasterAdmin } from '../access/roles';
import { sendStatusEmail } from '../lib/orderEmails';

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
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // "Out for delivery" and "Ready to collect" tell the Customer by email.
        if (operation === 'update' && previousDoc?.status !== doc.status) await sendStatusEmail(req.payload, doc, req);
      },
    ],
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
    {
      name: 'fulfilment',
      type: 'select',
      label: 'Delivery or collection',
      required: true,
      defaultValue: 'delivery',
      options: [
        { label: 'Delivery', value: 'delivery' },
        { label: 'Collection', value: 'collection' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'cutoffAt',
      type: 'date',
      label: 'Cut-off',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' }, description: 'Fixed when the Order was placed: the last moment the Customer can cancel.' },
    },
    {
      name: 'addressCheck',
      type: 'text',
      label: 'Address to check',
      admin: { readOnly: true, description: 'Set when the address given at payment is outside the delivery areas.' },
    },
    { name: 'summary', type: 'textarea', label: 'What was ordered', admin: { readOnly: true } },
    {
      name: 'packedAt',
      type: 'date',
      label: 'Packed',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' }, description: 'Ticked off on the kitchen’s packing list.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', label: 'Meals (£)', admin: { readOnly: true }, required: true },
        { name: 'savings', type: 'number', label: 'Pack savings (£)', admin: { readOnly: true } },
        { name: 'deliveryFee', type: 'number', label: 'Delivery fee (£)', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    {
      name: 'total',
      type: 'number',
      label: 'Paid (£)',
      required: true,
      admin: { readOnly: true, description: 'Meals plus the delivery fee.' },
    },
    {
      name: 'items',
      type: 'json',
      admin: { readOnly: true, description: 'Exactly what was bought, at the prices paid.' },
    },
    {
      name: 'refundActions',
      type: 'ui',
      admin: { components: { Field: '/components/admin/OrderRefundLink' } },
    },
    {
      type: 'collapsible',
      label: 'Refunds and cancellation',
      admin: { initCollapsed: false, condition: data => !!data?.refunds?.length || !!data?.cancelledAt },
      fields: [
        { name: 'refundedTotal', type: 'number', label: 'Refunded (£)', defaultValue: 0, admin: { readOnly: true } },
        {
          type: 'row',
          fields: [
            { name: 'cancelledAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
            {
              name: 'cancelledBy',
              type: 'select',
              options: [
                { label: 'The Customer', value: 'customer' },
                { label: 'The kitchen', value: 'kitchen' },
              ],
              admin: { readOnly: true },
            },
          ],
        },
        {
          name: 'refunds',
          type: 'array',
          admin: { readOnly: true },
          labels: { singular: 'Refund', plural: 'Refunds' },
          fields: [
            { type: 'row', fields: [{ name: 'amount', type: 'number', label: '£' }, { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }] },
            { name: 'reason', type: 'text' },
            { name: 'details', type: 'textarea', label: 'What was refunded' },
            { name: 'by', type: 'relationship', relationTo: 'users', label: 'Staff member' },
            { name: 'stripeRefundId', type: 'text', access: { read: masterOnlyRead } },
          ],
        },
        // Which Meals (by position) have been refunded, so none is refunded twice.
        { name: 'refundedUnits', type: 'json', hidden: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'Customer',
      fields: [
        { name: 'customerName', type: 'text', admin: { readOnly: true } },
        { name: 'email', type: 'email', index: true, admin: { readOnly: true }, ...contact },
        { name: 'phone', type: 'text', admin: { readOnly: true }, ...contact },
        { name: 'deliveryAddress', type: 'textarea', admin: { readOnly: true }, ...contact },
        { name: 'deliveryNotes', type: 'textarea', admin: { readOnly: true, description: 'From the Customer’s Account.' }, ...contact },
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
        {
          name: 'confirmationSentAt',
          type: 'date',
          label: 'Confirmation emailed',
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' }, description: 'Blank means it hasn’t gone yet; it is retried daily.' },
        },
        { name: 'updateSavedDetails', type: 'checkbox', hidden: true },
        // Lets the Customer open their own confirmation page; never shown to staff.
        { name: 'accessToken', type: 'text', hidden: true },
      ],
    },
  ],
};
