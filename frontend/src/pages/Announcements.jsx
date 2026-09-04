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
  Alert
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Event as EventIcon,
  NotificationsActive as AlertIcon,
  Add as AddIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { announcementAPI } from '../services/api';

export default function Announcements() {
  const { currentRole } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Avisos Generales');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementAPI.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await announcementAPI.create({
        title,
        content,
        category,
        is_important: isImportant
      });
      setAnnouncements([created, ...announcements]);
      setOpenModal(false);
      setTitle('');
      setContent('');
      setCategory('Avisos Generales');
      setIsImportant(false);
      setSuccessMsg('Anuncio publicado en el boletín digital.');
      setTimeout(() => setSuccessMsg(''), 4000);
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

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 0.5 }}>
            Boletín Digital y Anuncios
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Mantente informado sobre eventos, jornadas de oración y comunicados oficiales.
          </Typography>
        </Box>
        {currentRole === 'ADMIN' && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            Publicar Aviso (Admin)
          </Button>
        )}
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={120} />)}
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((ann) => (
            <Grid item xs={12} key={ann.id}>
              <Card sx={{ borderLeft: ann.is_important ? '4px solid #D97706' : '1px solid #E2E8F0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={ann.category}
                        color={getCategoryColor(ann.category)}
                        size="small"
                      />
                      {ann.is_important && (
                        <Chip
                          icon={<AlertIcon sx={{ fontSize: '0.8rem !important' }} />}
                          label="Destacado"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {new Date(ann.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#0F172A' }}>
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

      {/* Modal Admin Create Announcement */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Anuncio para la Comunidad</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Título del Anuncio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Contenido del Mensaje"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar Anuncio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
