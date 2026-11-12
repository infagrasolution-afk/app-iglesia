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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  PictureAsPdf as PdfIcon,
  YouTube as YouTubeIcon,
  Headphones as HeadphonesIcon,
  Mic as SpeakerIcon,
  Close as CloseIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Public as GlobalIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { sermonAPI } from '../services/api';
import { getSedesList } from '../data/sedesData';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  } catch {
    return null;
  }
}

export default function Sermons() {
  const { user, currentSede, canManageAllSedes, isSedeAdmin, isAdmin } = useAuth();
  const sedes = getSedesList();
  const canPublish = canManageAllSedes || isSedeAdmin || isAdmin;

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoModalSermon, setVideoModalSermon] = useState(null);

  // Create Sermon Modal State
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('Serie: Fundamentos de Restauración');
  const [speaker, setSpeaker] = useState('Pastor Said Carrasquel');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [targetSede, setTargetSede] = useState('TODAS');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadSermons = async () => {
    setLoading(true);
    try {
      const activeFilter = canManageAllSedes ? (currentSede || 'TODAS') : (user?.sede || currentSede || 'TODAS');
      const data = await sermonAPI.getAll(activeFilter);
      setSermons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, [currentSede, user?.sede]);

  const handlePlayAudio = (sermon) => {
    if (currentTrack?.id === sermon.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(sermon);
      setIsPlaying(true);
    }
  };

  const handleOpenCreate = () => {
    setTitle('');
    setSeries('Serie: Fundamentos de Restauración');
    setSpeaker(canManageAllSedes ? 'Pastor Said Carrasquel' : (user?.full_name || 'Pastor Local'));
    setAudioUrl('');
    setVideoUrl('');
    setPdfUrl('');
    setTargetSede(canManageAllSedes ? (currentSede || 'TODAS') : (user?.sede || 'TODAS'));
    setOpenCreateModal(true);
  };

  const handleCreateSermon = async (e) => {
    e.preventDefault();
    if (!title.trim() || !speaker.trim()) return;
    setSubmitting(true);
    try {
      const finalSede = canManageAllSedes ? targetSede : (user?.sede || 'TODAS');
      const created = await sermonAPI.create({
        title: title.trim(),
        series: series.trim() || 'Mensaje Dominical',
        speaker: speaker.trim(),
        audio_url: audioUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        pdf_url: pdfUrl.trim() || null,
        sede_id: finalSede
      });
      setSermons([created, ...sermons]);
      setOpenCreateModal(false);
      setSuccessMsg('¡Prédica publicada exitosamente en la base de datos!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSermon = async (id) => {
    try {
      await sermonAPI.delete(id);
      setSermons(sermons.filter((s) => s.id !== id));
      if (currentTrack?.id === id) setCurrentTrack(null);
      setSuccessMsg('Prédica eliminada correctamente.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const getSedeName = (sedeId) => {
    if (!sedeId || sedeId === 'TODAS') return 'Nacional (Todas las Sedes)';
    const found = sedes.find((s) => s.id === sedeId);
    return found ? found.shortName || found.name : sedeId;
  };

  const filteredSermons = sermons.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.series?.toLowerCase().includes(q) ||
      s.speaker?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ py: 1, pb: currentTrack ? 10 : 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 0.5 }}>
            Sermones y Recursos Multimedia
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Escucha la predicación de la Palabra, mira las enseñanzas en video y descarga bosquejos en PDF.
          </Typography>
        </Box>
        {canPublish && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: '50px', px: 2.5, fontWeight: 700 }}
          >
            🎙️ Publicar Prédica
          </Button>
        )}
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por título de la prédica, serie doctrinal o predicador..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', backgroundColor: '#FFFFFF' }
          }}
        />
      </Box>

      {/* Sermons Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} md={4} key={n}>
              <Skeleton variant="rounded" height={240} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredSermons.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
          <HeadphonesIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
            No se encontraron prédicas
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Pronto se publicarán nuevos mensajes y bosquejos de edificación espiritual.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredSermons.map((sermon) => {
            const isSelected = currentTrack?.id === sermon.id;
            const isNational = !sermon.sede_id || sermon.sede_id === 'TODAS';

            return (
              <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={sermon.series}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          icon={isNational ? <GlobalIcon sx={{ fontSize: '0.8rem !important' }} /> : <LocationIcon sx={{ fontSize: '0.8rem !important' }} />}
                          label={getSedeName(sermon.sede_id)}
                          size="small"
                          sx={{
                            backgroundColor: isNational ? '#FEF3C7' : '#E0F2FE',
                            color: isNational ? '#92400E' : '#0369A1',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        />
                      </Stack>
                      {canPublish && (
                        <Tooltip title="Eliminar prédica">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSermon(sermon.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
                      {sermon.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B', mb: 1 }}>
                      <SpeakerIcon fontSize="small" sx={{ color: '#83050B' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{sermon.speaker}</Typography>
                    </Box>
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', backgroundColor: '#F8FAFC' }}>
                    {sermon.audio_url && (
                      <Button
                        size="small"
                        variant={isSelected && isPlaying ? 'contained' : 'outlined'}
                        startIcon={isSelected && isPlaying ? <PauseIcon /> : <PlayIcon />}
                        onClick={() => handlePlayAudio(sermon)}
                        sx={{ borderRadius: '50px', fontWeight: 600 }}
                      >
                        {isSelected && isPlaying ? 'Pausar Audio' : 'Escuchar Audio'}
                      </Button>
                    )}

                    {sermon.video_url && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<YouTubeIcon />}
                        onClick={() => {
                          if (getYouTubeEmbedUrl(sermon.video_url)) {
                            setVideoModalSermon(sermon);
                          } else {
                            window.open(sermon.video_url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        sx={{ borderRadius: '50px', fontWeight: 600 }}
                      >
                        Ver Video
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
                        rel="noopener noreferrer"
                        sx={{ borderRadius: '50px', fontWeight: 600 }}
                      >
                        Bosquejo PDF
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Video Player Modal */}
      <Dialog
        open={Boolean(videoModalSermon)}
        onClose={() => setVideoModalSermon(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden', backgroundColor: '#0F172A', color: '#FFFFFF' } }}
      >
        {videoModalSermon && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {videoModalSermon.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {videoModalSermon.speaker} • {videoModalSermon.series}
                </Typography>
              </Box>
              <IconButton onClick={() => setVideoModalSermon(null)} sx={{ color: '#94A3B8' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ position: 'relative', pt: '56.25%', width: '100%' }}>
                <iframe
                  src={getYouTubeEmbedUrl(videoModalSermon.video_url)}
                  title={videoModalSermon.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Create Sermon Modal */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          🎙️ Publicar Nueva Prédica o Recurso
        </DialogTitle>
        <form onSubmit={handleCreateSermon}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {canManageAllSedes && (
              <FormControl fullWidth size="small">
                <InputLabel>Alcance / Sede</InputLabel>
                <Select
                  value={targetSede}
                  label="Alcance / Sede"
                  onChange={(e) => setTargetSede(e.target.value)}
                >
                  <MenuItem value="TODAS" sx={{ fontWeight: 800, color: '#83050B' }}>
                    🌐 TODAS LAS SEDES (Mensaje Nacional)
                  </MenuItem>
                  {sedes.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      📍 {s.name} ({s.city})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              required
              fullWidth
              size="small"
              label="Título de la Prédica *"
              placeholder="Ej: Edificados sobre la Roca Firme"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Serie Doctrinal *"
                  placeholder="Ej: Serie: Familia y Diseño"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Predicador / Pastor *"
                  placeholder="Ej: Pastor Said Carrasquel"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              size="small"
              label="URL de Video (YouTube)"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="URL de Audio (MP3 / Podcast)"
              placeholder="https://.../mensaje.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="URL de Bosquejo en PDF"
              placeholder="https://.../bosquejo.pdf"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreateModal(false)} variant="outlined" sx={{ borderRadius: '50px' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !title.trim() || !speaker.trim()}
              sx={{
                borderRadius: '50px',
                px: 3,
                fontWeight: 700,
                backgroundColor: '#83050B',
                '&:hover': { backgroundColor: '#650409' }
              }}
            >
              {submitting ? 'Guardando...' : 'Publicar Prédica'}
            </Button>
          </DialogActions>
        </form>
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
