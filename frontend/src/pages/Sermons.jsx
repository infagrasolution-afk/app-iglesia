import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  IconButton,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Fab
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  PictureAsPdf as PdfIcon,
  Headphones as HeadphonesIcon,
  Mic as SpeakerIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Podcasts as SermonIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { sermonAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showLocalNotification } from '../services/notificationService';

export default function Sermons() {
  const { currentRole } = useAuth();
  const isPastorOrAdmin = currentRole === 'ADMIN' || currentRole === 'PASTOR';

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Admin Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    series: '',
    speaker: 'Pastor Luis Infante',
    audio_url: '',
    video_url: '',
    pdf_url: ''
  });

  const fetchSermons = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await sermonAPI.getAll();
      setSermons(data || []);
    } catch (e) {
      setErrorMsg('Error al cargar los sermones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      series: 'Serie General',
      speaker: 'Pastor Luis Infante',
      audio_url: '',
      video_url: '',
      pdf_url: ''
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      series: item.series || 'Serie General',
      speaker: item.speaker || 'Pastor Luis Infante',
      audio_url: item.audio_url || '',
      video_url: item.video_url || '',
      pdf_url: item.pdf_url || ''
    });
    setDialogOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const fileTitle = file.name.replace(/\.[^/.]+$/, '');
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

      setFormData((prev) => ({
        ...prev,
        title: prev.title || fileTitle,
        pdf_url: isPdf ? dataUrl : prev.pdf_url,
        video_url: isVideo ? dataUrl : prev.video_url,
        audio_url: (!isVideo && !isPdf) ? dataUrl : prev.audio_url
      }));
      setSuccessMsg(`Archivo "${file.name}" cargado exitosamente desde su dispositivo.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSermon = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingItem) {
        await sermonAPI.update(editingItem.id, formData);
        setSuccessMsg(`"${formData.title}" actualizado exitosamente.`);
      } else {
        await sermonAPI.create(formData);
        setSuccessMsg(`"${formData.title}" publicado exitosamente.`);
        showLocalNotification('🎙️ Nuevo Sermón / Podcast', `${formData.title} - ${formData.speaker || 'Iglesia Restauración'}`, '/sermons');
      }
      setDialogOpen(false);
      fetchSermons();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el sermón.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await sermonAPI.delete(deleteId);
      setSuccessMsg('Sermón eliminado correctamente.');
      setDeleteId(null);
      fetchSermons();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar el sermón.');
      setDeleteId(null);
    }
  };

  const handlePlayAudio = (sermon) => {
    if (currentTrack?.id === sermon.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(sermon);
      setIsPlaying(true);
    }
  };

  return (
    <Box sx={{ py: 1, pb: currentTrack ? 10 : 2 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Sermones y Podcast Pastoral
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Escucha la predicación de la Palabra, descarga bosquejos en PDF y revive las series doctrinales.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSermons} sx={{ textTransform: 'none', borderRadius: 2 }}>
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
              Agregar Sermón / Podcast
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Sermons Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} md={4} key={n}>
              <Skeleton variant="rounded" height={240} />
            </Grid>
          ))}
        </Grid>
      ) : sermons.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, my: 2 }}>
          <SermonIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#64748B' }}>
            No hay sermones o podcast publicados actualmente.
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Los recursos son publicados y gestionados directamente por el Pastor o Administradores.
          </Typography>
          {isPastorOrAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ mt: 2.5, borderRadius: 2, textTransform: 'none' }}>
              Publicar primer sermón
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sermons.map((sermon) => {
            const isSelected = currentTrack?.id === sermon.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Chip
                      label={sermon.series || 'Serie General'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1.5, fontWeight: 600 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0F172A', fontSize: '1.1rem' }}>
                      {sermon.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B', mb: 2 }}>
                      <SpeakerIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{sermon.speaker}</Typography>
                    </Box>
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {sermon.audio_url && (
                        <Button
                          size="small"
                          variant={isSelected && isPlaying ? 'contained' : 'outlined'}
                          startIcon={isSelected && isPlaying ? <PauseIcon /> : <PlayIcon />}
                          onClick={() => handlePlayAudio(sermon)}
                        >
                          {isSelected && isPlaying ? 'Pausar' : 'Escuchar'}
                        </Button>
                      )}

                      {sermon.pdf_url && (
                        <Button
                          size="small"
                          color="secondary"
                          variant="outlined"
                          startIcon={<PdfIcon sx={{ color: '#E11D48' }} />}
                          component="a"
                          href={sermon.pdf_url}
                          target="_blank"
                        >
                          PDF
                        </Button>
                      )}
                    </Box>

                    {isPastorOrAdmin && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(sermon)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(sermon.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
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

      {/* Admin Dialog: Create / Edit Sermon */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveSermon}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Editar Sermón / Podcast' : 'Publicar Nuevo Sermón'}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del Sermón / Predica"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej. Viviendo por Fe en Tiempos de Incertidumbre"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serie o Tema Doctrinal"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  placeholder="ej. Serie: Fundamentos Inconmovibles"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Predicador / Orador"
                  required
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                />
              </Grid>

              {/* Botón de Carga Directa desde PC / Teléfono */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', backgroundColor: '#F8FAFC', border: '1px dashed #0284C7', borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', mb: 1 }}>
                    📁 Subir Archivo (Audio MP3, Video o Bosquejo PDF) desde tu Dispositivo
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ backgroundColor: '#0284C7', textTransform: 'none', borderRadius: 2, '&:hover': { backgroundColor: '#0369A1' } }}
                  >
                    Seleccionar Audio, Video o Documento PDF
                    <input type="file" hidden accept="audio/*,video/*,application/pdf,.pdf" onChange={handleFileUpload} />
                  </Button>
                  {((formData.audio_url && formData.audio_url.startsWith('data:')) ||
                    (formData.video_url && formData.video_url.startsWith('data:')) ||
                    (formData.pdf_url && formData.pdf_url.startsWith('data:'))) && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#059669', fontWeight: 600 }}>
                      ✓ Archivo (Audio, Video o Bosquejo PDF) cargado correctamente desde su equipo.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL del Audio MP3 / Podcast"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  placeholder="https://.../sermon.mp3"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL del Video de la Predica (Opcional)"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL del Bosquejo / Resumen en PDF (Opcional)"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://.../bosquejo.pdf"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#0F172A', '&:hover': { backgroundColor: '#1E293B' } }}>
              {editingItem ? 'Guardar Cambios' : 'Publicar Sermón'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea eliminar este sermón de la aplicación?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Audio Player Widget */}
      {currentTrack && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: { xs: 64, md: 24 },
            left: { xs: 16, sm: 'auto' },
            right: { xs: 16, sm: 24 },
            width: { sm: 420 },
            zIndex: 1200,
            p: 2,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <HeadphonesIcon sx={{ color: '#94A3B8' }} />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {currentTrack.title}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#94A3B8', display: 'block' }}>
                  {currentTrack.speaker}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setCurrentTrack(null)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <audio
            controls
            autoPlay
            src={currentTrack.audio_url}
            style={{ width: '100%', height: '36px', marginTop: '4px' }}
          />
        </Paper>
      )}
    </Box>
  );
}
