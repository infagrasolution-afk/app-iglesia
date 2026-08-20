import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Container,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Button,
  Alert
} from '@mui/material';
import {
  VolunteerActivism as PrayerIcon,
  Campaign as AnnouncementIcon,
  Headphones as SermonIcon,
  Favorite as DonationIcon,
  AccountCircle as UserIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as BibleIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Shield as PastorIcon,
  Collections as GalleryIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission, getNotificationPermissionState } from '../../services/notificationService';

const DRAWER_WIDTH = 260;

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentRole, setRole, logout, isAuthenticated } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);

  const [showNotifPrompt, setShowNotifPrompt] = useState(() => {
    return getNotificationPermissionState() === 'default';
  });

  // If rendering login page, render full standalone screen without layout constraints
  if (location.pathname === '/login') {
    return children;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleMenuOpen = (event) => {
    setRoleAnchorEl(event.currentTarget);
  };

  const handleRoleMenuClose = (newRole) => {
    if (newRole) setRole(newRole);
    setRoleAnchorEl(null);
  };

  const handleLogout = () => {
    setRoleAnchorEl(null);
    logout();
    navigate('/login');
  };

  // Dynamic Navigation Items based on active role
  const isPastorOrAdmin = currentRole === 'ADMIN' || currentRole === 'PASTOR';

  const navItems = [
    { label: 'Muro de Oración', path: '/prayers', icon: <PrayerIcon /> },
    { label: 'Santa Biblia', path: '/bible', icon: <BibleIcon /> },
    { label: 'Galería Multimedia', path: '/gallery', icon: <GalleryIcon /> },
    { label: 'Anuncios y Boletín', path: '/announcements', icon: <AnnouncementIcon /> },
    { label: 'Sermones y Podcast', path: '/sermons', icon: <SermonIcon /> },
    { label: 'Diezmos y Ofrendas', path: '/donations', icon: <DonationIcon /> }
  ];

  if (isPastorOrAdmin) {
    navItems.push({
      label: 'Gestión de Usuarios',
      path: '/admin/users',
      icon: <AdminIcon sx={{ color: '#0284C7' }} />
    });
  }

  // Find active nav tab index
  const currentNavIndex = navItems.findIndex((item) => item.path === location.pathname);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Drawer Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E2E8F0' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo Iglesia"
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            objectFit: 'cover',
            mixBlendMode: 'multiply',
            border: '1px solid #E2E8F0'
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, color: '#0F172A' }}>
            Iglesia Restauración
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Portal Comunitario PWA
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isSelected}
                sx={{
                  borderRadius: '8px',
                  py: 1.2,
                  px: 2,
                  backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
                  color: isSelected ? '#0F172A' : '#475569',
                  fontWeight: isSelected ? 600 : 400,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isSelected ? '#0F172A' : '#64748B' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.92rem',
                    fontWeight: isSelected ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Drawer Footer / Active User & Role */}
      <Box sx={{ p: 2, backgroundColor: '#F8FAFC' }}>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1, fontWeight: 500 }}>
          USUARIO ACTIVO / ROL:
        </Typography>
        <Chip
          label={`${user?.full_name || user?.name || 'Invitado'} (${currentRole})`}
          color={currentRole === 'ADMIN' ? 'primary' : currentRole === 'PASTOR' ? 'secondary' : currentRole === 'LIDER' ? 'info' : 'default'}
          size="small"
          sx={{ width: '100%', justifyContent: 'center', px: 1, py: 1.8, borderRadius: '8px', fontWeight: 600 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (th) => th.zIndex.drawer + 1, backgroundColor: '#0F172A' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: { xs: 'none', sm: 'block' },
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              {navItems.find((n) => n.path === location.pathname)?.label || 'Iglesia Restauración'}
            </Typography>
          </Box>

          {/* User Profile & Role Switcher Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Opciones de Perfil y Rol">
              <Chip
                icon={<UserIcon sx={{ color: '#FFFFFF !important', fontSize: '1.1rem' }} />}
                label={`${user?.full_name?.split(' ')[0] || 'Usuario'} (${currentRole})`}
                onClick={handleRoleMenuOpen}
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              />
            </Tooltip>
          </Box>

          {/* Dropdown Popup Menu */}
          <Menu
            anchorEl={roleAnchorEl}
            open={Boolean(roleAnchorEl)}
            onClose={() => handleRoleMenuClose(null)}
            PaperProps={{ sx: { width: 240, mt: 1, p: 0.5 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                PERFIL DE USUARIO
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', mt: 0.5 }}>
                {user?.full_name || 'Invitado'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />

            {isPastorOrAdmin && (
              <MenuItem
                onClick={() => {
                  setRoleAnchorEl(null);
                  navigate('/admin/users');
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AdminIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Gestión de Usuarios" />
              </MenuItem>
            )}

            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
              <ListItemIcon sx={{ minWidth: 32, color: '#EF4444' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid #E2E8F0',
            },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          pt: { xs: 8, sm: 9 },
          pb: { xs: 9, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ p: 0 }}>
          {showNotifPrompt && (
            <Alert
              severity="info"
              icon={<NotificationIcon sx={{ color: '#0284C7' }} />}
              onClose={() => setShowNotifPrompt(false)}
              action={
                <Button
                  variant="contained"
                  size="small"
                  onClick={async () => {
                    await requestNotificationPermission();
                    setShowNotifPrompt(false);
                  }}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#0369A1' }
                  }}
                >
                  Activar
                </Button>
              }
              sx={{ mb: 2.5, borderRadius: 3, border: '1px solid #BAE6FD', backgroundColor: '#F0F9FF', color: '#0369A1', alignItems: 'center' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0369A1' }}>
                🔔 ¿Deseas recibir notificaciones de eventos y anuncios de la Iglesia en tu teléfono?
              </Typography>
            </Alert>
          )}
          {children}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            borderRadius: 0,
            borderTop: '1px solid #E2E8F0'
          }}
          elevation={3}
        >
          <BottomNavigation
            value={currentNavIndex !== -1 ? currentNavIndex : 0}
            onChange={(event, newValue) => {
              if (navItems[newValue]) navigate(navItems[newValue].path);
            }}
            showLabels
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label.split(' ')[0]}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
