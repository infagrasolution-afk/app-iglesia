import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Instagram as InstagramIcon,
  AccountBalance as BankIcon,
  ContentCopy as CopyIcon,
  VolunteerActivism as PrayerIcon,
  YouTube as YouTubeIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Launch as LaunchIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  ManageAccounts as AssignIcon,
  AddLocationAlt as AddLocationIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { getSedesList, CHURCH_INFO } from '../data/sedesData';
import { useAuth } from '../context/AuthContext';
import { sedesAPI } from '../services/api';

export default function Sedes() {
  const navigate = useNavigate();
  const { currentSede, setCurrentSede, isAdmin, canManageAllSedes, assignSedeAdmin, user } = useAuth();
  const [sedesList, setSedesList] = useState(getSedesList());
  const [selectedState, setSelectedState] = useState('ALL');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Admin Assignment Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [targetSedeForEdit, setTargetSedeForEdit] = useState(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminUsername, setEditAdminUsername] = useState('');
  const [editAdminPhone, setEditAdminPhone] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  // Create New Sede Dialog State (Superadmin only)
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingSede, setCreatingSede] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeCity, setNewSedeCity] = useState('');
  const [newSedeState, setNewSedeState] = useState('Distrito Capital');
  const [newSedeLocation, setNewSedeLocation] = useState('');
  const [newSedePastors, setNewSedePastors] = useState('');
  const [newSedeSchedule, setNewSedeSchedule] = useState('Domingos 10:00 AM');
  const [newSedeType, setNewSedeType] = useState('Sede Regional');
  const [newSedeBank, setNewSedeBank] = useState('Banco de Venezuela');
  const [newSedeTaxId, setNewSedeTaxId] = useState('');
  const [newSedePhone, setNewSedePhone] = useState('');
  const [newSedeHolder, setNewSedeHolder] = useState('Iglesia Restauración');
  const [newSedeInstagram, setNewSedeInstagram] = useState('');
  const [newSedeAdminName, setNewSedeAdminName] = useState('');
  const [newSedeAdminUsername, setNewSedeAdminUsername] = useState('');
  const [newSedeAdminPassword, setNewSedeAdminPassword] = useState('123');

  // Delete Sede Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sedeToDelete, setSedeToDelete] = useState(null);

  // Load fresh list
  const refreshSedes = async () => {
    try {
      const data = await sedesAPI.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setSedesList(data);
      }
    } catch {
      setSedesList(getSedesList());
    }
  };

  useEffect(() => {
    refreshSedes();
  }, []);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbarMsg(`¡${label} copiado al portapapeles!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleOpenAssignDialog = (sede) => {
    setTargetSedeForEdit(sede);
    setEditAdminName(sede.sede_admin?.name || sede.pastors || '');
    setEditAdminEmail(sede.sede_admin?.email || `admin.${sede.id}@restauracionglobal.org`);
    setEditAdminUsername(sede.sede_admin?.username || `admin_${sede.id.replace(/-/g, '')}`);
    setEditAdminPhone(sede.sede_admin?.phone || sede.donation?.phone || '');
    setEditAdminNotes(sede.sede_admin?.notes || '');
    setAssignDialogOpen(true);
  };

  const handleSaveAssignAdmin = () => {
    if (!targetSedeForEdit || !editAdminName) return;

    const updated = assignSedeAdmin(targetSedeForEdit.id, {
      name: editAdminName,
      email: editAdminEmail,
      username: editAdminUsername,
      phone: editAdminPhone,
      notes: editAdminNotes,
      assignedBy: user?.name || "Said Carrasquel & Linfante (Superadmin)",
      status: "Activo"
    });

    setSedesList(updated);
    setAssignDialogOpen(false);
    setSnackbarMsg(`¡Administrador de ${targetSedeForEdit.name} asignado con éxito!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setNewSedeName('');
    setNewSedeCity('');
    setNewSedeState('Distrito Capital');
    setNewSedeLocation('');
    setNewSedePastors('');
    setNewSedeSchedule('Domingos 10:00 AM');
    setNewSedeType('Sede Regional');
    setNewSedeBank('Banco de Venezuela');
    setNewSedeTaxId('');
    setNewSedePhone('');
    setNewSedeHolder('Iglesia Restauración');
    setNewSedeInstagram('');
    setNewSedeAdminName('');
    setNewSedeAdminUsername('');
    setNewSedeAdminPassword('123');
    setCreateDialogOpen(true);
  };

  const handleCreateSedeSubmit = async (e) => {
    e.preventDefault();
    if (!newSedeName || !newSedeCity) return;
    setCreatingSede(true);

    try {
      const generatedId = newSedeName.toLowerCase()
        .replace(/restauración|restauracion/gi, '')
        .trim()
        .replace(/\s+/g, '-') || `sede-${Date.now()}`;
      
      const adminUsername = newSedeAdminUsername || `admin_${generatedId.replace(/-/g, '')}`;

      const payload = {
        name: newSedeName.startsWith('Restauración') ? newSedeName : `Restauración ${newSedeName}`,
        shortName: newSedeName.replace(/Restauración |Restauracion /gi, ''),
        city: newSedeCity,
        state: newSedeState,
        location: newSedeLocation || `${newSedeCity}, Edo. ${newSedeState}`,
        pastors: newSedePastors || "Equipo Pastoral",
        schedule: newSedeSchedule,
        type: newSedeType,
        donation: {
          bank: newSedeBank,
          taxId: newSedeTaxId || "V-18599632",
          phone: newSedePhone || "0414-3172261",
          accountHolder: newSedeHolder || newSedeName
        },
        social: {
          instagram: newSedeInstagram || `@restauracion${generatedId}`,
          instagramUrl: `https://www.instagram.com/${(newSedeInstagram || `restauracion${generatedId}`).replace('@', '')}`
        },
        sede_admin: {
          name: newSedeAdminName || newSedePastors || "Administrador Local",
          username: adminUsername,
          password: newSedeAdminPassword || '123',
          phone: newSedePhone,
          email: `${adminUsername}@restauracionglobal.org`,
          role: "ADMIN_SEDE",
          assignedBy: user?.name ? `${user.name} (Superadmin)` : "Pastor Said Carrasquel / Linfante"
        }
      };

      const result = await sedesAPI.create(payload);
      await refreshSedes();
      setCreateDialogOpen(false);
      setSnackbarMsg(`¡Nueva sede "${payload.name}" creada con éxito! El usuario "${adminUsername}" ya puede ingresar con clave "${newSedeAdminPassword}".`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarMsg('Hubo un error al registrar la nueva sede.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCreatingSede(false);
    }
  };

  const handleDeleteSedeConfirm = async () => {
    if (!sedeToDelete) return;
    try {
      await sedesAPI.delete(sedeToDelete.id);
      await refreshSedes();
      setDeleteDialogOpen(false);
      setSnackbarMsg(`Sede "${sedeToDelete.name}" eliminada.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      setSedeToDelete(null);
    } catch (err) {
      console.error(err);
      setSnackbarMsg('Error al eliminar sede.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const filteredSedes = sedesList.filter((sede) => {
    if (selectedState === 'ALL') return true;
    if (selectedState === 'CARACAS') return sede.state === 'Distrito Capital' || sede.state === 'Miranda';
    if (selectedState === 'ARAGUA') return sede.state === 'Aragua';
    if (selectedState === 'ZULIA') return sede.state === 'Zulia';
    return true;
  });

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 50%, #83050B 100%)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip
            icon={<LocationIcon sx={{ color: '#FDE047 !important', fontSize: '1rem' }} />}
            label="PRESENCIA NACIONAL • 5 SEDES"
            size="small"
            sx={{
              backgroundColor: 'rgba(253, 224, 71, 0.15)',
              color: '#FEF08A',
              fontWeight: 700,
              fontSize: '0.76rem',
              letterSpacing: '0.05em',
              mb: 1.5,
              border: '1px solid rgba(253, 224, 71, 0.3)'
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.5rem' }, mb: 1, letterSpacing: '-0.02em' }}>
            Nuestras Sedes
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.82)', maxWidth: '750px', fontSize: { xs: '0.92rem', sm: '1.05rem' }, lineHeight: 1.6 }}>
            {CHURCH_INFO.name} es una comunidad de fe viva presente en Caracas, Aragua y Zulia.
            Ubica tu sede más cercana, conoce a sus pastores, horarios de reunión y formas de ofrendar.
          </Typography>

          {/* Quick Stats & Admin Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem' }}>5</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Sedes Activas</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '1.2rem' }}>2007</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Año de Fundación</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#6EE7B7', fontWeight: 800, fontSize: '1.2rem' }}>4 Días/Sem</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Oración Online 8pm</Typography>
            </Paper>

            {/* SUPER ADMIN / OWNER BUTTONS TO MANAGE SEDES AND ADMINS */}
            {canManageAllSedes && (
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddLocationIcon />}
                  onClick={handleOpenCreateDialog}
                  sx={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '50px',
                    px: 2.8,
                    py: 1,
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                    '&:hover': { backgroundColor: '#059669' }
                  }}
                >
                  ✨ + Crear Nueva Sede
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AssignIcon />}
                  onClick={() => handleOpenAssignDialog(sedesList[0])}
                  sx={{
                    backgroundColor: '#F59E0B',
                    color: '#0F172A',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '50px',
                    px: 2.5,
                    py: 1,
                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                    '&:hover': { backgroundColor: '#D97706' }
                  }}
                >
                  👑 Gestionar Administradores
                </Button>
              </Stack>
            )}
          </Stack>

        </Box>
      </Box>

      {/* Region Filter Tabs */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'center' }}>
        <Paper
          sx={{
            p: 0.5,
            borderRadius: '50px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0'
          }}
        >
          <Tabs
            value={selectedState}
            onChange={(e, val) => setSelectedState(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-indicator': { display: 'none' }
            }}
          >
            <Tab
              value="ALL"
              label="Todas las Sedes (5)"
              sx={tabStyles(selectedState === 'ALL')}
            />
            <Tab
              value="CARACAS"
              label="Caracas / Miranda (3)"
              sx={tabStyles(selectedState === 'CARACAS')}
            />
            <Tab
              value="ARAGUA"
              label="Maracay (1)"
              sx={tabStyles(selectedState === 'ARAGUA')}
            />
            <Tab
              value="ZULIA"
              label="Maracaibo (1)"
              sx={tabStyles(selectedState === 'ZULIA')}
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Sedes Cards Grid */}
      <Grid container spacing={3}>
        {filteredSedes.map((sede) => {
          const isUserSede = currentSede === sede.id;
          return (
            <Grid item xs={12} md={6} key={sede.id}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: isUserSede ? '0 12px 30px rgba(131, 5, 11, 0.25)' : '0 8px 25px rgba(0,0,0,0.06)',
                  border: isUserSede ? '2px solid #83050B' : '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 35px rgba(0,0,0,0.12)'
                  }
                }}
              >
                {/* Header banner with color theme */}
                <Box
                  sx={{
                    p: 2.5,
                    background: sede.bgGradient || 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Chip
                      label={sede.badge}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        mb: 1,
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                      {sede.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: '#FCD34D' }} />
                      {sede.location}
                    </Typography>
                  </Box>

                  {/* Sede badge or indicator & Admin Actions */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {isUserSede && (
                      <Chip
                        icon={<StarIcon sx={{ color: '#FCD34D !important', fontSize: 16 }} />}
                        label="Tu Sede"
                        size="small"
                        sx={{
                          backgroundColor: '#FFFFFF',
                          color: '#83050B',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                      />
                    )}

                    {canManageAllSedes && (
                      <Tooltip title={`Eliminar Sede ${sede.name}`}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSedeToDelete(sede);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{
                            color: 'rgba(255,255,255,0.85)',
                            backgroundColor: 'rgba(239, 68, 68, 0.25)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            '&:hover': {
                              backgroundColor: '#EF4444',
                              color: '#FFFFFF'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>


                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Schedule & Meeting pill */}
                  <Box
                    sx={{
                      p: 1.6,
                      borderRadius: '14px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <ScheduleIcon sx={{ color: '#0F172A', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Horario de Reunión
                      </Typography>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.98rem' }}>
                        {sede.schedule}
                      </Typography>
                    </Box>
                  </Box>

                  {/* SEDE ADMIN BADGE & INFO */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography sx={{ color: '#1E40AF', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AdminIcon sx={{ fontSize: 16 }} />
                        Administrador de Sede
                      </Typography>
                      {canManageAllSedes && (
                        <Tooltip title="Asignar o Cambiar Administrador de esta Sede">
                          <Button
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenAssignDialog(sede)}
                            sx={{
                              fontSize: '0.72rem',
                              textTransform: 'none',
                              fontWeight: 700,
                              py: 0.2,
                              px: 1,
                              borderRadius: '50px',
                              backgroundColor: '#FFFFFF',
                              color: '#1E40AF',
                              border: '1px solid #93C5FD'
                            }}
                          >
                            Asignar Admin
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#1E3A8A', fontSize: '0.95rem' }}>
                      {sede.sede_admin?.name || sede.pastors}
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem' }}>
                      Usuario: <code>{sede.sede_admin?.username || `admin_${sede.id.replace('-', '')}`}</code> • Estado: <span style={{ color: '#059669', fontWeight: 700 }}>Activo</span>
                    </Typography>
                  </Box>

                  {/* Pastoral Team */}
                  <Box>
                    <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                      Pastores de la Sede
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                      {sede.pastors}
                    </Typography>
                    {sede.team && (
                      <Typography sx={{ color: '#64748B', fontSize: '0.82rem', mt: 0.3 }}>
                        {sede.team}
                      </Typography>
                    )}
                  </Box>

                  {/* Description */}
                  <Typography sx={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {sede.description}
                  </Typography>

                  <Divider />

                  {/* Giving / Donation Info */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <BankIcon sx={{ fontSize: 18, color: '#83050B' }} />
                        Datos para Diezmos y Ofrendas
                      </Typography>
                      <Chip label={sede.donation.bank} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem', backgroundColor: '#FFFFFF' }} />
                    </Box>

                    <Stack spacing={0.6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Cédula / RIF: <strong>{sede.donation.taxId}</strong>
                        </Typography>
                        <Tooltip title="Copiar Cédula">
                          <IconButton size="small" onClick={() => handleCopy(sede.donation.taxId, 'Cédula/RIF')}>
                            <CopyIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Pago Móvil: <strong>{sede.donation.phone}</strong>
                        </Typography>
                        <Tooltip title="Copiar Teléfono">
                          <IconButton size="small" onClick={() => handleCopy(sede.donation.phone, 'Teléfono Pago Móvil')}>
                            <CopyIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions Row */}
                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                    {sede.social.instagramUrl && (
                      <Button
                        component="a"
                        href={sede.social.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<InstagramIcon />}
                        endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          borderColor: '#E2E8F0',
                          color: '#475569',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': { borderColor: '#E1306C', color: '#E1306C' }
                        }}
                      >
                        {sede.social.instagram}
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PeopleIcon sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        setCurrentSede(sede.id);
                        navigate('/members');
                      }}
                      sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        borderColor: '#0D9488',
                        color: '#0D9488',
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                          borderColor: '#0F766E',
                          backgroundColor: 'rgba(13, 148, 136, 0.08)'
                        }
                      }}
                    >
                      Directorio de Miembros
                    </Button>

                    {canManageAllSedes && (
                      <Button
                        size="small"
                        variant={isUserSede ? 'contained' : 'outlined'}
                        onClick={() => setCurrentSede(sede.id)}
                        sx={{
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          ml: { xs: 0, sm: 'auto' },
                          width: { xs: '100%', sm: 'auto' },
                          backgroundColor: isUserSede ? '#0F172A' : 'transparent',
                          borderColor: '#0F172A',
                          color: isUserSede ? '#FFFFFF' : '#0F172A'
                        }}
                      >
                        {isUserSede ? 'Sede Seleccionada' : 'Filtrar por esta Sede'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ADMIN ASSIGNMENT MODAL DIALOG */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', m: { xs: 1, sm: 2 }, p: { xs: 0.5, sm: 1 }, maxHeight: '92vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon sx={{ color: '#F59E0B' }} />
          Asignar Administrador de Sede
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, pt: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <Typography sx={{ color: '#92400E', fontSize: '0.84rem', fontWeight: 700 }}>
              Asignación autorizada por: {user?.name || "L. Infante / Pastor Principal"}
            </Typography>
            <Typography sx={{ color: '#B45309', fontSize: '0.78rem' }}>
              El administrador asignado tendrá autoridad local para evaluar actividades, gestionar anuncios y supervisar miembros en su sede.
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel id="sede-select-label">Sede a Asignar</InputLabel>
            <Select
              labelId="sede-select-label"
              value={targetSedeForEdit?.id || ''}
              label="Sede a Asignar"
              onChange={(e) => {
                const s = sedesList.find((x) => x.id === e.target.value);
                if (s) handleOpenAssignDialog(s);
              }}
            >
              {sedesList.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Nombre Completo del Administrador de Sede *"
            value={editAdminName}
            onChange={(e) => setEditAdminName(e.target.value)}
            placeholder="Ej: Pastor Wilmer / Alexander López"
            size="small"
          />

          <TextField
            fullWidth
            label="Usuario de Acceso"
            value={editAdminUsername}
            onChange={(e) => setEditAdminUsername(e.target.value)}
            placeholder="Ej: admin_maracay"
            size="small"
            helperText="Usuario para iniciar sesión en la app"
          />

          <TextField
            fullWidth
            label="Correo Electrónico Oficial"
            value={editAdminEmail}
            onChange={(e) => setEditAdminEmail(e.target.value)}
            placeholder="Ej: admin.maracay@restauracionglobal.org"
            size="small"
          />

          <TextField
            fullWidth
            label="Teléfono / Contacto Ministerial"
            value={editAdminPhone}
            onChange={(e) => setEditAdminPhone(e.target.value)}
            placeholder="Ej: 0414-3172261"
            size="small"
          />

          <TextField
            fullWidth
            label="Notas Ministeriales o Facultades"
            value={editAdminNotes}
            onChange={(e) => setEditAdminNotes(e.target.value)}
            placeholder="Facultad delegada para discipulado, finanzas locales y liderazgo"
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAssignDialogOpen(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAssignAdmin}
            variant="contained"
            disabled={!editAdminName}
            sx={{
              backgroundColor: '#83050B',
              color: '#FFFFFF',
              borderRadius: '50px',
              fontWeight: 700,
              px: 3,
              '&:hover': { backgroundColor: '#650409' }
            }}
          >
            Guardar y Asignar Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE NEW SEDE MODAL DIALOG (SUPERADMIN ONLY) */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '22px', m: { xs: 1, sm: 2 }, p: { xs: 0.5, sm: 1.5 }, maxHeight: '92vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <AddLocationIcon sx={{ color: '#10B981' }} />
          Registrar Nueva Sede de Restauración
        </DialogTitle>
        <form onSubmit={handleCreateSedeSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: '68vh', overflowY: 'auto' }}>
            <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <Typography sx={{ color: '#065F46', fontSize: '0.86rem', fontWeight: 800 }}>
                👑 Creación de Sede Exclusiva para Superadmins
              </Typography>
              <Typography sx={{ color: '#047857', fontSize: '0.8rem', mt: 0.3 }}>
                Al registrar esta sede, se creará automáticamente su perfil ministerial, datos para ofrendas locales y el usuario Administrador de Sede para que pueda ingresar inmediatamente.
              </Typography>
            </Box>

            {/* Section 1: Identidad y Ubicación */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Identidad y Ubicación Territorial
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Nombre de la Sede"
                  placeholder="Ej: Restauración Valencia / Restauración San Cristóbal"
                  value={newSedeName}
                  onChange={(e) => setNewSedeName(e.target.value)}
                  helperText="Se mostrará en la cabecera, directorio y selector"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo / Lema de Sede"
                  placeholder="Ej: Sede de Avivamiento"
                  value={newSedeType}
                  onChange={(e) => setNewSedeType(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Ciudad"
                  placeholder="Ej: Valencia, Maracay, Barquisimeto"
                  value={newSedeCity}
                  onChange={(e) => setNewSedeCity(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="new-state-label">Estado</InputLabel>
                  <Select
                    labelId="new-state-label"
                    value={newSedeState}
                    label="Estado"
                    onChange={(e) => setNewSedeState(e.target.value)}
                  >
                    <MenuItem value="Distrito Capital">Distrito Capital</MenuItem>
                    <MenuItem value="Miranda">Miranda</MenuItem>
                    <MenuItem value="Aragua">Aragua</MenuItem>
                    <MenuItem value="Carabobo">Carabobo</MenuItem>
                    <MenuItem value="Zulia">Zulia</MenuItem>
                    <MenuItem value="Lara">Lara</MenuItem>
                    <MenuItem value="Táchira">Táchira</MenuItem>
                    <MenuItem value="Anzoátegui">Anzoátegui</MenuItem>
                    <MenuItem value="Bolívar">Bolívar</MenuItem>
                    <MenuItem value="Otro">Otro Estado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección o Ubicación Exacta"
                  placeholder="Ej: Av. Bolívar Norte, C.C. Camoruco, Nivel 1"
                  value={newSedeLocation}
                  onChange={(e) => setNewSedeLocation(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Section 2: Equipo Pastoral y Horarios */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
              2. Pastores de la Sede y Horarios de Reunión
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pastores Encargados"
                  placeholder="Ej: Pastor Carlos y María Rodríguez"
                  value={newSedePastors}
                  onChange={(e) => setNewSedePastors(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Horario del Servicio Principal"
                  placeholder="Ej: Domingos 10:00 AM / Sábados 4:00 PM"
                  value={newSedeSchedule}
                  onChange={(e) => setNewSedeSchedule(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Instagram Oficial de la Sede"
                  placeholder="@restauracionvalencia"
                  value={newSedeInstagram}
                  onChange={(e) => setNewSedeInstagram(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Section 3: Datos de Ofrendas y Pago Móvil */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
              3. Datos para Ofrendas y Diezmos (Pago Móvil / Banco)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Banco"
                  placeholder="Ej: Banesco, Banplus, Banco de Venezuela"
                  value={newSedeBank}
                  onChange={(e) => setNewSedeBank(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cédula / RIF"
                  placeholder="Ej: V-18599632 / J-50123456"
                  value={newSedeTaxId}
                  onChange={(e) => setNewSedeTaxId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono Pago Móvil"
                  placeholder="Ej: 0414-3172261"
                  value={newSedePhone}
                  onChange={(e) => setNewSedePhone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Titular de la Cuenta"
                  placeholder="Ej: Iglesia Restauración Valencia"
                  value={newSedeHolder}
                  onChange={(e) => setNewSedeHolder(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Section 4: Administrador de Sede Inicial */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
              4. Administrador de la Sede (Credenciales de Acceso)
            </Typography>
            <Box sx={{ p: 1.8, borderRadius: '14px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre del Encargado"
                    placeholder="Ej: Pastor Carlos Rodríguez"
                    value={newSedeAdminName}
                    onChange={(e) => setNewSedeAdminName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Usuario de Acceso"
                    placeholder="Ej: admin_valencia"
                    value={newSedeAdminUsername}
                    onChange={(e) => setNewSedeAdminUsername(e.target.value)}
                    helperText="Con este usuario iniciará sesión"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contraseña Inicial"
                    value={newSedeAdminPassword}
                    onChange={(e) => setNewSedeAdminPassword(e.target.value)}
                    helperText="Predeterminada: 123"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setCreateDialogOpen(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingSede || !newSedeName || !newSedeCity}
              sx={{
                borderRadius: '50px',
                px: 3.5,
                fontWeight: 700,
                backgroundColor: '#10B981',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              {creatingSede ? 'Guardando...' : '🚀 Crear y Habilitar Sede'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIRM DELETE SEDE DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon />
          ¿Eliminar esta Sede?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#334155' }}>
            ¿Estás seguro de que deseas eliminar la sede <strong>{sedeToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#DC2626', mt: 1, fontWeight: 600 }}>
            Esta acción removerá la sede de las listas y directores ministeriales.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteSedeConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: '50px', fontWeight: 700, px: 2.5 }}
          >
            Sí, Eliminar Sede
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}


const tabStyles = (isSelected) => ({
  borderRadius: '50px',
  px: 2.4,
  py: 0.8,
  minHeight: 'auto',
  fontSize: '0.84rem',
  fontWeight: isSelected ? 700 : 500,
  textTransform: 'none',
  color: isSelected ? '#FFFFFF !important' : '#64748B',
  backgroundColor: isSelected ? '#0F172A' : 'transparent',
  transition: 'all 0.2s',
  '&:hover': { color: '#0F172A' }
});
