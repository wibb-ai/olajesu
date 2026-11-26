import type { Metadata } from 'next';
import { connection } from 'next/server';

import CateringPage from '../../components/CateringPage';
import { ShopHome } from '../../components/shop/ShopHome';
import { ShopShell } from '../../components/shop/ShopShell';
import { getMenu } from '../../lib/menu';
import { shopEnabled } from '../../lib/shop';

export async function generateMetadata(): Promise<Metadata> {
  if (!shopEnabled()) return {};
  const title = 'Nigerian meal prep in Manchester | OlaJesu';
  const description =
    'Jollof, egusi, efo riro and more: 500 g Nigerian home-cooked Meals, cooked fresh in Manchester and delivered chilled. Save with a Pack of 5 or 10.';
  return { title, description, alternates: { canonical: '/' }, openGraph: { title, description, url: '/' }, twitter: { title, description } };
}

export default async function Home() {
  // Render per request so the CSP nonce set in proxy.ts reaches Next.js's scripts,
  // and so menu changes in the dashboard show straight away.
  await connection();
  // Catering stays on the homepage in production until ordering goes live.
  if (!shopEnabled()) return <CateringPage />;
  const menu = await getMenu();
  return (
    <ShopShell menu={menu}>
      <ShopHome />
    </ShopShell>
  );
}
