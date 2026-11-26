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
    // A switched-off login can't open the dashboard, even with a valid session.
    admin: ({ req }) => staff(req) !== null,
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
      ({ data }) => {
        // A Master admin resets someone's two-step login when they lose their phone.
        if (data.resetTwoStep) {
          Object.assign(data, { totpSecret: null, totpPendingSecret: null, totpLastStep: null, totpBackupCodes: null, totpFailures: 0, totpLockedUntil: null, twoStepEnabledAt: null });
        }
        return data;
      },
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
        } else if (previousDoc.twoStepEnabledAt && !doc.twoStepEnabledAt) {
          await logActivity(req, 'Two-step login reset', doc.email);
        } else if (previousDoc.role !== doc.role || previousDoc.active !== doc.active) {
          await logActivity(req, 'Staff changed', `${doc.email}: role ${doc.role}, ${doc.active === false ? 'switched off' : 'active'}`);
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'twoStepEnabledAt',
      type: 'date',
      label: 'Two-step login set up',
      admin: { readOnly: true, position: 'sidebar', description: 'Required for Master admins. Blank means it will be set up at the next sign-in.' },
    },
    {
      name: 'resetTwoStep',
      type: 'checkbox',
      virtual: true,
      label: 'Reset two-step login (lost phone)',
      access: { create: masterAdminField, update: masterAdminField },
      hooks: { afterRead: [() => false] },
      admin: { readOnly: false, position: 'sidebar', description: 'They set it up again with a new code at their next sign-in.' },
    },
    // Two-step login (src/lib/twoFactor.ts). Never shown or sent anywhere.
    { name: 'totpSecret', type: 'text', hidden: true },
    { name: 'totpPendingSecret', type: 'text', hidden: true },
    { name: 'totpLastStep', type: 'number', hidden: true },
    { name: 'totpBackupCodes', type: 'json', hidden: true },
    { name: 'totpFailures', type: 'number', hidden: true },
    { name: 'totpLockedUntil', type: 'date', hidden: true },
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
