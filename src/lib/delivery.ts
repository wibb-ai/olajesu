/**
 * The delivery rules and the dates worked out from them. Pure functions, safe in the browser:
 * the rules themselves are the Master admin's "Delivery and collection" settings, loaded on
 * the server by `getDeliveryRules` (deliverySettings.ts) and passed in.
 *
 * All dates are UK calendar dates (YYYY-MM-DD) and every Cut-off is a UK wall-clock time,
 * since the server runs in UTC.
 */

export type DayRule = { day: number; cutoffDaysBefore: number; cutoffHour: number };
export type Area = { name: string; fee: number; freeOver: number | null; postcodes: string[] };
export type DeliveryRules = {
  draft: boolean;
  days: DayRule[];
  closed: string[];
  dailyMealLimit: number | null;
  areas: Area[];
  deliveryWindow: string;
  failedDelivery: string;
  collection: { enabled: boolean; address: string; times: string };
};
export type Fulfilment = 'delivery' | 'collection';

/** Used until the settings are saved for the first time: Saturday delivery, Cut-off Thursday 8pm. */
export const DEFAULT_DAY: DayRule = { day: 6, cutoffDaysBefore: 2, cutoffHour: 20 };
export const DEFAULT_RULES: DeliveryRules = {
  draft: true,
  days: [DEFAULT_DAY],
  closed: [],
  dailyMealLimit: null,
  areas: [],
  deliveryWindow: '',
  failedDelivery: '',
  collection: { enabled: false, address: '', times: '' },
};

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function londonParts(now: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(now)
      .map(x => [x.type, x.value]),
  );
  return { iso: `${p.year}-${p.month}-${p.day}`, dow: WEEKDAY.indexOf(p.weekday), hour: Number(p.hour) };
}

/** Today's date in the UK. */
export const londonDate = (now = new Date()) => londonParts(now).iso;

export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const weekdayOf = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay();

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

const ruleFor = (rules: DeliveryRules, iso: string) => rules.days.find(r => r.day === weekdayOf(iso));

/**
 * The Cut-off for a delivery date: after it, cooking has started, so it can't be ordered for or
 * cancelled. A date that is no longer a delivery day keeps the default rule.
 */
export function cutoffFor(rules: DeliveryRules, deliveryDate: string) {
  const rule = ruleFor(rules, deliveryDate) ?? DEFAULT_DAY;
  const [y, m, d] = addDays(deliveryDate, -rule.cutoffDaysBefore).split('-').map(Number);
  return londonTime(y, m, d, rule.cutoffHour);
}

/** A delivery date still open for Orders, with its Cut-off. */
export type OpenDate = { date: string; cutoff: string };

/** The next delivery dates whose Cut-off hasn't passed, skipping closed dates, soonest first. */
export function openDates(rules: DeliveryRules, now = new Date(), count = 4): OpenDate[] {
  const today = londonDate(now);
  const closed = new Set(rules.closed);
  const out: OpenDate[] = [];
  for (let i = 0; i <= 42 && out.length < count; i++) {
    const date = addDays(today, i);
    if (!ruleFor(rules, date) || closed.has(date)) continue;
    const cutoff = cutoffFor(rules, date);
    if (cutoff > now) out.push({ date, cutoff: cutoff.toISOString() });
  }
  return out;
}

/** Delivery dates whose Cut-off fell after `from` and by `to`: their kitchen lists are due. */
export function cutoffsBetween(rules: DeliveryRules, from: Date, to: Date) {
  const today = londonDate(to);
  const closed = new Set(rules.closed);
  const out: string[] = [];
  for (let i = -7; i <= 8; i++) {
    const date = addDays(today, i);
    if (!ruleFor(rules, date) || closed.has(date)) continue;
    const cutoff = cutoffFor(rules, date);
    if (cutoff > from && cutoff <= to) out.push(date);
  }
  return out;
}

/** "SW1A 1AA" style, or null if it isn't a UK postcode. */
export function normalisePostcode(input: string) {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) return null;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

/** The delivery area a postcode is in, if any. "M14" matches only M14; "M" matches every M postcode. */
export function areaFor(rules: Pick<DeliveryRules, 'areas'>, postcode: string): Area | null {
  const pc = normalisePostcode(postcode);
  if (!pc) return null;
  const outward = pc.split(' ')[0];
  return (
    rules.areas.find(a =>
      a.postcodes.some(entry => (/^[A-Z]+$/.test(entry) ? outward.startsWith(entry) && /^\d/.test(outward.slice(entry.length)) : outward === entry)),
    ) ?? null
  );
}

/** The delivery fee in pounds for an area and an Order's Meals total. */
export const deliveryFee = (area: Area, subtotal: number) => (area.freeOver !== null && subtotal >= area.freeOver ? 0 : area.fee);

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleString('en-GB', { timeZone: 'Europe/London', ...opts });
const hourLabel = (d: Date) => {
  const h = Number(fmt(d, { hour: '2-digit', hourCycle: 'h23' }));
  return h === 0 ? 'midnight' : h === 12 ? '12 noon' : h < 12 ? `${h}am` : `${h - 12}pm`;
};

/** "Thursday 3 December, 8pm" */
export const cutoffLabel = (cutoff: Date | string) => {
  const d = new Date(cutoff);
  return `${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${hourLabel(d)}`;
};
/** "Thu 8pm" */
export const shortCutoffLabel = (cutoff: Date | string) => {
  const d = new Date(cutoff);
  return `${fmt(d, { weekday: 'short' })} ${hourLabel(d)}`;
};
/** "Saturday 5 December" */
export const dateLabel = (iso: string) => fmt(new Date(`${iso.slice(0, 10)}T12:00:00Z`), { weekday: 'long', day: 'numeric', month: 'long' });
/** "Sat 5 Dec" */
export const shortDateLabel = (iso: string) => fmt(new Date(`${iso.slice(0, 10)}T12:00:00Z`), { weekday: 'short', day: 'numeric', month: 'short' });
