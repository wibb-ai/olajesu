/** "Egusi Soup × 3, Jollof Rice, chicken" from a list with repeats. */
export function tally(names: string[]) {
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts].map(([n, c]) => (c > 1 ? `${n} × ${c}` : n)).join(', ');
}
