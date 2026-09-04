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
  Tooltip
} from '@mui/material';
import {
  VolunteerActivism as PrayerIcon,
  Campaign as AnnouncementIcon,
  Headphones as SermonIcon,
  Favorite as DonationIcon,
  AccountCircle as UserIcon,
  Menu as MenuIcon,
  Church as ChurchIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as BibleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Muro de Oración', path: '/prayers', icon: <PrayerIcon /> },
  { label: 'Santa Biblia (RVR1960)', path: '/bible', icon: <BibleIcon /> },
  { label: 'Anuncios y Boletín', path: '/announcements', icon: <AnnouncementIcon /> },
  { label: 'Sermones y Podcast', path: '/sermons', icon: <SermonIcon /> },
  { label: 'Diezmos y Ofrendas', path: '/donations', icon: <DonationIcon /> }
];

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentRole, setRole, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);

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

  // Find active nav tab index
  const currentNavIndex = NAV_ITEMS.findIndex((item) => item.path === location.pathname);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Drawer Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E2E8F0' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo Iglesia"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            objectFit: 'cover',
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
        {NAV_ITEMS.map((item) => {
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

      {/* Drawer Footer / User Role Info */}
      <Box sx={{ p: 2, backgroundColor: '#F8FAFC' }}>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1, fontWeight: 500 }}>
          MODO DE ROL ACTIVO (DEMO):
        </Typography>
        <Chip
          label={`Rol: ${currentRole}`}
          color={currentRole === 'ADMIN' ? 'primary' : currentRole === 'LIDER' ? 'info' : 'default'}
          size="small"
          onClick={handleRoleMenuOpen}
          onDelete={handleRoleMenuOpen}
          deleteIcon={<ExpandMoreIcon />}
          sx={{ width: '100%', justifyContent: 'space-between', px: 1, py: 1.8, borderRadius: '8px' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (th) => th.zIndex.drawer + 1 }}>
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
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label || 'Portal Iglesia Restauración'}
            </Typography>
          </Box>

          {/* Role Switcher Menu Trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Cambiar Rol de Demostración">
              <Chip
                icon={<UserIcon sx={{ color: '#FFFFFF !important', fontSize: '1.1rem' }} />}
                label={`${user?.name || 'Usuario'} (${currentRole})`}
                onClick={handleRoleMenuOpen}
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              />
            </Tooltip>
          </Box>

          {/* Role Selector Popup Menu */}
          <Menu
            anchorEl={roleAnchorEl}
            open={Boolean(roleAnchorEl)}
            onClose={() => handleRoleMenuClose(null)}
            PaperProps={{ sx: { width: 220, mt: 1, p: 0.5 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                SELECCIONAR ROL
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleRoleMenuClose('MIEMBRO')} selected={currentRole === 'MIEMBRO'}>
              <ListItemText primary="Miembro" secondary="Vista estándar de miembros" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleMenuClose('LIDER')} selected={currentRole === 'LIDER'}>
              <ListItemText primary="Líder" secondary="Acceso a peticiones confidenciales" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleMenuClose('ADMIN')} selected={currentRole === 'ADMIN'}>
              <ListItemText primary="Administrador / Pastor" secondary="Gestión total y publicaciones" />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                handleRoleMenuClose(null);
                logout();
                navigate('/login');
              }}
              sx={{ color: '#EF4444' }}
            >
              <ListItemIcon sx={{ color: '#EF4444', minWidth: 32 }}>
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
          <Toolbar /> {/* Spacer for AppBar */}
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer (Temporary Slide-in) */}
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

      {/* Main Content Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          pt: { xs: 8, sm: 9 },
          pb: { xs: 9, md: 4 }, // Space at bottom for mobile BottomNavigation
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ p: 0 }}>
          {children}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation Bar (Fija abajo) */}
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
              navigate(NAV_ITEMS[newValue].path);
            }}
            showLabels
          >
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label.split(' ')[0]} // Clean short label
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
