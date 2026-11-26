import { APIError, type CollectionConfig } from 'payload';

import { isMasterAdmin, masterAdminField, ROLES, staff } from '../access/roles';
import { logActivity } from '../lib/activity';

/**
 * OlaJesu staff who sign in to the Admin Dashboard at /admin.
 * Customers and their Accounts are a separate collection, added with ordering.
 *
 * Staff are switched off, never deleted, so their name stays on past Allergen
 * checks and in the Activity log. There is always at least one active Master admin.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'active'],
  },
  auth: {
    // Lock an account for 10 minutes after 5 wrong passwords.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // A switched-off login can't open the dashboard, even with a valid session. Drivers only
    // use the screens for the day at /kitchen (staff-roles ticket).
    admin: ({ req }) => { const u = staff(req); return !!u && u.role !== 'driver'; },
    create: isMasterAdmin,
    read: ({ req }) => {
      const user = staff(req);
      if (!user) return false;
      if (user.role === 'master-admin') return true;
      return { id: { equals: (req.user as { id: number | string }).id } };
    },
    update: ({ req }) => {
      const user = staff(req);
      if (!user) return false;
      if (user.role === 'master-admin') return true;
      return { id: { equals: (req.user as { id: number | string }).id } };
    },
    delete: () => false,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (user.active === false) throw new APIError('This login has been switched off.', 403);
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        // Never leave the dashboard without an active Master admin.
        const losingMaster =
          operation === 'update' &&
          originalDoc?.role === 'master-admin' &&
          originalDoc?.active !== false &&
          ((data.role && data.role !== 'master-admin') || data.active === false);
        if (losingMaster) {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            where: {
              and: [{ role: { equals: 'master-admin' } }, { active: { not_equals: false } }, { id: { not_equals: originalDoc.id } }],
            },
            req,
          });
          if (totalDocs === 0) throw new APIError('There must always be at least one active Master admin.', 400);
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          await logActivity(req, 'Staff added', `${doc.email} as ${doc.role}`);
        } else if (previousDoc.role !== doc.role || previousDoc.active !== doc.active) {
          await logActivity(req, 'Staff changed', `${doc.email}: role ${doc.role}, ${doc.active === false ? 'switched off' : 'active'}`);
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'kitchen',
      options: [...ROLES],
      access: { create: masterAdminField, update: masterAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Login switched on',
      access: { create: masterAdminField, update: masterAdminField },
      admin: {
        position: 'sidebar',
        description: 'Untick when someone leaves. They are signed out at once and kept on past records.',
      },
    },
  ],
};
