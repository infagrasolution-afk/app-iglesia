import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import PrayerWall from './pages/PrayerWall';
import Bible from './pages/Bible';
import Announcements from './pages/Announcements';
import Sermons from './pages/Sermons';
import Donations from './pages/Donations';
import Emotions from './pages/Emotions';

function ProtectedAppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/prayers" replace />} />
        <Route path="/prayers" element={<PrayerWall />} />
        <Route path="/emotions" element={<Emotions />} />
        <Route path="/frasco" element={<Navigate to="/emotions" replace />} />
        <Route path="/bible" element={<Bible />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="*" element={<Navigate to="/prayers" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedAppRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
