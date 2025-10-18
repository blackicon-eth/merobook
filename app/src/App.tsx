import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';
import { Navbar } from './components/custom-ui/navbar';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main className={isLoginPage ? 'h-screen' : 'h-[calc(100vh-80px)] mt-20'}>
        <Routes>
          <Route path="/" element={<Authenticate />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const [clientAppId] = useState<string>(
    'B8To1w9hAP2PsbYsCZ6Bzzj6L4eBUcMGiyE2x2K2MPge',
  );

  return (
    <CalimeroProvider
      clientApplicationId={clientAppId}
      applicationPath={window.location.pathname || '/'}
      mode={AppMode.MultiContext}
    >
      <ToastProvider>
        <BrowserRouter basename="/">
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </CalimeroProvider>
  );
}
