import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoadingUser } = useGeneralContext();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoadingUser) return;

    // If user is not registered, redirect to register page
    if (!currentUser) {
      navigate('/register', {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [currentUser, isLoadingUser, navigate, location]);

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show nothing if user is not registered (will redirect)
  if (!currentUser) {
    return null;
  }

  // User is registered, show the protected content
  return <>{children}</>;
}
