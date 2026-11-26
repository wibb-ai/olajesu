import type { Access, FieldAccess, PayloadRequest } from 'payload';

import { passedTwoStep } from '../lib/twoFactor';

/** Staff roles from the staff-roles decision (CONTEXT.md: Master admin, Kitchen). OlaJesu delivers its own Meals, so there is no Driver role. */
export const ROLES = [
  { label: 'Master admin', value: 'master-admin' },
  { label: 'Kitchen', value: 'kitchen' },
] as const;

export type Role = (typeof ROLES)[number]['value'];

type StaffUser = { id: number | string; _sid?: string; collection?: string; role?: Role | null; active?: boolean | null };

/**
 * The signed-in staff member, or null. A switched-off login counts as signed out, and so does a
 * Master admin who hasn't entered their two-step code in this session (staff-roles ticket).
 */
export function staff(req: PayloadRequest): StaffUser | null {
  const user = req.user as StaffUser | null | undefined;
  if (!user || user.collection !== 'users' || user.active === false) return null;
  if (user.role === 'master-admin' && !passedTwoStep(req.headers?.get('cookie'), user)) return null;
  return user;
}

export function hasRole(req: PayloadRequest, ...roles: Role[]): boolean {
  const user = staff(req);
  return !!user?.role && roles.includes(user.role);
}

export const isMasterAdmin: Access = ({ req }) => hasRole(req, 'master-admin');
export const isKitchenOrAbove: Access = ({ req }) => hasRole(req, 'master-admin', 'kitchen');
export const isStaff: Access = ({ req }) => staff(req) !== null;

export const masterAdminField: FieldAccess = ({ req }) => hasRole(req, 'master-admin');
