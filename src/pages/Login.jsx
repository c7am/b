import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import '@m3e/react/button';

export const LoginPage = () => {
  const { setUser, isLoading, error, checkAuth } = useAuthStore();

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSignIn = () => {
    // Redirect to Express auth endpoint
    window.location.href = '/auth/login';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '600' }}>Axiom</h1>
        <p style={{ margin: '0', fontSize: '14px', opacity: 0.7 }}>Discord Staff Management Dashboard</p>
      </div>

      {error && (
        <div style={{ color: '#f24822', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(242, 72, 34, 0.1)' }}>
          {error}
        </div>
      )}

      <m3e-button variant="filled" onClick={handleSignIn}
        disabled={isLoading}
        style={{ '--md-sys-color-primary': '#5865F2' }}
      >Sign in with Discord</m3e-button>
    </div>
  );
};
