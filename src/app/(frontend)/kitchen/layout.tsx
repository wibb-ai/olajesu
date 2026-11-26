import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Kitchen | OlaJesu', robots: { index: false, follow: false } };

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return children;
}
