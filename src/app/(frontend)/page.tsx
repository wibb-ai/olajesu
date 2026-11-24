import { connection } from 'next/server';
import CateringPage from '../../components/CateringPage';

export default async function Home() {
  // Render per request so the CSP nonce set in proxy.ts reaches Next.js's scripts.
  await connection();
  return <CateringPage />;
}
