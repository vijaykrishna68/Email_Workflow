// frontend/src/components/ProtectedRoute.tsx
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute (children-wrapper version)
 * - Accepts children (so <ProtectedRoute><Page/></ProtectedRoute> continues to work)
 * - If user exists in store -> render children
 * - If no user, but URL contains ?user=... -> parse & hydrate store, then render children
 * - Otherwise redirect to /login
 */
const ProtectedRoute: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run this once per mount to check for a `user` query param
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');

    if (!user && userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        // hydrate Zustand store directly (sync)
        useAuthStore.getState().updateUser(parsed);

        // remove query param without reloading
        const cleanUrl = window.location.origin + '/dashboard';
        window.history.replaceState({}, '', cleanUrl);
      } catch (err) {
        // parsing failed — ignore and continue to redirect to login
        console.error('ProtectedRoute: failed to parse user param', err);
      }
    }

    // Done checking the query param
    setIsChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // While we are checking the URL param, don't redirect yet
  if (isChecking) return null;

  // If user exists (either from store or we hydrated it above) -> render children
  if (useAuthStore.getState().user) {
    return <>{children}</>;
  }

  // Not authenticated -> redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
