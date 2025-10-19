import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import HomePage from './pages/home';
import FollowingsPage from './pages/followings';
import Authenticate from './pages/login/Authenticate';
import RegisterPage from './pages/register';
import { Navbar } from './components/custom-ui/navbar';
import ProfilePage from './pages/profile/index';
import UserProfilePage from './pages/user/index';
import { Toaster } from 'sonner';
import { GeneralContextProvider } from './contexts/general-context';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConnectorContext } from './contexts/connector-context';

function AppContent() {
  const location = useLocation();
  const isPublicPage =
    location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!isPublicPage && <Navbar />}
      <Toaster richColors position="top-right" />
      <main
        className={isPublicPage ? 'h-screen' : 'h-[calc(100vh-80px)] mt-20'}
      >
        <Routes>
          <Route path="/" element={<Authenticate />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/followings"
            element={
              <ProtectedRoute>
                <FollowingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const [clientAppId] = useState<string>(
    'BrCj5KY47rz5UMTpdxpsqZieUqGeWq8uEgaiW3suGgaL',
  );

  return (
    <ConnectorContext>
      <CalimeroProvider
        clientApplicationId={clientAppId}
        applicationPath={window.location.pathname || '/'}
        mode={AppMode.MultiContext}
      >
        <GeneralContextProvider>
          <BrowserRouter basename="/">
            <AppContent />
          </BrowserRouter>
        </GeneralContextProvider>
      </CalimeroProvider>
    </ConnectorContext>
  );
}
