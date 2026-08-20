import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import PrayerWall from './pages/PrayerWall';
import Bible from './pages/Bible';
import Announcements from './pages/Announcements';
import Sermons from './pages/Sermons';
import Donations from './pages/Donations';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import Gallery from './pages/Gallery';

// Protected Route Component for All App Pages
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected Route Component for Admin & Pastor Pages
function ProtectedAdminRoute({ children }) {
  const { currentRole, isAuthenticated } = useAuth();
  if (!isAuthenticated || (currentRole !== 'ADMIN' && currentRole !== 'PASTOR')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/prayers" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/prayers" element={<ProtectedRoute><PrayerWall /></ProtectedRoute>} />
              <Route path="/bible" element={<ProtectedRoute><Bible /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/sermons" element={<ProtectedRoute><Sermons /></ProtectedRoute>} />
              <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
              <Route
                path="/admin/users"
                element={
                  <ProtectedAdminRoute>
                    <AdminUsers />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/prayers" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
