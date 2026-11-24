import type { CollectionConfig } from 'payload';

/**
 * OlaJesu staff who sign in to the Admin Dashboard at /admin.
 * Customers and their Accounts are a separate collection, added with ordering.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Lock an account for 10 minutes after 5 wrong passwords.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  fields: [
    { name: 'name', type: 'text' },
  ],
};
