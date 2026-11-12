import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Badge,
  Alert,
  Snackbar,
  Stack,
  Card,
  CardContent,
  InputAdornment
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
  People as PeopleIcon,
  Logout as LogoutIcon,
  LockReset as LockResetIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { SEDES_LIST, ALL_SEDES_OPTION, CHURCH_INFO } from '../../data/sedesData';
import { authAPI } from '../../services/api';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Muro de Oración', shortLabel: 'Oración', path: '/prayers', icon: <PrayerIcon /> },
  { label: 'Directorio de Miembros', shortLabel: 'Directorio', path: '/members', icon: <PeopleIcon sx={{ color: '#0D9488' }} /> },
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
  const {
    user,
    currentRole,
    setRole,
    logout,
    currentSede,
    setCurrentSede,
    activeSedeDetails,
    isAdmin,
    isSuperAdmin,
    canManageAllSedes,
    canViewModule,
    mustChangePassword,
    changePassword
  } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [sedeAnchorEl, setSedeAnchorEl] = useState(null);

  // Mandatory Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');

  // Superadmin Password Reset Approval State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetRequests, setResetRequests] = useState([]);
  const [loadingResets, setLoadingResets] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const loadResetRequests = async () => {
    if (!canManageAllSedes) return;
    setLoadingResets(true);
    try {
      const data = await authAPI.getResetRequests();
      setResetRequests(Array.isArray(data) ? data : []);
    } catch {
      setResetRequests([]);
    } finally {
      setLoadingResets(false);
    }
  };

  useEffect(() => {
    if (canManageAllSedes) {
      loadResetRequests();
    }
  }, [canManageAllSedes]);

  const handleApproveReset = async (requestId, approved = true) => {
    setResolvingId(requestId);
    try {
      await authAPI.approveResetRequest(requestId, approved ? 'APROBADO' : 'RECHAZADO', '123');
      await loadResetRequests();
      setPassSuccessMsg(approved ? 'Solicitud aprobada con clave temporal "123".' : 'Solicitud rechazada.');
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    setSavingPass(true);
    try {
      await changePassword(newPassword);
      setPassSuccessMsg('¡Contraseña cambiada y encriptada exitosamente en la base de datos!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setSavingPass(false);
    }
  };


  // Filter navigation items according to the modules allowed for this user
  const visibleNavItems = NAV_ITEMS.filter((item) => canViewModule(item.path));

  // Find active nav tab index for bottom navigation
  const bottomNavItems = visibleNavItems.slice(0, 5);
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
        {visibleNavItems.map((item) => {
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
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.9rem', sm: '1.15rem' },
                letterSpacing: '-0.01em',
                maxWidth: { xs: '130px', sm: '240px', md: 'none' },
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isMobile
                ? (NAV_ITEMS.find((n) => n.path === location.pathname)?.shortLabel || CHURCH_INFO.shortName)
                : (NAV_ITEMS.find((n) => n.path === location.pathname)?.label || CHURCH_INFO.shortName)}
            </Typography>
          </Box>

          {/* Right Controls: Sede Switcher + Role Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, sm: 1 } }}>
            {/* SEDE INDICATOR / SWITCHER */}
            <Tooltip title={isAdmin ? "Cambiar sede o ver todas las sedes (Control Global)" : "Tu sede de Restauración Global"}>
              <Chip
                size={isMobile ? "small" : "medium"}
                icon={currentSede === 'TODAS' ? <GlobalIcon sx={{ color: '#FCD34D !important', fontSize: '0.9rem' }} /> : <LocationIcon sx={{ color: '#F87171 !important', fontSize: '0.9rem' }} />}
                label={isMobile ? (activeSedeDetails?.badge || activeSedeDetails?.shortName || 'Sede') : `Sede: ${activeSedeDetails?.shortName || 'Global'}${isAdmin ? ' ▾' : ''}`}
                onClick={handleSedeMenuOpen}
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: isAdmin ? 'rgba(252, 211, 77, 0.5)' : 'rgba(255, 255, 255, 0.25)',
                  backgroundColor: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  height: { xs: 26, sm: 32 },
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

            {/* Superadmin Password Reset Requests Button */}
            {canManageAllSedes && (
              <Tooltip title="Solicitudes de Recuperación de Claves (Superadmin)">
                <IconButton
                  size="small"
                  onClick={() => {
                    loadResetRequests();
                    setResetModalOpen(true);
                  }}
                  sx={{
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  <Badge
                    badgeContent={resetRequests.filter((r) => r.status === 'PENDIENTE').length}
                    color="warning"
                  >
                    <LockResetIcon fontSize="small" sx={{ color: '#FCD34D' }} />
                  </Badge>
                </IconButton>
              </Tooltip>
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
            PaperProps={{ sx: { width: 250, mt: 1, p: 0.5 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                {user?.full_name || user?.name || 'Miembro'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                Rol activo: {currentRole}
              </Typography>
            </Box>
            {(isSuperAdmin || user?.is_owner || user?.is_global_pastor) && (
              <>
                <Divider />
                <MenuItem onClick={() => handleRoleMenuClose('SUPER_ADMIN')} selected={currentRole === 'SUPER_ADMIN'}>
                  <ListItemText primary="👑 Dueño de la App (Super Admin)" secondary="Control global supremo y asignación de admins" />
                </MenuItem>
                <MenuItem onClick={() => handleRoleMenuClose('ADMIN_PRINCIPAL')} selected={currentRole === 'ADMIN_PRINCIPAL'}>
                  <ListItemText primary="🏛️ Pastor Principal (Admin General)" secondary="Supervisión nacional de todas las sedes" />
                </MenuItem>
                <MenuItem onClick={() => handleRoleMenuClose('ADMIN_SEDE')} selected={currentRole === 'ADMIN_SEDE'}>
                  <ListItemText primary="🏢 Administrador de Sede" secondary="Liderazgo administrativo de sede" />
                </MenuItem>
                <MenuItem onClick={() => handleRoleMenuClose('LIDER')} selected={currentRole === 'LIDER'}>
                  <ListItemText primary="👥 Líder Ministerial" secondary="Discipulador y consejero" />
                </MenuItem>
                <MenuItem onClick={() => handleRoleMenuClose('MIEMBRO')} selected={currentRole === 'MIEMBRO'}>
                  <ListItemText primary="🌱 Miembro / Discípulo" secondary="Vista de miembro en su sede" />
                </MenuItem>
              </>
            )}
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
          p: { xs: 1.5, sm: 2.5, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: '56px', sm: '64px' },
          mb: { xs: '68px', md: 0 },
          minHeight: 'calc(100vh - 64px)',
          overflowX: 'hidden'
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ overflowX: 'hidden' }}>
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

      {/* MODAL OBLIGATORIO: CAMBIO DE CONTRASEÑA EN EL PRIMER INGRESO */}
      <Dialog
        open={Boolean(mustChangePassword)}
        disableEscapeKeyDown
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            border: '2px solid #F59E0B'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <KeyIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
          Cambio Obligatorio de Contraseña
        </DialogTitle>
        <form onSubmit={handleSaveNewPassword}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
              <Typography sx={{ color: '#92400E', fontWeight: 700, fontSize: '0.86rem' }}>
                ¡Bienvenido(a), {user?.full_name || user?.name || 'Hermano(a)'}!
              </Typography>
              <Typography sx={{ color: '#B45309', fontSize: '0.8rem', mt: 0.4, lineHeight: 1.5 }}>
                Por motivos de seguridad de tu cuenta ministerial y de la congregación, debes definir tu propia contraseña privada antes de continuar.
              </Typography>
            </Box>

            {passError && (
              <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.84rem' }}>
                {passError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              size="small"
              type={showNewPass ? 'text' : 'password'}
              label="Nueva Contraseña Privada *"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPassError('');
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              type={showNewPass ? 'text' : 'password'}
              label="Confirmar Nueva Contraseña *"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPassError('');
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={savingPass || !newPassword || !confirmPassword}
              sx={{
                borderRadius: '50px',
                py: 1.2,
                fontWeight: 800,
                backgroundColor: '#0F172A',
                '&:hover': { backgroundColor: '#1E293B' }
              }}
            >
              {savingPass ? 'Guardando en la Base de Datos...' : '🔐 Guardar y Proteger mi Cuenta'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL: PANEL DE SOLICITUDES DE CONTRASEÑA PARA SUPERADMINS */}
      <Dialog
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <LockResetIcon sx={{ color: '#F59E0B' }} />
          Solicitudes de Recuperación de Contraseñas
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '65vh', overflowY: 'auto' }}>
          <Box sx={{ p: 1.8, borderRadius: '14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography sx={{ color: '#1E40AF', fontSize: '0.84rem', fontWeight: 700 }}>
              Panel de Verificación de Superadmins
            </Typography>
            <Typography sx={{ color: '#3B82F6', fontSize: '0.78rem', mt: 0.3 }}>
              Al aprobar una solicitud, se restablecerá la contraseña temporal a <strong>123</strong> y al usuario se le exigirá obligatoriamente cambiarla en cuanto ingrese.
            </Typography>
          </Box>

          {loadingResets ? (
            <Typography sx={{ textAlign: 'center', py: 3, color: '#64748B' }}>Cargando solicitudes desde Neon...</Typography>
          ) : resetRequests.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
              <Typography variant="h6" sx={{ color: '#334155', fontWeight: 700 }}>
                No hay solicitudes pendientes
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                Todas las cuentas están activas y al día.
              </Typography>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {resetRequests.map((req) => (
                <Card
                  key={req.id}
                  sx={{
                    borderRadius: '16px',
                    border: req.status === 'PENDIENTE' ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                    backgroundColor: req.status === 'PENDIENTE' ? '#FFFBEB' : '#FFFFFF',
                    p: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                        {req.full_name || req.identifier}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                        Usuario / Correo: <strong>{req.identifier}</strong>
                      </Typography>
                      {req.phone && (
                        <Typography sx={{ color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>
                          📱 WhatsApp: {req.phone}
                        </Typography>
                      )}
                      {req.sede_id && (
                        <Chip label={`Sede: ${req.sede_id}`} size="small" sx={{ mt: 0.6, fontSize: '0.72rem', fontWeight: 700 }} />
                      )}
                    </Box>
                    <Chip
                      label={req.status}
                      color={req.status === 'APROBADO' ? 'success' : req.status === 'PENDIENTE' ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  {req.status === 'PENDIENTE' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={resolvingId === req.id}
                        onClick={() => handleApproveReset(req.id, false)}
                        sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={resolvingId === req.id}
                        onClick={() => handleApproveReset(req.id, true)}
                        sx={{
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 700,
                          backgroundColor: '#10B981',
                          '&:hover': { backgroundColor: '#059669' }
                        }}
                      >
                        {resolvingId === req.id ? 'Aprobando...' : '✓ Aprobar (Clave temporal 123)'}
                      </Button>
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetModalOpen(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Success Notification */}
      <Snackbar
        open={Boolean(passSuccessMsg)}
        autoHideDuration={4000}
        onClose={() => setPassSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {passSuccessMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

