import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
  Skeleton,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  VolunteerActivism as PrayerIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  PersonOff as AnonymousIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { prayerAPI, userAPI } from '../services/api';
import { showLocalNotification } from '../services/notificationService';

export default function PrayerWall() {
  const { currentRole, user } = useAuth();

  // State
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Todas, 1: En Oración, 2: Respondidas, 3: Solo Líderes
  const [searchQuery, setSearchQuery] = useState('');
  const [prayedSet, setPrayedSet] = useState(new Set());

  // Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Target User State for Private Prayers
  const [userList, setUserList] = useState([]);
  const [selectedTargetUser, setSelectedTargetUser] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUserList(data);
    } catch (e) {
      console.warn('Error loading users list for prayer targeting:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch Prayers
  const fetchPrayers = async () => {
    setLoading(true);
    try {
      let statusFilter = 'all';
      if (activeTab === 1) statusFilter = 'active';
      if (activeTab === 2) statusFilter = 'answered';

      const data = await prayerAPI.getAll(statusFilter, currentRole);
      setPrayers(data);
    } catch (err) {
      console.error('Error al cargar peticiones de oración:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, [activeTab, currentRole]);

  // Handle Pray Action (Incremental Realtime Counter)
  const handlePrayClick = async (id) => {
    // Optimistic UI update
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayer_count: p.prayer_count + 1 } : p))
    );

    setPrayedSet((prev) => new Set(prev).add(id));

    try {
      await prayerAPI.pray(id);
    } catch (err) {
      console.error('Error al registrar oración:', err);
    }
  };

  // Handle Status Update (Mark as Answered)
  const handleMarkAnswered = async (id) => {
    try {
      await prayerAPI.updateStatus(id, 'answered');
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'answered' } : p))
      );
      setSuccessMessage('¡Petición marcada como respondida! Gloria a Dios.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  // Handle Form Submission
  const handleSubmitNewPrayer = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetail.trim()) return;

    setSubmitting(true);
    try {
      const finalVisibility = visibility === 'TARGETED_USER' ? `USER_${selectedTargetUser}` : visibility;

      const created = await prayerAPI.create({
        title: newTitle,
        description: newDetail,
        is_anonymous: isAnonymous,
        visibility: finalVisibility
      });

      setPrayers([created, ...prayers]);
      setOpenModal(false);
      setNewTitle('');
      setNewDetail('');
      setIsAnonymous(false);
      setVisibility('PUBLIC');
      setSelectedTargetUser('');
      setUserSearchQuery('');

      if (finalVisibility === 'PUBLIC') {
        showLocalNotification(
          '🙏 Nueva Petición de Oración',
          `${newTitle} - Publicada por ${isAnonymous ? 'Anónimo' : (user?.full_name || 'un hermano')}`,
          '/prayers'
        );
      } else if (finalVisibility === 'LEADERS') {
        showLocalNotification(
          '🔒 Petición Confidencial para Líderes',
          `${newTitle} - Solicitud de intercesión pastoral`,
          '/prayers'
        );
      } else if (finalVisibility.startsWith('USER_')) {
        const targetObj = userList.find((u) => u.id.toString() === selectedTargetUser);
        showLocalNotification(
          '🔒 Petición Privada enviada',
          `Petición enviada a ${targetObj?.full_name || 'el miembro seleccionado'}: ${newTitle}`,
          '/prayers'
        );
      }

      setSuccessMessage('Tu petición de oración ha sido registrada con éxito.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error al publicar oración:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List by Search & Tab
  const filteredPrayers = prayers.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author_name && p.author_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 3) {
      return matchesSearch && p.visibility === 'LEADERS';
    }
    return matchesSearch;
  });

  return (
    <Box sx={{ py: 1 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 0.5 }}>
            Muro de Oración Interactivo
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            "Llevad los unos las cargas de los otros, y cumplid así la ley de Cristo." (Gálatas 6:2)
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ px: 2.5, py: 1.2, width: { xs: '100%', sm: 'auto' } }}
        >
          Nueva Petición
        </Button>
      </Box>

      {/* Success Alert Banner */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Search and Filters Bar */}
      <Box sx={{ mb: 3.5, borderBottom: 1, borderColor: 'divider', pb: 0 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} md={7}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  minHeight: 48,
                }
              }}
            >
              <Tab label="Todas las Peticiones" />
              <Tab label="En Oración" />
              <Tab label="Respondidas" />
              {(currentRole === 'ADMIN' || currentRole === 'LIDER') && (
                <Tab label="Solo Líderes" icon={<LockIcon sx={{ fontSize: '0.9rem' }} />} iconPosition="end" />
              )}
            </Tabs>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar petición o por motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px', backgroundColor: '#FFFFFF' }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Prayers Cards Grid Feed */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} md={6} key={n}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredPrayers.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          <PrayerIcon sx={{ fontSize: '3rem', color: '#94A3B8', mb: 1.5 }} />
          <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.5 }}>
            No se encontraron peticiones de oración
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
            Sé el primero en compartir un motivo de oración con nuestra comunidad.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            Publicar Petición
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPrayers.map((prayer) => {
            const hasPrayed = prayedSet.has(prayer.id);
            const isAnswered = prayer.status === 'answered';

            return (
              <Grid item xs={12} md={6} key={prayer.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isAnswered ? '1px solid #0D9488' : '1px solid #E2E8F0',
                    backgroundColor: isAnswered ? 'rgba(204, 251, 241, 0.15)' : '#FFFFFF'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Top Metadata Badges */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={isAnswered ? 'Respondida' : 'En Oración'}
                          color={isAnswered ? 'success' : 'primary'}
                          size="small"
                          variant={isAnswered ? 'filled' : 'outlined'}
                        />
                        {prayer.visibility === 'LEADERS' && (
                          <Chip
                            icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />}
                            label="Solo Líderes"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {prayer.is_anonymous && (
                          <Chip
                            icon={<AnonymousIcon sx={{ fontSize: '0.75rem !important' }} />}
                            label="Anónimo"
                            size="small"
                            variant="outlined"
                            sx={{ color: '#64748B' }}
                          />
                        )}
                      </Stack>
                    </Box>

                    {/* Title */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#0F172A' }}>
                      {prayer.title}
                    </Typography>

                    {/* Description Body */}
                    <Typography variant="body1" sx={{ color: '#334155', mb: 2.5, whiteSpace: 'pre-line' }}>
                      {prayer.description}
                    </Typography>

                    {/* Author & Timestamp Footer */}
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      Publicado por: <strong>{prayer.author_name}</strong>
                    </Typography>
                  </CardContent>

                  {/* Card Actions: Pray button & Admin status trigger */}
                  <CardActions sx={{ px: 3, pb: 2.5, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="medium"
                      variant={hasPrayed ? 'contained' : 'outlined'}
                      color={hasPrayed ? 'primary' : 'inherit'}
                      startIcon={hasPrayed ? <FavoriteIcon /> : <FavoriteBorderIcon sx={{ color: '#E11D48' }} />}
                      onClick={() => handlePrayClick(prayer.id)}
                      sx={{
                        borderRadius: '20px',
                        px: 2,
                        borderColor: '#E2E8F0',
                        fontSize: '0.85rem'
                      }}
                    >
                      {hasPrayed ? 'Unido en Oración' : 'Unirme en Oración'}
                      <Chip
                        label={prayer.prayer_count}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: hasPrayed ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                          color: hasPrayed ? '#FFFFFF' : '#0F172A',
                          fontWeight: 700
                        }}
                      />
                    </Button>

                    {(currentRole === 'ADMIN' || currentRole === 'LIDER') && !isAnswered && (
                      <Tooltip title="Marcar como oración contestada por Dios">
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleMarkAnswered(prayer.id)}
                          sx={{ fontSize: '0.8rem' }}
                        >
                          Marcar Respondida
                        </Button>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Floating Action Button (Mobile optimization) */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpenModal(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 32 },
          right: 24,
          zIndex: 1000,
          boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.2)'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog Modal for New Prayer Request */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, pt: 3 }}>
          Publicar Petición de Oración
        </DialogTitle>
        <form onSubmit={handleSubmitNewPrayer}>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
              Comparte tu necesidad espiritual con la iglesia. Tu comunidad estará orando por ti.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Título del Motivo de Oración"
                placeholder="Ej: Salud de mi familiar, Trabajo, Paz interior..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Detalle de la Petición"
                placeholder="Explica brevemente tu necesidad para que podamos interceder con entendimiento..."
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
              />

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="visibility-label">Visibilidad de la Petición</InputLabel>
                    <Select
                      labelId="visibility-label"
                      value={visibility}
                      label="Visibilidad de la Petición"
                      onChange={(e) => setVisibility(e.target.value)}
                    >
                      <MenuItem value="PUBLIC">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PublicIcon fontSize="small" sx={{ color: '#2563EB' }} />
                          Pública (Toda la Iglesia)
                        </Box>
                      </MenuItem>
                      <MenuItem value="LEADERS">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LockIcon fontSize="small" sx={{ color: '#475569' }} />
                          Confidencial (Solo Líderes y Pastores)
                        </Box>
                      </MenuItem>
                      <MenuItem value="TARGETED_USER">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" sx={{ color: '#059669' }} />
                          Privada a un Miembro en Particular
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Publicar como Anónimo"
                  />
                </Grid>
              </Grid>

              {/* Selector de Miembro Específico con Buscador */}
              {visibility === 'TARGETED_USER' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    🎯 Seleccionar Destinatario de la Petición Privada
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar hermano o miembro por nombre..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 1.5 }}
                  />

                  <FormControl fullWidth size="small" required>
                    <InputLabel>Seleccionar Persona *</InputLabel>
                    <Select
                      value={selectedTargetUser}
                      label="Seleccionar Persona *"
                      onChange={(e) => setSelectedTargetUser(e.target.value)}
                    >
                      {userList
                        .filter(
                          (u) =>
                            u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                        )
                        .map((u) => (
                          <MenuItem key={u.id} value={u.id.toString()}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" sx={{ color: '#0284C7' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.full_name}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>({u.email}) - {u.role}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Paper>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !newTitle.trim() || !newDetail.trim()}
              startIcon={<PrayerIcon />}
            >
              {submitting ? 'Publicando...' : 'Publicar Petición'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
