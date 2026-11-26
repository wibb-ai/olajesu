/**
 * PLACEHOLDER delivery rules. The real ones (days, areas, fees, Cut-off) become editable
 * dashboard settings, with values chosen before launch (capacity ticket, "Before launch").
 * Until then the shop shows one weekly delivery day and marks it as a placeholder.
 */
export const DELIVERY_PLACEHOLDER = {
  /** 0 = Sunday … 6 = Saturday. */
  cutoffDay: 4,
  cutoffHour: 20,
  deliveryDay: 6,
  cutoffLabel: 'Thursday 8pm',
  deliveryLabel: 'Saturday',
  isPlaceholder: true,
};

/** The next Cut-off after `now`, in the visitor's local time. */
export function nextCutoff(now: Date) {
  const { cutoffDay, cutoffHour } = DELIVERY_PLACEHOLDER;
  const d = new Date(now);
  d.setHours(cutoffHour, 0, 0, 0);
  d.setDate(d.getDate() + ((cutoffDay - d.getDay() + 7) % 7));
  if (d <= now) d.setDate(d.getDate() + 7);
  return d;
}

export function deliveryAfter(cutoff: Date) {
  const { cutoffDay, deliveryDay } = DELIVERY_PLACEHOLDER;
  const d = new Date(cutoff);
  d.setDate(d.getDate() + ((deliveryDay - cutoffDay + 7) % 7 || 7));
  return d;
}
