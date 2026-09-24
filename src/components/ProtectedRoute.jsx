import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { LoginPage } from '../pages/Login';
import '@m3e/react/loading-indicator';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <m3e-loading-indicator />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
};
