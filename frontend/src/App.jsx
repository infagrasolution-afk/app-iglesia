import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button, Paper } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por AppErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
              Actualizando vista del módulo...
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
              Se detectó una actualización en la interfaz. Haz clic abajo para recargar la vista limpiamente.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              sx={{ backgroundColor: '#83050B', color: '#FFFFFF', fontWeight: 700, borderRadius: 2 }}
            >
              Recargar Ahora
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

import Login from './pages/Login';
import PrayerWall from './pages/PrayerWall';
import Bible from './pages/Bible';
import Announcements from './pages/Announcements';
import Sermons from './pages/Sermons';
import Donations from './pages/Donations';
import Emotions from './pages/Emotions';
import Discipleship from './pages/Discipleship';
import Sedes from './pages/Sedes';
import AboutUs from './pages/AboutUs';
import Members from './pages/Members';

function ModuleGuard({ moduleKey, fallbackPath, children }) {
  const { canViewModule } = useAuth();
  if (!canViewModule(moduleKey)) {
    return <Navigate to={fallbackPath} replace />;
  }
  return children;
}

function ProtectedAppRoutes() {
  const { isAuthenticated, allowedModules } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const firstAllowedPath = `/${(allowedModules && allowedModules[0]) || 'prayers'}`;

  return (
    <AppLayout>
      <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to={firstAllowedPath} replace />} />
          <Route path="/prayers" element={<ModuleGuard moduleKey="prayers" fallbackPath={firstAllowedPath}><PrayerWall /></ModuleGuard>} />
          <Route path="/members" element={<ModuleGuard moduleKey="members" fallbackPath={firstAllowedPath}><Members /></ModuleGuard>} />
          <Route path="/miembros" element={<Navigate to="/members" replace />} />
          <Route path="/discipleship" element={<ModuleGuard moduleKey="discipleship" fallbackPath={firstAllowedPath}><Discipleship /></ModuleGuard>} />
          <Route path="/discipulado" element={<Navigate to="/discipleship" replace />} />
          <Route path="/emotions" element={<ModuleGuard moduleKey="emotions" fallbackPath={firstAllowedPath}><Emotions /></ModuleGuard>} />
          <Route path="/frasco" element={<Navigate to="/emotions" replace />} />
          <Route path="/bible" element={<ModuleGuard moduleKey="bible" fallbackPath={firstAllowedPath}><Bible /></ModuleGuard>} />
          <Route path="/sedes" element={<ModuleGuard moduleKey="sedes" fallbackPath={firstAllowedPath}><Sedes /></ModuleGuard>} />
          <Route path="/about" element={<ModuleGuard moduleKey="about" fallbackPath={firstAllowedPath}><AboutUs /></ModuleGuard>} />
          <Route path="/nosotros" element={<Navigate to="/about" replace />} />
          <Route path="/announcements" element={<ModuleGuard moduleKey="announcements" fallbackPath={firstAllowedPath}><Announcements /></ModuleGuard>} />
          <Route path="/sermons" element={<ModuleGuard moduleKey="sermons" fallbackPath={firstAllowedPath}><Sermons /></ModuleGuard>} />
          <Route path="/donations" element={<ModuleGuard moduleKey="donations" fallbackPath={firstAllowedPath}><Donations /></ModuleGuard>} />
          <Route path="*" element={<Navigate to={firstAllowedPath} replace />} />
        </Routes>
      </AppErrorBoundary>
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
