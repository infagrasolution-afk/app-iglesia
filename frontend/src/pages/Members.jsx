import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Avatar,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  School as DiscipleshipIcon,
  Lock as LockIcon,
  Public as GlobalIcon,
  Shield as ShieldIcon,
  VolunteerActivism as MinistryIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  FilterList as FilterIcon,
  VerifiedUser as VerifiedIcon,
  ContentCopy as CopyIcon,
  Key as KeyIcon,
  DeleteOutline as DeleteIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { useAuth, APP_MODULES_CATALOG, DEFAULT_MEMBER_MODULES, ALL_MODULE_KEYS } from '../context/AuthContext';
import { SEDES_LIST } from '../data/sedesData';
import { membersAPI } from '../services/api';

function generateUsernameFromName(fullName) {
  if (!fullName) return '';
  const norm = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const titles = new Set([
    'pastor', 'pastora', 'apostol', 'profeta', 'evangelista',
    'maestro', 'ing', 'dr', 'dra', 'lic', 'hno', 'hna', 'hermano', 'hermana'
  ]);
  const words = norm
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w && !titles.has(w));
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 16);
  if (words.length === 2) return (words[0][0] + words[1]).slice(0, 18);
  return (words[0][0] + words[2]).slice(0, 18);
}

export default function Members() {
  const { user, currentRole, currentSede, canManageAllSedes, isSedeAdmin, canCreateMembers, isAdmin } = useAuth();

  // Selected Sede filter in directory view
  const [selectedSedeFilter, setSelectedSedeFilter] = useState(() => {
    if (canManageAllSedes) return 'TODAS';
    return user?.sede || 'maracay';
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('ALL');

  // Modal State for New Member
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal State for Welcome / WhatsApp notification
  const [welcomeModalData, setWelcomeModalData] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Modal State for Editing Allowed Modules of an existing member
  const [modulesEditMember, setModulesEditMember] = useState(null);
  const [modulesEditList, setModulesEditList] = useState(DEFAULT_MEMBER_MODULES);
  const [savingModules, setSavingModules] = useState(false);

  // Form State
  const defaultFormSede = canManageAllSedes
    ? (selectedSedeFilter !== 'TODAS' ? selectedSedeFilter : 'plaza-venezuela')
    : (user?.sede || 'maracay');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    sede_id: defaultFormSede,
    role: 'MIEMBRO',
    ministry: 'Grupo de Conexión',
    baptism_status: 'Bautizado',
    discipleship_status: 'En formación',
    allowed_modules: DEFAULT_MEMBER_MODULES,
    access_username: '',
    initial_password: '123'
  });

  // Load members on mount and filter change
  useEffect(() => {
    loadMembersData();
  }, [selectedSedeFilter]);

  const loadMembersData = async () => {
    setLoading(true);
    try {
      const data = await membersAPI.getAll(selectedSedeFilter);
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal handler
  const handleOpenCreateModal = (presetRole = 'MIEMBRO') => {
    if (!canCreateMembers) {
      setSnackbar({ open: true, message: 'Acceso denegado: Solo los administradores de sede y los superadmins pueden registrar miembros.', severity: 'error' });
      return;
    }

    const isSuperRole = presetRole === 'SUPER_ADMIN';
    const targetSede = isSuperRole
      ? 'TODAS'
      : canManageAllSedes
        ? (selectedSedeFilter !== 'TODAS' ? selectedSedeFilter : 'plaza-venezuela')
        : (user?.sede || 'maracay');

    setFormData({
      full_name: '',
      email: '',
      phone: '',
      sede_id: targetSede,
      role: presetRole,
      ministry: isSuperRole ? 'Dirección General / Superadmin' : 'Grupo de Conexión',
      baptism_status: 'Bautizado',
      discipleship_status: isSuperRole ? 'Graduado de Fundamentos' : 'En formación',
      allowed_modules: isSuperRole || presetRole === 'ADMIN_SEDE' ? ALL_MODULE_KEYS : DEFAULT_MEMBER_MODULES,
      access_username: '',
      initial_password: '123'
    });
    setOpenModal(true);
  };

  const toggleFormModule = (modKey) => {
    setFormData((prev) => {
      const current = prev.allowed_modules || [];
      if (current.includes(modKey)) {
        if (current.length <= 1) return prev; // Al menos 1 módulo debe quedar activo
        return { ...prev, allowed_modules: current.filter((m) => m !== modKey) };
      }
      return { ...prev, allowed_modules: [...current, modKey] };
    });
  };

  const handleOpenEditModules = (member) => {
    if (!canCreateMembers) return;
    setModulesEditMember(member);
    setModulesEditList(
      Array.isArray(member.allowed_modules) && member.allowed_modules.length > 0
        ? member.allowed_modules
        : DEFAULT_MEMBER_MODULES
    );
  };

  const handleSaveEditModules = async () => {
    if (!modulesEditMember) return;
    setSavingModules(true);
    try {
      await membersAPI.update(modulesEditMember.id, { allowed_modules: modulesEditList });
      setMembers((prev) =>
        prev.map((m) => (m.id === modulesEditMember.id ? { ...m, allowed_modules: modulesEditList } : m))
      );
      setSnackbar({
        open: true,
        message: `¡Módulos visibles actualizados para ${modulesEditMember.full_name} en Neon PostgreSQL!`,
        severity: 'success'
      });
      setModulesEditMember(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al actualizar módulos permitidos',
        severity: 'error'
      });
    } finally {
      setSavingModules(false);
    }
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setOpenModal(false);
    }
  };

  // Submit new member
  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!canCreateMembers) {
      setSnackbar({ open: true, message: 'No estás autorizado para registrar miembros.', severity: 'error' });
      return;
    }
    if (!formData.full_name.trim()) {
      setSnackbar({ open: true, message: 'Por favor ingresa el nombre completo del miembro', severity: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const creatorName = canManageAllSedes
        ? `${user?.name || user?.username || 'Superadmin'} (Nacional / Todas las Sedes)`
        : `${user?.name || user?.username || 'Admin'} (Admin Sede)`;

      const matchedSede = SEDES_LIST.find((s) => s.id === formData.sede_id);
      const resolvedSedeName = formData.sede_id === 'TODAS'
        ? 'Todas las Sedes (Nacional)'
        : (matchedSede?.name || formData.sede_id);

      const autoGeneratedUsername = generateUsernameFromName(formData.full_name);
      const finalUsername = (formData.access_username || '').trim().toLowerCase() || autoGeneratedUsername;

      const cleanEmail = formData.email.trim();
      const payload = {
        full_name: formData.full_name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim() || 'No registrado',
        sede_id: formData.role === 'SUPER_ADMIN' ? 'TODAS' : formData.sede_id,
        sede_name: formData.role === 'SUPER_ADMIN' ? 'Todas las Sedes (Nacional)' : resolvedSedeName,
        role: formData.role,
        ministry: formData.ministry,
        baptism_status: formData.baptism_status,
        discipleship_status: formData.discipleship_status,
        created_by: creatorName,
        creator_role: currentRole,
        allowed_modules: formData.role === 'SUPER_ADMIN' || formData.role === 'ADMIN_SEDE'
          ? ALL_MODULE_KEYS
          : (formData.allowed_modules || DEFAULT_MEMBER_MODULES),
        access_username: finalUsername || undefined,
        initial_password: (formData.initial_password || '').trim() || '123'
      };

      const result = await membersAPI.create(payload);

      if (result.success || result.id) {
        const effectiveUser = result.credentials?.username || finalUsername;
        const createdMember = result.member || {
          id: result.id || Date.now(),
          ...payload,
          username: effectiveUser,
          joined_at: new Date().toISOString().split('T')[0]
        };

        setSnackbar({
          open: true,
          message: payload.role === 'SUPER_ADMIN'
            ? `¡Superadministrador ${payload.full_name} (@${effectiveUser}) creado con éxito!`
            : `¡Miembro ${payload.full_name} (@${effectiveUser}) registrado con éxito en ${payload.sede_name}!`,
          severity: 'success'
        });
        setOpenModal(false);

        if (canManageAllSedes && selectedSedeFilter !== 'TODAS' && selectedSedeFilter !== payload.sede_id) {
          setSelectedSedeFilter('TODAS');
        }

        // Refresh list and guarantee created member is in state
        await loadMembersData();
        setMembers((prev) => {
          const exists = prev.some((m) => m.id === createdMember.id);
          return exists ? prev : [createdMember, ...prev];
        });

        // Levantar Modal de Bienvenida con Credenciales y Envío por WhatsApp
        const cleanPhone = (payload.phone || '').replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') && cleanPhone.length === 11
          ? '58' + cleanPhone.slice(1)
          : cleanPhone;

        const emailLine = cleanEmail ? `📧 Correo: ${cleanEmail}\n` : '';
        const defaultMsg = `¡Hola, ${payload.full_name}! 🕊️\n\nTe damos una bendecida bienvenida a la familia de la Iglesia
        
        Restauración (${payload.sede_name}).\n\nHemos activado tu cuenta de acceso a la plataforma con las siguientes credenciales:\n🌐 Enlace de la App: https://app-iglesia-frontend.onrender.com/\n👤 Usuario: ${effectiveUser}\n${emailLine}🔑 Contraseña temporal: ${result.credentials?.initial_password || payload.initial_password || '123'}\n\n⚠️ Nota de seguridad: Al iniciar sesión por primera vez, el sistema te solicitará obligatoriamente cambiar tu contraseña.`;

        setWelcomeModalData({
          member: createdMember,
          credentials: result.credentials || {
            username: effectiveUser,
            initial_password: payload.initial_password || '123'
          },
          whatsapp: result.whatsapp || {
            phone: formattedPhone,
            message: defaultMsg,
            url: formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultMsg)}` : '',
            sender_name: 'Luis Infante (linfante)',
            sender_phone: '04120161906'
          }
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al registrar el miembro',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered members calculation
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Sede filter
      if (!canManageAllSedes && user?.sede && m.sede_id !== user.sede && m.sede_id !== 'TODAS') {
        return false;
      }
      if (canManageAllSedes && selectedSedeFilter !== 'TODAS' && m.sede_id !== selectedSedeFilter && m.sede_id !== 'TODAS') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.full_name?.toLowerCase().includes(q);
        const matchesEmail = m.email?.toLowerCase().includes(q);
        const matchesMinistry = m.ministry?.toLowerCase().includes(q);
        const matchesPhone = m.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesMinistry && !matchesPhone) return false;
      }

      // Ministry filter
      if (ministryFilter !== 'ALL' && m.ministry !== ministryFilter) {
        return false;
      }

      return true;
    });
  }, [members, canManageAllSedes, selectedSedeFilter, user, searchQuery, ministryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredMembers.length;
    const bautizados = filteredMembers.filter((m) => m.baptism_status === 'Bautizado').length;
    const porBautizar = filteredMembers.filter((m) => m.baptism_status === 'Por bautizar').length;
    const servidores = filteredMembers.filter((m) => m.role === 'SERVIDOR' || m.role === 'LIDER').length;
    return { total, bautizados, porBautizar, servidores };
  }, [filteredMembers]);

  // Helper colors for sedes
  const getSedeColor = (sedeId) => {
    switch (sedeId) {
      case 'plaza-venezuela': return '#83050B';
      case 'maracay': return '#2563EB';
      case 'la-suiza': return '#059669';
      case 'sucre': return '#D97706';
      case 'maracaibo': return '#7C3AED';
      default: return '#475569';
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #83050B 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  icon={canManageAllSedes ? <GlobalIcon sx={{ color: '#FCD34D !important', fontSize: 16 }} /> : <ShieldIcon sx={{ color: '#6EE7B7 !important', fontSize: 16 }} />}
                  label={canManageAllSedes
                    ? (user?.username === 'scarrasquel'
                      ? "ROL: SUPERADMIN (Pastor Said Carrasquel - Todas las Sedes)"
                      : user?.username === 'linfante'
                        ? "ROL: SUPERADMIN / DUEÑO (L. Infante - Todas las Sedes)"
                        : "ROL: SUPERADMIN (Nacional / Todas las Sedes)")
                    : (isSedeAdmin
                      ? `ADMINISTRADOR DE SEDE (${user?.sede?.toUpperCase() || 'LOCAL'})`
                      : `CONSULTA DE DIRECTORIO (${currentRole})`)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.2 }}>
                Directorio de Miembros
              </Typography>
              <Typography variant="body2" sx={{ color: '#E2E8F0', mt: 0.8, maxWidth: 680 }}>
                {canManageAllSedes
                  ? 'Como Superadmin (Pastor Said Carrasquel / Linfante) tienes potestad nacional para registrar y gestionar miembros en cualquiera de las 5 sedes de Restauración.'
                  : (isSedeAdmin
                    ? `Como Administrador de Sede puedes registrar y administrar a los miembros de tu congregación local (${user?.sede?.toUpperCase()}).`
                    : 'Directorio congregacional de miembros de la iglesia.')}
              </Typography>
            </Box>

            {/* Add Member / Superadmin CTA Buttons */}
            {canCreateMembers && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {canManageAllSedes && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShieldIcon />}
                    onClick={() => handleOpenCreateModal('SUPER_ADMIN')}
                    sx={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      px: 2.5,
                      py: 1.3,
                      width: { xs: '100%', sm: 'auto' },
                      borderRadius: 2.5,
                      border: '1px solid rgba(254, 240, 138, 0.5)',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
                        boxShadow: '0 10px 24px rgba(245, 158, 11, 0.5)'
                      }
                    }}
                  >
                    👑 Crear Superadmin
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenCreateModal('MIEMBRO')}
                  sx={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3,
                    py: 1.3,
                    width: { xs: '100%', sm: 'auto' },
                    borderRadius: 2.5,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.45)',
                    '&:hover': {
                      backgroundColor: '#1E293B',
                      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.6)'
                    }
                  }}
                >
                  + Registrar Miembro
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Metrics Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: { xs: 1.2, sm: 2 }, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Total Miembros
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
              Registrados
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: { xs: 1.2, sm: 2 }, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Bautizados
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
              {stats.bautizados}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
              En comunión
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: { xs: 1.2, sm: 2 }, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Por Bautizar
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
              {stats.porBautizar}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
              En discipulado
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: { xs: 1.2, sm: 2 }, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Servidores
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
              {stats.servidores}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
              En ministerios
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Sede Selector */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sede-filter-label">Filtrar por Sede</InputLabel>
              <Select
                labelId="sede-filter-label"
                value={canManageAllSedes ? selectedSedeFilter : (user?.sede || 'maracay')}
                label="Filtrar por Sede"
                disabled={!canManageAllSedes}
                onChange={(e) => setSelectedSedeFilter(e.target.value)}
              >
                {canManageAllSedes && (
                  <MenuItem value="TODAS">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GlobalIcon sx={{ fontSize: 18, color: '#D97706' }} />
                      <Typography sx={{ fontWeight: 700 }}>Todas las Sedes (Nivel Nacional)</Typography>
                    </Stack>
                  </MenuItem>
                )}
                {SEDES_LIST.map((sede) => (
                  <MenuItem key={sede.id} value={sede.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon sx={{ fontSize: 18, color: getSedeColor(sede.id) }} />
                      <Typography>{sede.name} ({sede.state})</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Search Input */}
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, correo, teléfono o ministerio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Ministry Filter */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="ministry-filter-label">Ministerio</InputLabel>
              <Select
                labelId="ministry-filter-label"
                value={ministryFilter}
                label="Ministerio"
                onChange={(e) => setMinistryFilter(e.target.value)}
              >
                <MenuItem value="ALL">Todos los Ministerios</MenuItem>
                <MenuItem value="Grupo de Jóvenes & Conexión">Jóvenes / Conexión</MenuItem>
                <MenuItem value="Protocolo y Bienvenida">Protocolo</MenuItem>
                <MenuItem value="Consolidación">Consolidación</MenuItem>
                <MenuItem value="Ministerio de Alabanza (Guitarra)">Alabanza</MenuItem>
                <MenuItem value="Ministerio Familiar y Niños">Familiar / Niños</MenuItem>
                <MenuItem value="Integración">Integración</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Lock note for Sede Admin */}
        {!canManageAllSedes && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
            <LockIcon sx={{ fontSize: 15, color: '#83050B' }} />
            <Typography variant="caption">
              Vista restringida a tu sede asignada (<strong>{user?.sede?.toUpperCase()}</strong>). Solo el Superadmin puede alternar entre sedes.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Members Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#83050B' }} />
          <Typography sx={{ mt: 2, color: '#64748B' }}>Cargando directorio de miembros...</Typography>
        </Box>
      ) : filteredMembers.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <PeopleIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
            No se encontraron miembros registrados
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 450, mx: 'auto', mt: 0.5 }}>
            No hay miembros que coincidan con la sede o criterios de búsqueda seleccionados.
          </Typography>
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ mt: 2, borderColor: '#83050B', color: '#83050B', fontWeight: 600 }}
            >
              Registrar el primer miembro aquí
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredMembers.map((member) => {
            const sedeColor = getSedeColor(member.sede_id);
            const initials = member.full_name
              ? member.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              : 'MB';

            return (
              <Grid item xs={12} sm={6} lg={4} key={member.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: '#CBD5E1',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Member Top Bar: Avatar & Sede Chip */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: sedeColor,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            width: 44,
                            height: 44,
                            fontSize: '1rem'
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            {member.full_name}
                          </Typography>
                          <Chip
                            label={
                              member.role === 'SUPER_ADMIN'
                                ? '👑 SUPERADMIN GLOBAL'
                                : member.role === 'ADMIN_SEDE'
                                  ? '🏢 ADMIN DE SEDE'
                                  : (member.role || 'MIEMBRO')
                            }
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              mt: 0.4,
                              backgroundColor:
                                member.role === 'SUPER_ADMIN'
                                  ? '#FEF3C7'
                                  : member.role === 'ADMIN_SEDE'
                                    ? '#DBEAFE'
                                    : member.role === 'SERVIDOR' || member.role === 'LIDER'
                                      ? '#EFF6FF'
                                      : '#F1F5F9',
                              color:
                                member.role === 'SUPER_ADMIN'
                                  ? '#B45309'
                                  : member.role === 'ADMIN_SEDE'
                                    ? '#1E40AF'
                                    : member.role === 'SERVIDOR' || member.role === 'LIDER'
                                      ? '#1D4ED8'
                                      : '#475569',
                              border: member.role === 'SUPER_ADMIN' ? '1px solid #F59E0B' : 'none'
                            }}
                          />
                        </Box>
                      </Stack>

                      {canCreateMembers && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Asignar qué módulos puede ver y cuáles no">
                            <IconButton
                              size="small"
                              sx={{ color: '#2563EB', backgroundColor: '#EFF6FF', '&:hover': { backgroundColor: '#DBEAFE' } }}
                              onClick={() => handleOpenEditModules(member)}
                            >
                              <TuneIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver credenciales y enviar bienvenida por WhatsApp">
                            <IconButton
                              size="small"
                              sx={{ color: '#25D366', backgroundColor: '#F0FDF4', '&:hover': { backgroundColor: '#DCFCE7' } }}
                              onClick={() => {
                                const cleanPhone = (member.phone || '').replace(/\D/g, '');
                                const formattedPhone = cleanPhone.startsWith('0') && cleanPhone.length === 11
                                  ? '58' + cleanPhone.slice(1)
                                  : (cleanPhone.length === 10 && cleanPhone.startsWith('4') ? '58' + cleanPhone : cleanPhone);
                                const username = member.username || generateUsernameFromName(member.full_name) || `user${member.id}`;
                                const emailLine = member.email && member.email !== 'No registrado' ? `📧 Correo: ${member.email}\n` : '';
                                const msg = `¡Hola, ${member.full_name}! 🕊️\n\nTe damos una bendecida bienvenida a la familia de la Iglesia Restauración (${member.sede_name || member.sede_id}).\n\nHemos activado tu cuenta de acceso a la plataforma con las siguientes credenciales:\n🌐 Enlace de la App: https://app-iglesia-frontend.onrender.com/\n👤 Usuario: ${username}\n${emailLine}🔑 Contraseña temporal: 123\n\n⚠️ Nota de seguridad: Al iniciar sesión por primera vez, el sistema te solicitará obligatoriamente cambiar tu contraseña.`;
                                setWelcomeModalData({
                                  member,
                                  credentials: { username, initial_password: '123' },
                                  whatsapp: {
                                    phone: formattedPhone,
                                    message: msg,
                                    url: formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}` : '',
                                    sender_name: 'Luis Infante (linfante)',
                                    sender_phone: '04120161906'
                                  }
                                });
                              }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar miembro">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                await membersAPI.delete(member.id);
                                setMembers((prev) => prev.filter((m) => m.id !== member.id));
                                setSnackbar({ open: true, message: `Miembro ${member.full_name} eliminado.`, severity: 'info' });
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Stack>

                    {/* Sede Badge */}
                    <Box sx={{ mb: 1.5 }}>
                      <Chip
                        icon={<LocationIcon sx={{ fontSize: 14, color: `${sedeColor} !important` }} />}
                        label={member.sede_name || member.sede_id}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          backgroundColor: `${sedeColor}12`,
                          color: sedeColor,
                          border: `1px solid ${sedeColor}30`
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Contact & Ministry Info */}
                    <Stack spacing={0.8} sx={{ my: 1, flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                          {member.phone}
                        </Typography>
                        {member.phone && member.phone !== 'No registrado' && (
                          <IconButton
                            size="small"
                            component="a"
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            sx={{ p: 0.2, color: '#25D366' }}
                          >
                            <WhatsAppIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        )}
                      </Stack>

                      {member.email && member.email !== 'No registrado' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {member.email}
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" spacing={1} alignItems="center">
                        <MinistryIcon sx={{ fontSize: 16, color: '#83050B' }} />
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {member.ministry}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Spiritual Status Footer */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CheckCircleIcon
                          sx={{
                            fontSize: 16,
                            color: member.baptism_status === 'Bautizado' ? '#059669' : '#D97706'
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: member.baptism_status === 'Bautizado' ? '#059669' : '#D97706'
                          }}
                        >
                          {member.baptism_status}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <DiscipleshipIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563EB' }}>
                          {member.discipleship_status}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Added By Footer */}
                    {member.created_by && (
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', mt: 1, display: 'block' }}>
                        Registrado por: {member.created_by}
                      </Typography>
                    )}

                    {/* Allowed Modules Summary on Card */}
                    <Box
                      sx={{
                        mt: 1.2,
                        p: 1.2,
                        borderRadius: 2,
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.7rem' }}>
                          📱 Módulos visibles: {(member.allowed_modules || DEFAULT_MEMBER_MODULES).length} / {APP_MODULES_CATALOG.length}
                        </Typography>
                        {canCreateMembers && (
                          <Button
                            size="small"
                            startIcon={<TuneIcon sx={{ fontSize: '12px !important' }} />}
                            onClick={() => handleOpenEditModules(member)}
                            sx={{
                              py: 0,
                              px: 0.8,
                              minWidth: 0,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              color: '#2563EB'
                            }}
                          >
                            Asignar
                          </Button>
                        )}
                      </Stack>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {APP_MODULES_CATALOG.map((mod) => {
                          const isAllowed = (member.allowed_modules || DEFAULT_MEMBER_MODULES).includes(mod.key);
                          return (
                            <Chip
                              key={mod.key}
                              label={mod.shortLabel}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: isAllowed ? 700 : 500,
                                backgroundColor: isAllowed ? '#DCFCE7' : '#F1F5F9',
                                color: isAllowed ? '#166534' : '#94A3B8',
                                textDecoration: isAllowed ? 'none' : 'line-through'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* REGISTRATION MODAL */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: { xs: 2, sm: 3 }, m: { xs: 1, sm: 2 }, p: { xs: 0.5, sm: 1 }, maxHeight: '92vh' }
        }}
      >
        <form onSubmit={handleSubmitMember}>
          <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {formData.role === 'SUPER_ADMIN'
                  ? '👑 Crear Nuevo Superadministrador Global'
                  : 'Registrar Nuevo Miembro'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Directorio oficial de la Iglesia Cristiana Evangélica Restauración
              </Typography>
            </Box>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 2.5 }}>
            {/* Notice banner based on user's role */}
            <Alert
              severity={formData.role === 'SUPER_ADMIN' ? 'warning' : (canManageAllSedes ? 'info' : 'success')}
              icon={canManageAllSedes ? <GlobalIcon /> : <LockIcon />}
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              {formData.role === 'SUPER_ADMIN' ? (
                <span>
                  <strong>👑 Nivel Superadministrador Global:</strong> Este usuario tendrá acceso supremo a <strong>todas las sedes nacionales</strong>, todos los módulos del sistema y facultad para crear administradores y miembros.
                </span>
              ) : canManageAllSedes ? (
                <span>
                  <strong>Modo Superadmin (Nacional):</strong> Puedes elegir cualquiera de las 5 sedes y asignar el rol (incluyendo otro Superadmin o Admin de Sede).
                </span>
              ) : (
                <span>
                  <strong>Modo Administrador de Sede:</strong> El nuevo miembro será registrado automáticamente en tu sede: <strong>{user?.sede?.toUpperCase()}</strong>.
                </span>
              )}
            </Alert>

            <Grid container spacing={2}>
              {/* Sede Field */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="modal-sede-label">Sede de la Iglesia</InputLabel>
                  <Select
                    labelId="modal-sede-label"
                    value={formData.sede_id}
                    label="Sede de la Iglesia"
                    disabled={!canManageAllSedes} // Disabled for Admin de Sede, Enabled for Superadmin
                    onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                  >
                    {canManageAllSedes && (
                      <MenuItem value="TODAS">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <GlobalIcon sx={{ fontSize: 18, color: '#D97706' }} />
                          <Typography sx={{ fontWeight: 800, color: '#B45309' }}>
                            🌐 Todas las Sedes (Acceso Global / Nacional)
                          </Typography>
                        </Stack>
                      </MenuItem>
                    )}
                    {SEDES_LIST.map((sede) => (
                      <MenuItem key={sede.id} value={sede.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationIcon sx={{ fontSize: 18, color: getSedeColor(sede.id) }} />
                          <Typography sx={{ fontWeight: 600 }}>{sede.name} ({sede.state})</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!canManageAllSedes && (
                  <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>
                    * Como administrador de sede local, el registro queda vinculado a tu congregación.
                  </Typography>
                )}
              </Grid>

              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label={formData.role === 'SUPER_ADMIN' ? 'Nombre Completo del Nuevo Superadmin' : 'Nombre Completo del Miembro'}
                  placeholder="Ej: David Alejandro Morales"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono WhatsApp"
                  placeholder="0412-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              {/* Custom Username & Initial Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Usuario de Acceso"
                  placeholder={generateUsernameFromName(formData.full_name) || 'Ej: scarrasquel'}
                  value={formData.access_username || generateUsernameFromName(formData.full_name)}
                  onChange={(e) => setFormData({ ...formData, access_username: e.target.value })}
                  helperText="Formato automático: inicial del nombre + apellido"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contraseña Inicial"
                  placeholder="123"
                  value={formData.initial_password}
                  onChange={(e) => setFormData({ ...formData, initial_password: e.target.value })}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-role-label">Rol / Nivel en el Sistema</InputLabel>
                  <Select
                    labelId="modal-role-label"
                    value={formData.role}
                    label="Rol / Nivel en el Sistema"
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      setFormData({
                        ...formData,
                        role: nextRole,
                        sede_id: nextRole === 'SUPER_ADMIN' ? 'TODAS' : (formData.sede_id === 'TODAS' ? 'plaza-venezuela' : formData.sede_id),
                        ministry: nextRole === 'SUPER_ADMIN' ? 'Dirección General / Superadmin' : formData.ministry,
                        allowed_modules: nextRole === 'SUPER_ADMIN' || nextRole === 'ADMIN_SEDE' ? ALL_MODULE_KEYS : formData.allowed_modules
                      });
                    }}
                  >
                    {canManageAllSedes && (
                      <MenuItem value="SUPER_ADMIN" sx={{ fontWeight: 800, color: '#B45309', backgroundColor: '#FFFBEB' }}>
                        👑 Superadministrador Global (Todas las Sedes)
                      </MenuItem>
                    )}
                    {canManageAllSedes && (
                      <MenuItem value="ADMIN_SEDE" sx={{ fontWeight: 700, color: '#1E40AF' }}>
                        🏢 Administrador de Sede Local
                      </MenuItem>
                    )}
                    <MenuItem value="MIEMBRO">Miembro en Comunión</MenuItem>
                    <MenuItem value="SERVIDOR">Servidor Activo</MenuItem>
                    <MenuItem value="LIDER">Líder de Área / Conexión</MenuItem>
                    <MenuItem value="NUEVO_CREYENTE">Nuevo Creyente / Amigo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Ministry */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-min-label">Ministerio Asignado</InputLabel>
                  <Select
                    labelId="modal-min-label"
                    value={formData.ministry}
                    label="Ministerio Asignado"
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                  >
                    <MenuItem value="Dirección General / Superadmin">Dirección General / Superadmin</MenuItem>
                    <MenuItem value="Grupo de Jóvenes & Conexión">Jóvenes / Grupos de Conexión</MenuItem>
                    <MenuItem value="Protocolo y Bienvenida">Protocolo y Bienvenida</MenuItem>
                    <MenuItem value="Consolidación">Consolidación e Integración</MenuItem>
                    <MenuItem value="Ministerio de Alabanza">Alabanza y Música</MenuItem>
                    <MenuItem value="Ministerio Familiar y Niños">Familiar y Niños</MenuItem>
                    <MenuItem value="Intercesión y Oración">Intercesión y Oración</MenuItem>
                    <MenuItem value="General">General / Sin ministerio asignado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Baptism Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-bap-label">Estado de Bautismo</InputLabel>
                  <Select
                    labelId="modal-bap-label"
                    value={formData.baptism_status}
                    label="Estado de Bautismo"
                    onChange={(e) => setFormData({ ...formData, baptism_status: e.target.value })}
                  >
                    <MenuItem value="Bautizado">Bautizado en Aguas</MenuItem>
                    <MenuItem value="Por bautizar">Por Bautizar (Próxima fecha)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Discipleship Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-disc-label">Estatus en Discipulado</InputLabel>
                  <Select
                    labelId="modal-disc-label"
                    value={formData.discipleship_status}
                    label="Estatus en Discipulado"
                    onChange={(e) => setFormData({ ...formData, discipleship_status: e.target.value })}
                  >
                    <MenuItem value="Iniciando Discipulado">Iniciando Discipulado</MenuItem>
                    <MenuItem value="En formación (Nivel 1)">En formación (Nivel 1)</MenuItem>
                    <MenuItem value="En formación (Nivel 2)">En formación (Nivel 2)</MenuItem>
                    <MenuItem value="Graduado de Fundamentos">Graduado de Fundamentos</MenuItem>
                    <MenuItem value="Líder en formación">Líder en formación</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Module Visibility / Permissions Selector (Superadmin & Admin Sede) */}
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 0.5,
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1'
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <TuneIcon sx={{ fontSize: 18, color: '#83050B' }} />
                        ¿Qué módulos puede ver este miembro? ({(formData.allowed_modules || []).length}/{APP_MODULES_CATALOG.length})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        Marca los módulos a los que tendrá acceso al iniciar sesión y desmarca los que deseas ocultarle.
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      <Chip
                        label="Todos (10)"
                        size="small"
                        clickable
                        onClick={() => setFormData({ ...formData, allowed_modules: ALL_MODULE_KEYS })}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', backgroundColor: '#E2E8F0' }}
                      />
                      <Chip
                        label="Estándar (Sin Directorio)"
                        size="small"
                        clickable
                        onClick={() => setFormData({ ...formData, allowed_modules: DEFAULT_MEMBER_MODULES })}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', backgroundColor: '#DBEAFE', color: '#1E40AF' }}
                      />
                      <Chip
                        label="Básico (4)"
                        size="small"
                        clickable
                        onClick={() => setFormData({ ...formData, allowed_modules: ['prayers', 'bible', 'emotions', 'discipleship'] })}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E' }}
                      />
                    </Stack>
                  </Stack>

                  <Grid container spacing={1}>
                    {APP_MODULES_CATALOG.map((mod) => {
                      const checked = (formData.allowed_modules || []).includes(mod.key);
                      return (
                        <Grid item xs={12} sm={6} key={mod.key}>
                          <Paper
                            elevation={0}
                            onClick={() => toggleFormModule(mod.key)}
                            sx={{
                              px: 1.2,
                              py: 0.6,
                              borderRadius: 2,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: checked ? '1.5px solid #059669' : '1px solid #E2E8F0',
                              backgroundColor: checked ? '#F0FDF4' : '#FFFFFF',
                              transition: 'all 0.15s'
                            }}
                          >
                            <FormControlLabel
                              onClick={(e) => e.stopPropagation()}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  onChange={() => toggleFormModule(mod.key)}
                                  sx={{
                                    py: 0.3,
                                    color: '#94A3B8',
                                    '&.Mui-checked': { color: '#059669' }
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: checked ? 700 : 500, color: checked ? '#0F172A' : '#64748B' }}>
                                    {mod.label}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', lineHeight: 1.1 }}>
                                    {checked ? 'Visible para el miembro' : 'Oculto / Restringido'}
                                  </Typography>
                                </Box>
                              }
                              sx={{ m: 0, width: '100%' }}
                            />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} disabled={submitting} sx={{ color: '#64748B' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: formData.role === 'SUPER_ADMIN' ? '#D97706' : '#83050B',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3,
                '&:hover': { backgroundColor: formData.role === 'SUPER_ADMIN' ? '#B45309' : '#5B0307' }
              }}
            >
              {submitting
                ? 'Guardando...'
                : formData.role === 'SUPER_ADMIN'
                  ? '👑 Crear Superadmin'
                  : 'Registrar Miembro'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL DE BIENVENIDA Y ENVÍO DE CREDENCIALES POR WHATSAPP */}
      <Dialog
        open={Boolean(welcomeModalData)}
        onClose={() => setWelcomeModalData(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            border: '2px solid #10B981'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WhatsAppIcon sx={{ color: '#10B981', fontSize: 32 }} />
          Bienvenida y Envío de Credenciales
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <Typography sx={{ color: '#065F46', fontWeight: 800, fontSize: '0.98rem' }}>
              ✓ Miembro registrado y guardado en Neon PostgreSQL
            </Typography>
            <Typography sx={{ color: '#047857', fontSize: '0.82rem', mt: 0.5 }}>
              Su cuenta de acceso está activa. Envíale su mensaje de bienvenida y credenciales directamente a su WhatsApp.
            </Typography>
          </Box>

          {/* Tarjeta de Credenciales Creadas */}
          <Card elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', mb: 1, textTransform: 'uppercase' }}>
              Credenciales de Acceso
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Nombre completo:</Typography>
                <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{welcomeModalData?.member?.full_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Rol asignado:</Typography>
                <Chip label={welcomeModalData?.member?.role || 'MIEMBRO'} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Usuario de inicio:</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{welcomeModalData?.credentials?.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Contraseña temporal:</Typography>
                <Typography sx={{ fontWeight: 800, color: '#DC2626' }}>{welcomeModalData?.credentials?.initial_password || '123'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Enlace de la Aplicación:</Typography>
                <Typography
                  component="a"
                  href="https://app-iglesia-frontend.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.84rem', textDecoration: 'underline' }}
                >
                  https://app-iglesia-frontend.onrender.com/
                </Typography>
              </Grid>
            </Grid>
            <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '10px', fontSize: '0.78rem' }}>
              🔒 El usuario deberá cambiar su contraseña obligatoriamente al iniciar sesión por primera vez.
            </Alert>
          </Card>

          {/* Tarjeta de Remitente Configurado */}
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                Remitente del mensaje:
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#0F172A', fontWeight: 800 }}>
                Luis Infante (linfante) — Superadmin
              </Typography>
            </Box>
            <Chip label="📱 04120161906" size="small" sx={{ fontWeight: 800, backgroundColor: '#0F172A', color: '#FFFFFF' }} />
          </Box>

          {/* Vista previa del mensaje */}
          <Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', mb: 0.8 }}>
              Mensaje preparado para WhatsApp:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                whiteSpace: 'pre-wrap',
                maxHeight: '160px',
                overflowY: 'auto',
                color: '#334155'
              }}
            >
              {welcomeModalData?.whatsapp?.message}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(welcomeModalData?.whatsapp?.message || '');
              setCopiedMessage(true);
              setTimeout(() => setCopiedMessage(false), 2500);
            }}
            sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700 }}
          >
            {copiedMessage ? '✓ Copiado al portapapeles' : 'Copiar Mensaje'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setWelcomeModalData(null)}
              variant="text"
              sx={{ borderRadius: '50px', textTransform: 'none', color: '#64748B' }}
            >
              Cerrar
            </Button>
            {welcomeModalData?.whatsapp?.url ? (
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                onClick={() => {
                  window.open(welcomeModalData.whatsapp.url, '_blank', 'noopener,noreferrer');
                }}
                sx={{
                  borderRadius: '50px',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 2.5,
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                  '&:hover': { backgroundColor: '#1EBE5D' }
                }}
              >
                Enviar por WhatsApp
              </Button>
            ) : (
              <Chip label="Sin teléfono" color="default" size="small" />
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* MODAL PARA ASIGNAR / EDITAR MÓDULOS VISIBLES DE UN MIEMBRO (SOLO SUPERADMIN Y ADMIN DE SEDE) */}
      <Dialog
        open={Boolean(modulesEditMember)}
        onClose={() => !savingModules && setModulesEditMember(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '22px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon sx={{ color: '#2563EB' }} />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                Asignar Módulos Visibles
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Miembro: <strong>{modulesEditMember?.full_name}</strong> ({modulesEditMember?.sede_name || modulesEditMember?.sede_id})
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setModulesEditMember(null)} disabled={savingModules}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.8rem' }}>
            Selecciona qué módulos de la plataforma podrá ver <strong>{modulesEditMember?.full_name}</strong> al iniciar sesión y desmarca los que deseas ocultarle.
          </Alert>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Chip
              label="Habilitar Todos (10)"
              size="small"
              clickable
              onClick={() => setModulesEditList(ALL_MODULE_KEYS)}
              sx={{ fontWeight: 700, backgroundColor: '#E2E8F0' }}
            />
            <Chip
              label="Estándar Miembro (Sin Directorio)"
              size="small"
              clickable
              onClick={() => setModulesEditList(DEFAULT_MEMBER_MODULES)}
              sx={{ fontWeight: 700, backgroundColor: '#DBEAFE', color: '#1E40AF' }}
            />
            <Chip
              label="Básico Nuevo Creyente (4)"
              size="small"
              clickable
              onClick={() => setModulesEditList(['prayers', 'bible', 'emotions', 'discipleship'])}
              sx={{ fontWeight: 700, backgroundColor: '#FEF3C7', color: '#92400E' }}
            />
          </Stack>

          <Grid container spacing={1.2}>
            {APP_MODULES_CATALOG.map((mod) => {
              const checked = modulesEditList.includes(mod.key);
              const toggleMod = () => {
                if (checked) {
                  if (modulesEditList.length <= 1) return;
                  setModulesEditList(modulesEditList.filter((m) => m !== mod.key));
                } else {
                  setModulesEditList([...modulesEditList, mod.key]);
                }
              };
              return (
                <Grid item xs={12} sm={6} key={mod.key}>
                  <Paper
                    elevation={0}
                    onClick={toggleMod}
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: checked ? '1.5px solid #059669' : '1px solid #E2E8F0',
                      backgroundColor: checked ? '#F0FDF4' : '#FFFFFF'
                    }}
                  >
                    <FormControlLabel
                      onClick={(e) => e.stopPropagation()}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={toggleMod}
                          sx={{ py: 0.3, '&.Mui-checked': { color: '#059669' } }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: checked ? 700 : 500, color: checked ? '#0F172A' : '#64748B' }}>
                            {mod.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: checked ? '#059669' : '#94A3B8' }}>
                            {checked ? '✓ Puede ver este módulo' : '✕ Oculto para este miembro'}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModulesEditMember(null)} disabled={savingModules} color="inherit" sx={{ borderRadius: '50px' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditModules}
            disabled={savingModules}
            sx={{
              borderRadius: '50px',
              px: 3,
              fontWeight: 700,
              backgroundColor: '#2563EB',
              '&:hover': { backgroundColor: '#1D4ED8' }
            }}
          >
            {savingModules ? 'Guardando en Neon...' : 'Guardar Módulos Permitidos'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
