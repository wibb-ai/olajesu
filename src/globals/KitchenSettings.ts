import type { GlobalConfig } from 'payload';

import { isMasterAdmin, isStaff } from '../access/roles';

/**
 * The few email settings staff can change (notifications ticket). All other email wording is
 * fixed, so the legally required parts can't be lost by accident.
 */
export const KitchenSettings: GlobalConfig = {
  slug: 'kitchen-settings',
  label: 'Kitchen emails',
  admin: { group: 'Admin' },
  access: { read: isStaff, update: isMasterAdmin },
  fields: [
    {
      name: 'kitchenInbox',
      type: 'email',
      label: 'Kitchen inbox',
      admin: { description: 'Where Customer replies land and where kitchen emails go. Until set, the catering enquiry address is used.' },
    },
    {
      name: 'emailEachOrder',
      type: 'checkbox',
      label: 'Email the kitchen for every new paid Order',
      defaultValue: true,
      admin: { description: 'Untick once Orders get busy; the lists at the Cut-off still arrive.' },
    },
    {
      name: 'kitchenNote',
      type: 'textarea',
      label: 'Note from the kitchen',
      maxLength: 400,
      admin: { description: 'A short line shown in every Order confirmation, e.g. a holiday notice. Leave blank for none.' },
    },
  ],
};
