import type { CollectionConfig } from 'payload';

/**
 * Login links (CONTEXT.md: Login link), stored only as a hash so a database leak can't be used
 * to sign in. Single use, 15 minutes. Never shown in the dashboard: staff can't see or use them.
 */
export const LoginTokens: CollectionConfig = {
  slug: 'login-tokens',
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'tokenHash', type: 'text', required: true, unique: true, index: true },
    { name: 'email', type: 'email', required: true, index: true },
    {
      name: 'purpose',
      type: 'select',
      required: true,
      options: [
        { label: 'Sign in', value: 'login' },
        { label: 'Save details from an Order', value: 'save-details' },
        { label: 'Change email', value: 'change-email' },
        { label: 'Delete Account', value: 'delete' },
      ],
    },
    { name: 'orderId', type: 'number' },
    { name: 'customerId', type: 'number' },
    { name: 'newEmail', type: 'email' },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'usedAt', type: 'date' },
  ],
};
