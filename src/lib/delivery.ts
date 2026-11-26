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

/**
 * The delivery date (YYYY-MM-DD, UK calendar) an Order placed at `now` is for. Worked out in
 * London time, since the server runs in UTC and the Cut-off is a UK wall-clock time.
 */
export function deliveryDateFor(now: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(now)
      .map(p => [p.type, p.value]),
  );
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const { cutoffDay, cutoffHour, deliveryDay } = DELIVERY_PLACEHOLDER;
  // Days from today (London) to this week's Cut-off; past it, the next week's.
  let toCutoff = (cutoffDay - dow + 7) % 7;
  if (toCutoff === 0 && Number(parts.hour) >= cutoffHour) toCutoff = 7;
  const toDelivery = toCutoff + ((deliveryDay - cutoffDay + 7) % 7 || 7);
  const d = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + toDelivery));
  return d.toISOString().slice(0, 10);
}

/**
 * If a Cut-off has passed today (London time), the delivery date it closed, so the kitchen
 * lists can go out. Null on any other day or before the Cut-off hour.
 */
export function deliveryDateClosedToday(now: Date): string | null {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(now)
      .map(p => [p.type, p.value]),
  );
  const { cutoffDay, cutoffHour, deliveryDay } = DELIVERY_PLACEHOLDER;
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  if (dow !== cutoffDay || Number(parts.hour) < cutoffHour) return null;
  const toDelivery = (deliveryDay - cutoffDay + 7) % 7 || 7;
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + toDelivery)).toISOString().slice(0, 10);
}

/** A UK wall-clock time (London, with summer time) as a real instant. */
export function londonTime(year: number, month: number, day: number, hour: number) {
  // Start from that time read as UTC, then correct by London's offset at that moment.
  const guess = new Date(Date.UTC(year, month - 1, day, hour));
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hourCycle: 'h23', hour: '2-digit', day: '2-digit' }).formatToParts(guess).map(p => [p.type, p.value]),
  );
  const shown = Date.UTC(year, month - 1, Number(parts.day), Number(parts.hour));
  return new Date(guess.getTime() - (shown - guess.getTime()));
}

/** The Cut-off for an Order's delivery date: after it, cooking has started and it can't be cancelled. */
export function cutoffFor(deliveryDate: string) {
  const { cutoffDay, cutoffHour, deliveryDay } = DELIVERY_PLACEHOLDER;
  const [y, m, d] = deliveryDate.slice(0, 10).split('-').map(Number);
  const daysBefore = (deliveryDay - cutoffDay + 7) % 7 || 7;
  const day = new Date(Date.UTC(y, m - 1, d - daysBefore));
  return londonTime(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), cutoffHour);
}

export function deliveryAfter(cutoff: Date) {
  const { cutoffDay, deliveryDay } = DELIVERY_PLACEHOLDER;
  const d = new Date(cutoff);
  d.setDate(d.getDate() + ((deliveryDay - cutoffDay + 7) % 7 || 7));
  return d;
}
