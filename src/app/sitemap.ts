import type { MetadataRoute } from 'next';
import { connection } from 'next/server';

import { getMenu } from '../lib/menu';
import { shopEnabled } from '../lib/shop';

const BASE = 'https://olajesu.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  if (!shopEnabled()) return [{ url: `${BASE}/` }];
  const menu = await getMenu();
  return [{ url: `${BASE}/` }, { url: `${BASE}/catering` }, ...menu.meals.map(m => ({ url: `${BASE}/meals/${m.slug}` }))];
}
