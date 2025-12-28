import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TakeawayPage from './pages/TakeawayPage.tsx';
import CateringPage from './pages/CateringPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TakeawayPage />} />
        <Route path="/catering" element={<CateringPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
