import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import CateringPage from '../../../components/CateringPage';
import { shopEnabled } from '../../../lib/shop';

const title = 'Nigerian catering in Manchester | OlaJesu';
const description =
  'Authentic Nigerian catering for events across Greater Manchester: jollof, egusi, small chops and more, cooked from scratch. Ask for a quote.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/catering' },
  openGraph: { title, description, url: '/catering' },
};

/** Catering's own page (site-restructure ticket), unchanged from today's homepage, enquiry form included. */
export default async function Catering() {
  await connection();
  // Until ordering goes live, catering is the homepage. A temporary redirect, so browsers
  // don't remember it once /catering becomes catering's own page.
  if (!shopEnabled()) redirect('/');
  return <CateringPage />;
}
