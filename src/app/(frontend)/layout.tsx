import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const title = 'OlaJesu — Authentic Nigerian Cuisine in Manchester';

export const metadata: Metadata = {
  metadataBase: new URL('https://olajesu.com'),
  title,
  description:
    'Authentic Nigerian ghost kitchen in Manchester. Jollof rice, egusi soup, and more — cooked from scratch, delivered to your door. Catering for events across Greater Manchester.',
  icons: { icon: { url: '/olajesu_logo.png', type: 'image/png' } },
  openGraph: {
    type: 'website',
    url: 'https://olajesu.com/',
    title,
    description:
      'Food that carries the flavour of home. Authentic Nigerian cuisine cooked from scratch, delivered across Manchester. Premium catering for your events.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OlaJesu — Authentic Nigerian Food, Manchester',
    description: 'Authentic Nigerian ghost kitchen in Manchester. Jollof rice, egusi soup, and more.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
