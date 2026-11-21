import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import CateringPage from './pages/CateringPage.tsx';
import './index.css';

// Single-page site: every path serves this page (see vercel.json rewrites/redirects).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CateringPage />
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);
