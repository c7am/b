import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from './ThemeProvider';
import '@m3e/react/nav-rail';
import '@m3e/react/toolbar';
import '@m3e/react/icon-button';
import '@m3e/react/snackbar';
import '@m3e/react/tabs';
import '@m3e/react/badge';
import '@m3e/react/avatar';

export const Layout = ({ children, currentPage }) => {
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'shifts', label: 'Shifts', icon: 'schedule', path: '/shifts' },
    { id: 'appeals', label: 'Ban Appeals', icon: 'description', path: '/appeals' },
    { id: 'moderation', label: 'Moderation', icon: 'security', path: '/moderation' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
  ];

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* NavRail - https://matraic.github.io/m3e/#/components/nav-rail.html */}
      <m3e-nav-rail
        style={{
          flexShrink: 0,
          borderRight: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        {navItems.map((item) => (
          <m3e-nav-rail-item
            key={item.id}
            label={item.label}
            icon={item.icon}
            selected={currentPage === item.id}
            onClick={() => {
              window.location.href = item.path;
            }}
          />
        ))}
      </m3e-nav-rail>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Toolbar - https://matraic.github.io/m3e/#/components/toolbar.html */}
        <m3e-toolbar
          style={{
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '500' }}>
            {navItems.find((i) => i.id === currentPage)?.label || 'Axiom'}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <m3e-icon-button
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </m3e-icon-button>
            <m3e-icon-button
              onClick={handleSignOut}
              title="Sign out"
            >
              ↘️
            </m3e-icon-button>
            <div style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
              {user?.username}
            </div>
          </div>
        </m3e-toolbar>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            backgroundColor: 'var(--md-sys-color-background)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
