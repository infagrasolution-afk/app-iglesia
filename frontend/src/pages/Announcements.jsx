import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Skeleton,
  Stack,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Event as EventIcon,
  NotificationsActive as AlertIcon,
  Add as AddIcon,
  Bookmark as BookmarkIcon,
  Public as GlobalIcon,
  LocationOn as LocationIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { announcementAPI } from '../services/api';
import { getSedesList } from '../data/sedesData';

export default function Announcements() {
  const { user, currentRole, currentSede, canManageAllSedes, isSedeAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const sedes = getSedesList();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Avisos Generales');
  const [targetSede, setTargetSede] = useState('TODAS');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sede name lookup helper
  const getSedeName = (sedeId) => {
    if (!sedeId || sedeId === 'TODAS') return 'Todas las Sedes (Nacional)';
    const found = sedes.find(s => s.id === sedeId);
    return found ? found.name : sedeId;
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // If user is Sede Admin or regular user: they only see their own sede + TODAS
      // If superadmin: if currentSede is TODAS, sees all; otherwise sees currentSede + TODAS
      const activeSedeFilter = canManageAllSedes ? (currentSede || 'TODAS') : (user?.sede || currentSede || 'TODAS');
      const data = await announcementAPI.getAll(activeSedeFilter);
      
      // Client-side strict filter to guarantee sede privacy
      const filtered = data.filter(item => {
        const itemSede = item.sede_id || 'TODAS';
        if (canManageAllSedes) {
          if (activeSedeFilter === 'TODAS') return true;
          return itemSede === activeSedeFilter || itemSede === 'TODAS';
        }
        const userSede = user?.sede || currentSede;
        return itemSede === userSede || itemSede === 'TODAS';
      });

      setAnnouncements(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentSede, user?.sede]);

  const handleOpenModal = () => {
    // If Sede Admin, target is automatically their sede and CANNOT be changed to TODAS
    if (!canManageAllSedes && (isSedeAdmin || user?.sede)) {
      setTargetSede(user.sede);
    } else {
      setTargetSede(currentSede !== 'TODAS' ? currentSede : 'TODAS');
    }
    setOpenModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalSedeId = canManageAllSedes ? targetSede : (user?.sede || 'TODAS');
      const sedeObj = sedes.find(s => s.id === finalSedeId);
      const sedeName = finalSedeId === 'TODAS' ? 'Todas las Sedes (Nacional)' : (sedeObj ? sedeObj.name : finalSedeId);

      const created = await announcementAPI.create({
        title,
        content,
        category,
        is_important: isImportant,
        sede_id: finalSedeId,
        sede_name: sedeName,
        created_by: user?.name ? `${user.name} (${canManageAllSedes ? 'Superadmin' : 'Admin Sede'})` : 'Administración'
      });
      setAnnouncements([created, ...announcements]);
      setOpenModal(false);
      setTitle('');
      setContent('');
      setCategory('Avisos Generales');
      setIsImportant(false);
      setSuccessMsg(`Anuncio publicado con éxito para: ${sedeName}`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Eventos': return 'info';
      case 'Ayunos': return 'warning';
      default: return 'secondary';
    }
  };

  // Only superadmin or sede admin can create announcements
  const canPublish = canManageAllSedes || isSedeAdmin || currentRole === 'ADMIN';

  const handleDelete = async (id) => {
    try {
      await announcementAPI.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setSuccessMsg('Anuncio eliminado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
              Boletín Digital y Anuncios
            </Typography>
            {canManageAllSedes ? (
              <Chip
                label={currentSede === 'TODAS' ? 'Alcance: Nacional (Todas las Sedes)' : `Sede: ${getSedeName(currentSede)}`}
                color={currentSede === 'TODAS' ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Chip
                label={`Sede Local: ${getSedeName(user?.sede || currentSede)}`}
                color="secondary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            {canManageAllSedes
              ? 'Como Superadmin puedes publicar comunicados a nivel nacional (todas las sedes) o dirigidos a una sede en específico.'
              : isSedeAdmin
              ? `Como Administrador de Sede, los anuncios que publiques afectarán única y exclusivamente a ${getSedeName(user?.sede)}.`
              : 'Mantente informado sobre eventos, jornadas de oración y comunicados oficiales.'}
          </Typography>
        </Box>
        {canPublish && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ borderRadius: '50px', px: 2.5, fontWeight: 700 }}
          >
            {canManageAllSedes ? '📢 Publicar Anuncio (Superadmin)' : '📢 Publicar en mi Sede'}
          </Button>
        )}
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMsg}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={120} sx={{ borderRadius: '16px' }} />)}
        </Stack>
      ) : announcements.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
          <CampaignIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
            No hay anuncios para esta sede en este momento
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Los comunicados nacionales o publicados por tu pastor aparecerán aquí.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((ann) => {
            const isNational = !ann.sede_id || ann.sede_id === 'TODAS';
            return (
              <Grid item xs={12} key={ann.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    borderLeft: ann.is_important ? '5px solid #D97706' : (isNational ? '5px solid #83050B' : '5px solid #0284C7'),
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        {/* Scope Chip: National vs Sede */}
                        {isNational ? (
                          <Chip
                            icon={<GlobalIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label="Nacional (Todas las Sedes)"
                            size="small"
                            sx={{
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              fontWeight: 800,
                              border: '1px solid #FCD34D'
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<LocationIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={ann.sede_name || getSedeName(ann.sede_id)}
                            size="small"
                            sx={{
                              backgroundColor: '#E0F2FE',
                              color: '#0369A1',
                              fontWeight: 700,
                              border: '1px solid #BAE6FD'
                            }}
                          />
                        )}

                        <Chip
                          label={ann.category}
                          color={getCategoryColor(ann.category)}
                          size="small"
                        />

                        {ann.is_important && (
                          <Chip
                            icon={<AlertIcon sx={{ fontSize: '0.8rem !important' }} />}
                            label="Importante"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Stack>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          {ann.created_by && `${ann.created_by} • `}
                          {new Date(ann.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                        {canPublish && (canManageAllSedes || ann.sede_id === user?.sede) && (
                          <Tooltip title="Eliminar anuncio">
                            <IconButton size="small" color="error" onClick={() => handleDelete(ann.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
                      {ann.title}
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {ann.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Admin Create Announcement */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {canManageAllSedes ? 'Nuevo Anuncio (Superadmin)' : `Nuevo Anuncio para Sede: ${getSedeName(user?.sede)}`}
        </DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {/* Scope / Sede Selection */}
            {canManageAllSedes ? (
              <FormControl fullWidth size="small">
                <InputLabel id="target-sede-label">¿A qué Sede afectará este anuncio? *</InputLabel>
                <Select
                  labelId="target-sede-label"
                  value={targetSede}
                  label="¿A qué Sede afectará este anuncio? *"
                  onChange={(e) => setTargetSede(e.target.value)}
                >
                  <MenuItem value="TODAS" sx={{ fontWeight: 800, color: '#83050B' }}>
                    🌐 TODAS LAS SEDES (Comunicado Nacional)
                  </MenuItem>
                  {sedes.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      📍 {s.name} ({s.city})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Typography sx={{ color: '#1E40AF', fontSize: '0.84rem', fontWeight: 700 }}>
                  📍 Sede Destino: {getSedeName(user?.sede)}
                </Typography>
                <Typography sx={{ color: '#3B82F6', fontSize: '0.78rem' }}>
                  Este anuncio solo será visible por miembros y líderes de tu sede local. No afectará a otras sedes.
                </Typography>
              </Box>
            )}

            <TextField
              required
              fullWidth
              label="Título del Anuncio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gran Vigilia de Oración y Alabanza"
              size="small"
            />

            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Contenido del Mensaje"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe los detalles, fecha, horario y convocatoria..."
            />

            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={category}
                label="Categoría"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Eventos">Eventos y Convocatorias</MenuItem>
                <MenuItem value="Ayunos">Ayunos y Clamores</MenuItem>
                <MenuItem value="Avisos Generales">Avisos Generales</MenuItem>
                <MenuItem value="Discipulado">Discipulado y Crecimiento</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} color="warning" />}
              label="Marcar como Anuncio Importante / Destacado"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !title || !content}
              sx={{
                borderRadius: '50px',
                px: 3,
                fontWeight: 700,
                backgroundColor: '#83050B',
                '&:hover': { backgroundColor: '#650409' }
              }}
            >
              {submitting ? 'Publicando...' : 'Publicar Anuncio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
