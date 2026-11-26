import type { CollectionConfig } from 'payload';

import { isMasterAdmin } from '../access/roles';

/**
 * Who did each sensitive action, and when (CONTEXT.md: Activity log).
 * Written only by hooks; nobody can edit or delete an entry.
 */
export const ActivityLog: CollectionConfig = {
  slug: 'activity-log',
  labels: { singular: 'Activity', plural: 'Activity log' },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['createdAt', 'action', 'details', 'staff'],
    group: 'Admin',
  },
  defaultSort: '-createdAt',
  access: {
    read: isMasterAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'action', type: 'text', required: true },
    { name: 'details', type: 'textarea' },
    { name: 'staff', type: 'relationship', relationTo: 'users' },
  ],
};
