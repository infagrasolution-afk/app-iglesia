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
  CircularProgress
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
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { SEDES_LIST } from '../data/sedesData';
import { membersAPI } from '../services/api';

export default function Members() {
  const { user, currentRole, currentSede, canManageAllSedes, isSedeAdmin, isAdmin } = useAuth();

  // Selected Sede filter in directory view
  const [selectedSedeFilter, setSelectedSedeFilter] = useState(() => {
    if (canManageAllSedes) return currentSede || 'TODAS';
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
    discipleship_status: 'En formación'
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
  const handleOpenCreateModal = () => {
    const targetSede = canManageAllSedes 
      ? (selectedSedeFilter !== 'TODAS' ? selectedSedeFilter : 'plaza-venezuela')
      : (user?.sede || 'maracay');

    setFormData({
      full_name: '',
      email: '',
      phone: '',
      sede_id: targetSede,
      role: 'MIEMBRO',
      ministry: 'Grupo de Conexión',
      baptism_status: 'Bautizado',
      discipleship_status: 'En formación'
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setOpenModal(false);
    }
  };

  // Submit new member
  const handleSubmitMember = async (e) => {
    e.preventDefault();
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

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || `${formData.full_name.toLowerCase().replace(/\s+/g, '.')}@restauracion.org`,
        phone: formData.phone.trim() || 'No registrado',
        sede_id: formData.sede_id,
        sede_name: matchedSede?.name || formData.sede_id,
        role: formData.role,
        ministry: formData.ministry,
        baptism_status: formData.baptism_status,
        discipleship_status: formData.discipleship_status,
        created_by: creatorName
      };

      const result = await membersAPI.create(payload);

      if (result.success || result.id) {
        setSnackbar({
          open: true,
          message: `¡Miembro ${payload.full_name} registrado con éxito en ${payload.sede_name}!`,
          severity: 'success'
        });
        setOpenModal(false);
        // Refresh list
        await loadMembersData();
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
      if (!canManageAllSedes && user?.sede && m.sede_id !== user.sede) {
        return false;
      }
      if (canManageAllSedes && selectedSedeFilter !== 'TODAS' && m.sede_id !== selectedSedeFilter) {
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
                  label={canManageAllSedes ? "ROL: SUPERADMIN / DUEÑO (Acceso a Todas las Sedes)" : `ADMINISTRADOR DE SEDE (${user?.sede?.toUpperCase() || 'LOCAL'})`}
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
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.2 }}>
                Directorio de Miembros
              </Typography>
              <Typography variant="body2" sx={{ color: '#E2E8F0', mt: 0.8, maxWidth: 680 }}>
                {canManageAllSedes
                  ? 'Como Superadmin tienes potestad nacional para registrar y gestionar nuevos miembros en cualquiera de las 5 sedes de Restauración.'
                  : `Como Administrador de Sede puedes registrar y administrar a los miembros de tu congregación local.`}
              </Typography>
            </Box>

            {/* Add Member CTA Button */}
            {isAdmin && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 3,
                  py: 1.3,
                  borderRadius: 2.5,
                  boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
                  '&:hover': {
                    backgroundColor: '#B45309',
                    boxShadow: '0 10px 24px rgba(217, 119, 6, 0.45)'
                  }
                }}
              >
                + Registrar Nuevo Miembro
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Metrics Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Miembros
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
              Registrados
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Bautizados
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
              {stats.bautizados}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              En comunión
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Por Bautizar
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
              {stats.porBautizar}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>
              En discipulado
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Servidores & Líderes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5 }}>
              {stats.servidores}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
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
                            label={member.role || 'MIEMBRO'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              mt: 0.4,
                              backgroundColor: member.role === 'SERVIDOR' || member.role === 'LIDER' ? '#EFF6FF' : '#F1F5F9',
                              color: member.role === 'SERVIDOR' || member.role === 'LIDER' ? '#1D4ED8' : '#475569'
                            }}
                          />
                        </Box>
                      </Stack>
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

                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.email}
                        </Typography>
                      </Stack>

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
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <form onSubmit={handleSubmitMember}>
          <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Registrar Nuevo Miembro
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
              severity={canManageAllSedes ? "info" : "success"}
              icon={canManageAllSedes ? <GlobalIcon /> : <LockIcon />}
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              {canManageAllSedes ? (
                <span>
                  <strong>Modo Superadmin (Nacional):</strong> Puedes elegir en el selector cualquiera de las 5 sedes para asociar al nuevo miembro.
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
                  label="Nombre Completo del Miembro"
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

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-role-label">Rol Congregacional</InputLabel>
                  <Select
                    labelId="modal-role-label"
                    value={formData.role}
                    label="Rol Congregacional"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
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
                backgroundColor: '#83050B',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3,
                '&:hover': { backgroundColor: '#5B0307' }
              }}
            >
              {submitting ? 'Guardando...' : 'Registrar Miembro'}
            </Button>
          </DialogActions>
        </form>
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
