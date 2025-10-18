import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';
import { Navbar } from './components/custom-ui/navbar';
import ProfilePage from './pages/profile/index';
import { Toaster } from 'sonner';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Toaster richColors position="top-right" />
      <main className={isLoginPage ? 'h-screen' : 'h-[calc(100vh-80px)] mt-20'}>
        <Routes>
          <Route path="/" element={<Authenticate />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const [clientAppId] = useState<string>(
    '6utdbhYLD8U7NGbRbUAh4mi9X21CRqyQCy5bu3tdGiiz',
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
