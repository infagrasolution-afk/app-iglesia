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
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Fab
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  NotificationsActive as AlertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { announcementAPI } from '../services/api';

export default function Announcements() {
  const { currentRole } = useAuth();
  const isPastorOrAdmin = currentRole === 'ADMIN' || currentRole === 'PASTOR';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Avisos Generales');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await announcementAPI.getAll();
      setAnnouncements(data || []);
    } catch (err) {
      setErrorMsg('Error al cargar los anuncios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setCategory('Avisos Generales');
    setIsImportant(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingItem(ann);
    setTitle(ann.title || '');
    setContent(ann.content || '');
    setCategory(ann.category || 'Avisos Generales');
    setIsImportant(Boolean(ann.is_important));
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingItem) {
        await announcementAPI.update(editingItem.id, {
          title,
          content,
          category,
          is_important: isImportant
        });
        setSuccessMsg('Anuncio actualizado exitosamente.');
      } else {
        await announcementAPI.create({
          title,
          content,
          category,
          is_important: isImportant
        });
        setSuccessMsg('Anuncio publicado en el boletín digital.');
      }
      setOpenModal(false);
      fetchAnnouncements();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el anuncio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await announcementAPI.delete(deleteId);
      setSuccessMsg('Anuncio eliminado correctamente.');
      setDeleteId(null);
      fetchAnnouncements();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar el anuncio.');
      setDeleteId(null);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Eventos': return 'info';
      case 'Ayunos': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Boletín Digital y Anuncios
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Mantente informado sobre eventos, jornadas de oración y comunicados oficiales.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAnnouncements} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Actualizar
          </Button>
          {isPastorOrAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#0F172A',
                '&:hover': { backgroundColor: '#1E293B' }
              }}
            >
              Publicar Anuncio
            </Button>
          )}
        </Box>
      </Box>

      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={120} />)}
        </Stack>
      ) : announcements.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, my: 2 }}>
          <CampaignIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#64748B' }}>
            No hay anuncios publicados en el boletín.
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Los comunicados son ingresados directamente por el Pastor o Administradores.
          </Typography>
          {isPastorOrAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ mt: 2.5, borderRadius: 2, textTransform: 'none' }}>
              Publicar primer aviso
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((ann) => (
            <Grid item xs={12} key={ann.id}>
              <Card sx={{ borderLeft: ann.is_important ? '4px solid #D97706' : '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={ann.category}
                        color={getCategoryColor(ann.category)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {ann.is_important && (
                        <Chip
                          icon={<AlertIcon sx={{ fontSize: '0.8rem !important' }} />}
                          label="Destacado"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {new Date(ann.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      {isPastorOrAdmin && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(ann)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => setDeleteId(ann.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
                    {ann.title}
                  </Typography>

                  <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    {ann.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button (FAB) for Admin */}
      {isPastorOrAdmin && (
        <Fab
          color="primary"
          onClick={handleOpenCreate}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 32 },
            right: 24,
            backgroundColor: '#0F172A',
            '&:hover': { backgroundColor: '#1E293B' },
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.3)'
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modal Admin Create / Edit Announcement */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingItem ? 'Editar Anuncio del Boletín' : 'Nuevo Anuncio para la Comunidad'}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSave}>
          <DialogContent sx={{ py: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Título del Anuncio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Culto Especial de Familias"
              />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Contenido del Mensaje"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escriba el comunicado detallado aquí..."
              />
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={category}
                  label="Categoría"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="Eventos">Eventos y Convocatorias</MenuItem>
                  <MenuItem value="Ayunos">Ayunos y Clamores</MenuItem>
                  <MenuItem value="Avisos Generales">Avisos Generales</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />}
                label="Marcar como Anuncio Importante / Destacado"
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ backgroundColor: '#0F172A', '&:hover': { backgroundColor: '#1E293B' } }}>
              {submitting ? 'Guardando...' : editingItem ? 'Guardar Cambios' : 'Publicar Anuncio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea eliminar este aviso del boletín?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
