import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  IconButton,
  Divider,
  Skeleton,
  Stack
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  PictureAsPdf as PdfIcon,
  YouTube as YouTubeIcon,
  Headphones as HeadphonesIcon,
  Mic as SpeakerIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { sermonAPI } from '../services/api';

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await sermonAPI.getAll();
        setSermons(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 0.5 }}>
          Sermones y Recursos Multimedia
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Escucha la predicación de la Palabra, descarga bosquejos en PDF y revive las series doctrinales.
        </Typography>
      </Box>

      {/* Sermons Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} md={4} key={n}>
              <Skeleton variant="rounded" height={240} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {sermons.map((sermon) => {
            const isSelected = currentTrack?.id === sermon.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Chip
                      label={sermon.series}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1.5 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#0F172A' }}>
                      {sermon.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B', mb: 2 }}>
                      <SpeakerIcon fontSize="small" />
                      <Typography variant="body2">{sermon.speaker}</Typography>
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
                      >
                        {isSelected && isPlaying ? 'Pausar Audio' : 'Escuchar Audio'}
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
