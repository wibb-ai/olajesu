import type { GlobalConfig } from 'payload';

import { isMasterAdmin } from '../access/roles';
import { logActivity } from '../lib/activity';

type Pack = { size?: number; discountPercent?: number };

/**
 * The Pack sizes on offer and their discounts (CONTEXT.md: Pack). The discount comes off
 * each Meal's price including its Option; Add-ons are never discounted.
 */
export const PackSettings: GlobalConfig = {
  slug: 'pack-settings',
  label: 'Packs',
  admin: { group: 'Menu' },
  access: { read: () => true, update: isMasterAdmin },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const show = (packs?: Pack[]) => (packs ?? []).map(p => `${p.size} Meals ${p.discountPercent}% off`).join(', ') || 'none';
        const before = show(previousDoc?.packs);
        const after = show(doc.packs);
        if (before !== after) await logActivity(req, 'Pack discounts changed', `${before} → ${after}`);
      },
    ],
  },
  fields: [
    {
      name: 'packs',
      type: 'array',
      labels: { singular: 'Pack', plural: 'Packs' },
      validate: (value: unknown) => {
        const sizes = ((value as Pack[] | null) ?? []).map(p => p.size);
        return new Set(sizes).size === sizes.length || 'Each Pack size can only appear once.';
      },
      fields: [
        { name: 'size', type: 'number', label: 'Meals in the Pack', required: true, min: 2, admin: { step: 1 } },
        {
          name: 'discountPercent',
          type: 'number',
          label: 'Discount (%)',
          required: true,
          min: 1,
          max: 50,
          admin: { description: 'Off each Meal in the Pack, including its Option.' },
        },
      ],
    },
  ],
};
