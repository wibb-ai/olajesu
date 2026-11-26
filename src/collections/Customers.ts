import type { CollectionConfig } from 'payload';

import { isMasterAdmin, staff } from '../access/roles';
import { logActivity } from '../lib/activity';

/**
 * A Customer's Account (CONTEXT.md: Account): saved details for checkout, Marketing consent,
 * and the email their Orders are matched by. Created only by clicking a Login link, so the
 * email is always proven. Signed into by Login link only; there is no password.
 *
 * Only the Master admin sees Accounts (staff-roles ticket). Deleting one removes the profile;
 * the Orders stay as sales records.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Account', plural: 'Accounts' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'postcode', 'marketingConsent', 'lastActiveAt'],
    group: 'Orders',
  },
  access: {
    read: isMasterAdmin,
    create: () => false,
    update: isMasterAdmin,
    delete: isMasterAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase();
        // Consent recorded with its time, whoever changes it.
        if (data.marketingConsent !== undefined && data.marketingConsent !== originalDoc?.marketingConsent) {
          data.marketingConsentAt = new Date().toISOString();
          if (staff(req)) data.marketingConsentNote = `Changed by staff on request`;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'update' && staff(req) && previousDoc.marketingConsent !== doc.marketingConsent) {
          await logActivity(req, 'Marketing consent changed', `${doc.email}: ${doc.marketingConsent ? 'agreed' : 'withdrawn'}`);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await logActivity(req, 'Account deleted', `${doc.email}${staff(req) ? ' (by staff)' : ' (by the Customer)'}`);
      },
    ],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'name', type: 'text' },
    { name: 'phone', type: 'text' },
    {
      type: 'collapsible',
      label: 'Delivery address',
      fields: [
        { name: 'addressLine1', type: 'text', label: 'Address line 1' },
        { name: 'addressLine2', type: 'text', label: 'Address line 2' },
        { type: 'row', fields: [{ name: 'city', type: 'text' }, { name: 'postcode', type: 'text', index: true }] },
        { name: 'deliveryNotes', type: 'textarea', maxLength: 300 },
      ],
    },
    {
      name: 'marketingConsent',
      type: 'checkbox',
      label: 'Agreed to marketing emails',
      admin: { description: 'Only change this when the Customer asks. The change is recorded in the Activity log.' },
    },
    { name: 'marketingConsentAt', type: 'date', label: 'Consent last changed', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'marketingConsentNote', type: 'text', admin: { readOnly: true } },
    { name: 'lastActiveAt', type: 'date', label: 'Last signed in or ordered', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'inactivityWarnedAt', type: 'date', admin: { readOnly: true, position: 'sidebar', description: 'Accounts unused for 3 years are deleted, a month after a warning email.' } },
    { name: 'stripeCustomerId', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    // Earlier emails, so Orders placed with them stay in the history after a change (Accounts ticket).
    { name: 'previousEmails', type: 'json', admin: { readOnly: true, description: 'Emails this Account used before; their Orders stay in its history.' } },
    // Bumped to sign the Customer out everywhere (email change, deletion).
    { name: 'sessionVersion', type: 'number', defaultValue: 1, hidden: true },
  ],
};
