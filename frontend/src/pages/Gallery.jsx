import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  PlayCircle as PlayIcon,
  PhotoCamera as PhotoIcon,
  Videocam as VideoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Collections as GalleryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { mediaAPI } from '../services/api';
import { showLocalNotification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Todos', 'Cultos', 'Eventos', 'Retiros', 'Jóvenes', 'Escuela Dominical'];

export default function Gallery() {
  const { currentRole } = useAuth();
  const isPastorOrAdmin = currentRole === 'ADMIN' || currentRole === 'PASTOR';

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Photos, 2: Videos
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lightbox / Video Modal State
  const [activeMedia, setActiveMedia] = useState(null);

  // Admin Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'photo',
    url: '',
    thumbnail_url: '',
    category: 'Eventos'
  });

  const fetchMedia = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const typeFilter = tabValue === 1 ? 'photo' : tabValue === 2 ? 'video' : '';
      const data = await mediaAPI.getAll(typeFilter, selectedCategory);
      setMediaList(data || []);
    } catch (err) {
      setErrorMsg('Error al cargar los archivos multimedia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [tabValue, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      media_type: 'photo',
      url: '',
      thumbnail_url: '',
      category: 'Eventos'
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      media_type: item.media_type || 'photo',
      url: item.url || '',
      thumbnail_url: item.thumbnail_url || '',
      category: item.category || 'Eventos'
    });
    setDialogOpen(true);
  };

  const handleSaveMedia = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingItem) {
        await mediaAPI.update(editingItem.id, formData);
        setSuccessMsg(`"${formData.title}" actualizado exitosamente.`);
      } else {
        await mediaAPI.create(formData);
        setSuccessMsg(`"${formData.title}" agregado exitosamente a la galería.`);
        showLocalNotification(
          '📸 Nueva Foto/Video en Galería',
          `Se ha publicado un nuevo ${formData.media_type === 'video' ? 'video' : 'contenido'}: ${formData.title}`,
          '/gallery'
        );
      }
      setDialogOpen(false);
      fetchMedia();
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al guardar el archivo multimedia.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await mediaAPI.delete(deleteId);
      setSuccessMsg('Elemento eliminado de la galería.');
      setDeleteId(null);
      fetchMedia();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar el elemento.');
      setDeleteId(null);
    }
  };

  // Convert YouTube link to Embed URL if applicable
  const getEmbedVideoUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Galería Multimedia
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Fotos y videos de los cultos, eventos y actividades de la Iglesia Restauración.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMedia} sx={{ textTransform: 'none', borderRadius: 2 }}>
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
              Agregar Foto / Video
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

      {/* Type Tabs & Category Chips */}
      <Paper elevation={1} sx={{ mb: 3.5, borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
        >
          <Tab icon={<GalleryIcon />} iconPosition="start" label="Todas" sx={{ fontWeight: 600 }} />
          <Tab icon={<PhotoIcon />} iconPosition="start" label="Fotos" sx={{ fontWeight: 600 }} />
          <Tab icon={<VideoIcon />} iconPosition="start" label="Videos" sx={{ fontWeight: 600 }} />
        </Tabs>

        {/* Category Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', backgroundColor: '#F8FAFC' }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              color={selectedCategory === cat ? 'primary' : 'default'}
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(cat)}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Media Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : mediaList.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <GalleryIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#64748B' }}>
            No hay contenido disponible en esta categoría.
          </Typography>
          {isPastorOrAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}>
              Publicar primera foto o video
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {mediaList.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -8px rgba(15, 23, 42, 0.15)'
                  }
                }}
              >
                {/* Card Media Preview Container */}
                <Box
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backgroundColor: '#0F172A',
                    height: 220
                  }}
                  onClick={() => setActiveMedia(item)}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={item.thumbnail_url || item.url}
                    alt={item.title}
                    sx={{
                      objectFit: 'cover',
                      opacity: item.media_type === 'video' ? 0.85 : 1,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  />

                  {/* Type Badge Top Left */}
                  <Chip
                    icon={item.media_type === 'video' ? <VideoIcon sx={{ color: '#FFFFFF !important' }} /> : <PhotoIcon sx={{ color: '#FFFFFF !important' }} />}
                    label={item.media_type === 'video' ? 'Video' : 'Foto'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      backgroundColor: item.media_type === 'video' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)'
                    }}
                  />

                  {/* Category Badge Top Right */}
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#0F172A',
                      fontWeight: 600
                    }}
                  />

                  {/* Play Overlay Icon for Video */}
                  {item.media_type === 'video' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translate(-50%, -50%) scale(1.1)' }
                      }}
                    >
                      <PlayIcon sx={{ fontSize: 38, color: '#38BDF8' }} />
                    </Box>
                  )}
                </Box>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', mb: 0.8, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>

                  {item.description && (
                    <Typography variant="body2" sx={{ color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </Typography>
                  )}
                </CardContent>

                {/* Admin Actions Footer */}
                {isPastorOrAdmin && (
                  <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 1, backgroundColor: '#F8FAFC' }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
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

      {/* Lightbox / Video Viewer Modal */}
      <Dialog open={Boolean(activeMedia)} onClose={() => setActiveMedia(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {activeMedia && (
          <>
            <Box sx={{ position: 'relative', backgroundColor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
              <IconButton onClick={() => setActiveMedia(null)} sx={{ position: 'absolute', top: 12, right: 12, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
                <CloseIcon />
              </IconButton>

              {activeMedia.media_type === 'video' ? (
                <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' /* 16:9 Aspect Ratio */ }}>
                  <iframe
                    src={getEmbedVideoUrl(activeMedia.url)}
                    title={activeMedia.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              ) : (
                <Box
                  component="img"
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  sx={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
                />
              )}
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Chip label={activeMedia.media_type === 'video' ? 'Video' : 'Foto'} color={activeMedia.media_type === 'video' ? 'error' : 'primary'} size="small" />
                <Chip label={activeMedia.category} variant="outlined" size="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {activeMedia.title}
              </Typography>
              {activeMedia.description && (
                <Typography variant="body1" sx={{ color: '#475569' }}>
                  {activeMedia.description}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Admin Create / Edit Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveMedia}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Editar Archivo Multimedia' : 'Agregar Nueva Foto o Video'}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del Archivo"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej. Culto de Aniversario / Retiro de Jóvenes"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Contenido</InputLabel>
                  <Select
                    value={formData.media_type}
                    label="Tipo de Contenido"
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                  >
                    <MenuItem value="photo">Foto / Imagen 📷</MenuItem>
                    <MenuItem value="video">Video (YouTube / Enlace MP4) 🎥</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={formData.category}
                    label="Categoría"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="Cultos">Cultos y Alabanza</MenuItem>
                    <MenuItem value="Eventos">Eventos Especiales</MenuItem>
                    <MenuItem value="Retiros">Retiros</MenuItem>
                    <MenuItem value="Jóvenes">Jóvenes</MenuItem>
                    <MenuItem value="Escuela Dominical">Escuela Dominical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.media_type === 'video' ? 'Enlace del Video (YouTube o MP4)' : 'URL Directa de la Imagen'}
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={formData.media_type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://images.unsplash.com/...'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL de Vista Previa / Miniatura (Opcional)"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="Si se deja en blanco se utilizará la misma URL de la imagen"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve reseña sobre lo ocurrido en la foto o video..."
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
              {editingItem ? 'Guardar Cambios' : 'Publicar Contenido'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea eliminar esta publicación de la galería multimedia?</Typography>
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
