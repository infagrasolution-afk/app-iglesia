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
  AutoAwesome as EmotionsIcon,
  School as DiscipleshipIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  Public as GlobalIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { SEDES_LIST, ALL_SEDES_OPTION, CHURCH_INFO } from '../../data/sedesData';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Muro de Oración', shortLabel: 'Oración', path: '/prayers', icon: <PrayerIcon /> },
  { label: 'Discipulado Bíblico', shortLabel: 'Discipulado', path: '/discipleship', icon: <DiscipleshipIcon sx={{ color: '#2563EB' }} /> },
  { label: 'Frasco de Emociones', shortLabel: 'Emociones', path: '/emotions', icon: <EmotionsIcon sx={{ color: '#F472B6' }} /> },
  { label: 'Santa Biblia (3 Versiones)', shortLabel: 'Biblia', path: '/bible', icon: <BibleIcon /> },
  { label: 'Nuestras Sedes', shortLabel: 'Sedes', path: '/sedes', icon: <LocationIcon sx={{ color: '#E11D48' }} /> },
  { label: 'Nuestra Iglesia', shortLabel: 'Nosotros', path: '/about', icon: <InfoIcon sx={{ color: '#059669' }} /> },
  { label: 'Anuncios y Boletín', shortLabel: 'Anuncios', path: '/announcements', icon: <AnnouncementIcon /> },
  { label: 'Sermones y Podcast', shortLabel: 'Sermones', path: '/sermons', icon: <SermonIcon /> },
  { label: 'Diezmos y Ofrendas', shortLabel: 'Diezmos', path: '/donations', icon: <DonationIcon /> }
];

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentRole, setRole, logout, currentSede, setCurrentSede, activeSedeDetails, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [sedeAnchorEl, setSedeAnchorEl] = useState(null);

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

  const handleSedeMenuOpen = (event) => {
    if (isAdmin) {
      setSedeAnchorEl(event.currentTarget);
    } else {
      navigate('/sedes');
    }
  };

  const handleSedeMenuClose = (newSedeId) => {
    if (newSedeId) setCurrentSede(newSedeId);
    setSedeAnchorEl(null);
  };

  // Find active nav tab index for bottom navigation
  const bottomNavItems = NAV_ITEMS.slice(0, 5);
  const currentNavIndex = bottomNavItems.findIndex((item) => item.path === location.pathname);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Drawer Header */}
      <Box sx={{ p: 2.2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E2E8F0' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Restauración Global"
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid #E2E8F0'
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2, color: '#0F172A' }}>
            {CHURCH_INFO.shortName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#83050B', fontWeight: 600 }}>
            «{CHURCH_INFO.slogan}»
          </Typography>
        </Box>
      </Box>

      {/* Active Sede Banner in Drawer */}
      <Box sx={{ px: 2, py: 1.2, backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
          {isAdmin ? 'VISTA DE SEDE (ADMIN):' : 'TU SEDE ASIGNADA:'}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3 }}>
          {currentSede === 'TODAS' ? <GlobalIcon sx={{ fontSize: 16, color: '#D97706' }} /> : <LocationIcon sx={{ fontSize: 16, color: '#83050B' }} />}
          {activeSedeDetails?.shortName || activeSedeDetails?.name || 'Restauración'}
        </Typography>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.4 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isSelected}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.8,
                  backgroundColor: isSelected ? 'rgba(131, 5, 11, 0.08)' : 'transparent',
                  color: isSelected ? '#83050B' : '#475569',
                  fontWeight: isSelected ? 700 : 500,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(131, 5, 11, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(131, 5, 11, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? '#83050B' : '#64748B' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500
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
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.8, fontWeight: 600, fontSize: '0.7rem' }}>
          MODO DE ROL ACTIVO:
        </Typography>
        <Chip
          label={`Rol: ${currentRole}`}
          color={currentRole === 'ADMIN' ? 'warning' : currentRole === 'LIDER' ? 'info' : 'default'}
          size="small"
          onClick={handleRoleMenuOpen}
          onDelete={handleRoleMenuOpen}
          deleteIcon={<ExpandMoreIcon />}
          sx={{ width: '100%', justifyContent: 'space-between', px: 1, py: 1.6, borderRadius: '8px', fontWeight: 600 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (th) => th.zIndex.drawer + 1, backgroundColor: '#0F172A' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 0.2 }}>
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
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: { xs: '0.96rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label || CHURCH_INFO.shortName}
            </Typography>
          </Box>

          {/* Right Controls: Sede Switcher + Role Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* SEDE INDICATOR / SWITCHER */}
            <Tooltip title={isAdmin ? "Cambiar sede o ver todas las sedes (Control Global)" : "Tu sede de Restauración Global"}>
              <Chip
                icon={currentSede === 'TODAS' ? <GlobalIcon sx={{ color: '#FCD34D !important', fontSize: '1rem' }} /> : <LocationIcon sx={{ color: '#F87171 !important', fontSize: '1rem' }} />}
                label={isMobile ? activeSedeDetails?.shortName || 'Sede' : `Sede: ${activeSedeDetails?.shortName || 'Global'}${isAdmin ? ' ▾' : ''}`}
                onClick={handleSedeMenuOpen}
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: isAdmin ? 'rgba(252, 211, 77, 0.5)' : 'rgba(255, 255, 255, 0.25)',
                  backgroundColor: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)'
                  }
                }}
              />
            </Tooltip>

            {/* Sede Dropdown Menu for Admin */}
            {isAdmin && (
              <Menu
                anchorEl={sedeAnchorEl}
                open={Boolean(sedeAnchorEl)}
                onClose={() => handleSedeMenuClose(null)}
                PaperProps={{
                  sx: {
                    width: 280,
                    mt: 1,
                    p: 0.5,
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
                    SELECCIONAR VISTA DE SEDE (ADMIN)
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem
                  onClick={() => handleSedeMenuClose('TODAS')}
                  selected={currentSede === 'TODAS'}
                  sx={{
                    py: 1,
                    '&.Mui-selected': { backgroundColor: 'rgba(245, 158, 11, 0.25) !important' }
                  }}
                >
                  <ListItemIcon sx={{ color: '#FCD34D', minWidth: 32 }}>
                    <GlobalIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Todas las Sedes (Nacional)"
                    secondary="El admin puede ver todo"
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}
                    secondaryTypographyProps={{ color: '#94A3B8', fontSize: '0.72rem' }}
                  />
                </MenuItem>
                <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                {SEDES_LIST.map((sede) => (
                  <MenuItem
                    key={sede.id}
                    onClick={() => handleSedeMenuClose(sede.id)}
                    selected={currentSede === sede.id}
                    sx={{
                      py: 1,
                      '&.Mui-selected': { backgroundColor: 'rgba(56, 189, 248, 0.2) !important' }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#38BDF8', minWidth: 32 }}>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={sede.name}
                      secondary={`${sede.city} • ${sede.scheduleShort}`}
                      primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.84rem' }}
                      secondaryTypographyProps={{ color: '#94A3B8', fontSize: '0.7rem' }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            )}

            {/* Role Menu Trigger */}
            <Tooltip title="Cambiar Rol de Usuario">
              <Chip
                icon={<UserIcon sx={{ color: '#FFFFFF !important', fontSize: '1rem' }} />}
                label={isMobile ? currentRole : `${user?.name || 'Usuario'} (${currentRole})`}
                onClick={handleRoleMenuOpen}
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
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
            PaperProps={{ sx: { width: 230, mt: 1, p: 0.5 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                MODO DE PRUEBA (ROLES)
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleRoleMenuClose('MIEMBRO')} selected={currentRole === 'MIEMBRO'}>
              <ListItemText primary="Miembro" secondary="Vista de discípulo en su sede" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleMenuClose('LIDER')} selected={currentRole === 'LIDER'}>
              <ListItemText primary="Líder" secondary="Discipulador de sede" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleMenuClose('ADMIN')} selected={currentRole === 'ADMIN'}>
              <ListItemText primary="Administrador / Pastor" secondary="Ve todas las sedes y evalúa todo" />
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

      {/* Desktop Persistent Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #E2E8F0' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: '56px', sm: '64px' },
          mb: { xs: '60px', md: 0 },
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container maxWidth="xl" disableGutters>
          {children}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation (Quick 5 links) */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={4}>
          <BottomNavigation
            showLabels
            value={currentNavIndex !== -1 ? currentNavIndex : false}
            onChange={(event, newValue) => {
              navigate(bottomNavItems[newValue].path);
            }}
            sx={{
              height: 58,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 0,
                p: '6px 0',
                color: '#64748B',
                '&.Mui-selected': {
                  color: '#83050B',
                  fontWeight: 700
                }
              }
            }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.shortLabel}
                icon={item.icon}
                sx={{
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.72rem',
                    '&.Mui-selected': { fontSize: '0.76rem' }
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
