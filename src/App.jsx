import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/Dashboard';
import { BanAppealsPage } from './pages/BanAppeals';
import { SettingsPage } from './pages/Settings';
import { ModerationPage } from './pages/Moderation';
import './App.css';

function App() {
  const path = window.location.pathname;

  const getPage = () => {
    switch (path) {
      case '/dashboard':
      case '/':
        return <DashboardPage />;
      case '/appeals':
        return <BanAppealsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/moderation':
        return <ModerationPage />;
      case '/shifts':
        return <DashboardPage />; // TODO: Dedicated shifts page
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider>
      <ProtectedRoute>
        {getPage()}
      </ProtectedRoute>
    </ThemeProvider>
  );
}

export default App;
