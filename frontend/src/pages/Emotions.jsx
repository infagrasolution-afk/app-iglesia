import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Tooltip,
  Paper,
  Stack,
  Fade,
  Zoom,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  VolumeUp as SoundIcon,
  Stop as StopIcon,
  Search as SearchIcon,
  MenuBook as BibleIcon,
  SentimentVerySatisfied as HappyIcon,
  WbSunny as BlessedIcon,
  Spa as AngryIcon,
  Bedtime as AnxiousIcon,
  Diversity3 as LonelyIcon,
  Healing as SadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  FormatQuote as QuoteIcon,
  EmojiEmotions as EmotionIcon,
  Inventory2 as JarIcon
} from '@mui/icons-material';

import {
  EMOTIONS_DATA,
  THEME_HEADER,
  getRandomVerseByEmotion,
  getRandomVerseFromJar
} from '../data/emotionsData';
import { emotionAPI } from '../services/api';

// Map icon component according to emotion id
function getEmotionIcon(id, size = 28) {
  switch (id) {
    case 'feliz':
      return <HappyIcon sx={{ fontSize: size }} />;
    case 'bendecido':
      return <BlessedIcon sx={{ fontSize: size }} />;
    case 'enojado':
      return <AngryIcon sx={{ fontSize: size }} />;
    case 'ansioso':
      return <AnxiousIcon sx={{ fontSize: size }} />;
    case 'solitario':
      return <LonelyIcon sx={{ fontSize: size }} />;
    case 'triste':
      return <SadIcon sx={{ fontSize: size }} />;
    default:
      return <EmotionIcon sx={{ fontSize: size }} />;
  }
}

export default function Emotions() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Active view tab (0: Frasco & Emociones, 1: Todos los versículos, 2: Favoritos)
  const [activeTab, setActiveTab] = useState(0);

  // Selected emotion and current active verse (for modal / hero reveal)
  const [activeVerse, setActiveVerse] = useState(null);
  const [verseModalOpen, setVerseModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Audio speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('iglesia_favorite_verses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search query for tab 1 (All verses)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterEmotion, setSelectedFilterEmotion] = useState('all');

  // Snackbar feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iglesia_favorite_verses', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Clean speech synthesis when component unmounts or active verse changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handler to draw a random verse for a specific emotion
  const handleSelectEmotion = (emotionId) => {
    setIsDrawing(true);
    // Cancel any previous speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setTimeout(() => {
      const verse = getRandomVerseByEmotion(emotionId);
      setActiveVerse(verse);
      setVerseModalOpen(true);
      setIsDrawing(false);
    }, 280);
  };

  // Handler to draw a random verse from any emotion in the jar
  const handleDrawFromJar = () => {
    setIsDrawing(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setTimeout(() => {
      const verse = getRandomVerseFromJar();
      setActiveVerse(verse);
      setVerseModalOpen(true);
      setIsDrawing(false);
    }, 450);
  };

  // Redraw another verse for current active verse's emotion
  const handleRedrawCurrent = () => {
    if (!activeVerse) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const nextVerse = getRandomVerseByEmotion(activeVerse.emotionId);
    setActiveVerse(nextVerse);
  };

  // Toggle favorite verse
  const toggleFavorite = (verse) => {
    const isFav = favorites.some((f) => f.reference === verse.reference && f.text === verse.text);
    if (isFav) {
      setFavorites(favorites.filter((f) => !(f.reference === verse.reference && f.text === verse.text)));
      setSnackbar({ open: true, message: 'Versículo removido de favoritos', severity: 'info' });
    } else {
      setFavorites([verse, ...favorites]);
      setSnackbar({ open: true, message: '¡Versículo guardado en tus favoritos!', severity: 'success' });
    }
  };

  const isFavorite = (verse) => {
    if (!verse) return false;
    return favorites.some((f) => f.reference === verse.reference && f.text === verse.text);
  };

  // Copy verse to clipboard
  const handleCopyVerse = (verse) => {
    if (!verse) return;
    const shareText = `«${verse.text}»\n— ${verse.reference} (RVR1960)\n\nFrasco de Emociones • Iglesia Restauración`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setSnackbar({ open: true, message: '¡Versículo copiado al portapapeles!', severity: 'success' });
    }
  };

  // Share via Web Share API or WhatsApp
  const handleShareWhatsApp = (verse) => {
    if (!verse) return;
    const message = `🕊️ *Palabra de Dios para hoy* 🕊️\n\n«${verse.text}»\n\n📖 *${verse.reference} (RVR1960)*\n_Léeme cuando te sientas: ${verse.emotionName || ''}_\n\n✨ *Iglesia Restauración*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Text to speech (Audio synthesis)
  const handleToggleSpeak = (verse) => {
    if (!('speechSynthesis' in window)) {
      setSnackbar({ open: true, message: 'La síntesis de voz no está soportada en tu navegador', severity: 'warning' });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${verse.text}. ${verse.reference}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;

    // Pick a natural Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Filter all verses across emotions for Tab 1
  const allVersesList = EMOTIONS_DATA.flatMap((em) =>
    em.verses.map((v) => ({
      ...v,
      emotionId: em.id,
      emotionName: em.name,
      color: em.color,
      bgColor: em.bgColor,
      borderColor: em.borderColor,
      textColor: em.textColor,
      accentColor: em.accentColor,
      prayer: em.prayer
    }))
  ).filter((v) => {
    const matchesEmotion = selectedFilterEmotion === 'all' || v.emotionId === selectedFilterEmotion;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      v.text.toLowerCase().includes(q) ||
      v.reference.toLowerCase().includes(q) ||
      v.emotionName.toLowerCase().includes(q);
    return matchesEmotion && matchesQuery;
  });

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Banner / Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* Subtle decorative glow accents */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.25) 0%, rgba(244, 114, 182, 0) 70%)',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: '25%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<SparkleIcon sx={{ color: '#FCD34D !important', fontSize: '0.95rem' }} />}
                label={THEME_HEADER.tagline}
                size="small"
                sx={{
                  backgroundColor: 'rgba(252, 211, 77, 0.15)',
                  color: '#FDE68A',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em'
                }}
              />
              <Chip
                label="Reina-Valera 1960"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#E2E8F0',
                  fontSize: '0.75rem'
                }}
              />
            </Stack>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.65rem', sm: '2.1rem', md: '2.4rem' },
                fontWeight: 800,
                color: '#FFFFFF',
                mb: 1.2,
                lineHeight: 1.2
              }}
            >
              Frasco de Versículos según Emociones
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: '#CBD5E1',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                fontWeight: 400,
                maxWidth: 620,
                mb: 2,
                lineHeight: 1.5
              }}
            >
              «{THEME_HEADER.motto}»
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 1,
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <BibleIcon sx={{ color: '#93C5FD', fontSize: '1.1rem' }} />
              <Typography variant="body2" sx={{ color: '#E2E8F0', fontStyle: 'italic', fontSize: '0.86rem' }}>
                «{THEME_HEADER.keyVerse.text}» — <strong>{THEME_HEADER.keyVerse.reference}</strong>
              </Typography>
            </Box>
          </Grid>

          {/* Interactive Jar Draw CTA button & visual representation */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 1.5
              }}
            >
              {/* Visual representation of the Jar with pastel paper slips */}
              <Box
                sx={{
                  position: 'relative',
                  width: 90,
                  height: 105,
                  borderRadius: '16px 16px 22px 22px',
                  border: '3px solid rgba(255, 255, 255, 0.65)',
                  borderTop: '6px solid #CBD5E1',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.3)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignContent: 'flex-end',
                  justifyContent: 'center',
                  p: 1,
                  gap: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 28px rgba(252, 211, 77, 0.3)'
                  }
                }}
                onClick={handleDrawFromJar}
              >
                {/* Simulated colorful rolled paper slips inside */}
                {EMOTIONS_DATA.map((em, idx) => (
                  <Box
                    key={em.id}
                    sx={{
                      width: 14,
                      height: 24,
                      borderRadius: '4px',
                      backgroundColor: em.color,
                      transform: `rotate(${(idx - 2.5) * 16}deg)`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      animation: isDrawing ? 'pulse 0.4s infinite alternate' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: `translateY(0) rotate(${(idx - 2.5) * 16}deg)` },
                        '100%': { transform: `translateY(-6px) rotate(${(idx - 2.5) * 16}deg)` }
                      }
                    }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={handleDrawFromJar}
                disabled={isDrawing}
                startIcon={<SparkleIcon sx={{ color: '#FCD34D' }} />}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 1.2,
                  px: 2.2,
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                    boxShadow: '0 6px 18px rgba(255,255,255,0.25)'
                  }
                }}
              >
                {isDrawing ? 'Sacando versículo...' : 'Sacar versículo del Frasco'}
              </Button>
              <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                132 versículos categorizados por color
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.92rem',
              textTransform: 'none',
              minHeight: 48
            }
          }}
        >
          <Tab icon={<EmotionIcon fontSize="small" />} iconPosition="start" label="Selector de Emociones" />
          <Tab
            icon={<BibleIcon fontSize="small" />}
            iconPosition="start"
            label={`Colección Bíblica (${allVersesList.length})`}
          />
          <Tab
            icon={<FavoriteIcon fontSize="small" />}
            iconPosition="start"
            label={`Mis Favoritos (${favorites.length})`}
          />
        </Tabs>
      </Box>

      {/* TAB 0: EMOTION SELECTOR (THE 6 EMOTIONS) */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 700 }}>
                ¿Cómo te encuentras hoy?
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Selecciona la emoción que estás viviendo y recibe una promesa bíblica inmediata de parte del Señor.
              </Typography>
            </Box>
            <Chip
              label="6 Estados Emocionales • 22 Versículos c/u"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, borderColor: '#CBD5E1' }}
            />
          </Box>

          <Grid container spacing={2.5}>
            {EMOTIONS_DATA.map((emotion) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={emotion.id}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      border: `1.5px solid ${emotion.borderColor}40`,
                      background: emotion.cardBg,
                      transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 14px 28px -6px ${emotion.color}35`,
                        borderColor: emotion.borderColor
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleSelectEmotion(emotion.id)}
                      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      {/* Top Header of Card */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '14px',
                            backgroundColor: '#FFFFFF',
                            color: emotion.accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            border: `1px solid ${emotion.borderColor}30`
                          }}
                        >
                          {getEmotionIcon(emotion.id, 30)}
                        </Box>
                        <Chip
                          label="22 Versículos"
                          size="small"
                          sx={{
                            backgroundColor: '#FFFFFF',
                            color: emotion.textColor,
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            border: `1px solid ${emotion.borderColor}40`
                          }}
                        />
                      </Stack>

                      {/* Title & Description */}
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          color: emotion.textColor,
                          mb: 0.8
                        }}
                      >
                        {emotion.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          lineHeight: 1.5,
                          fontSize: '0.88rem',
                          mb: 2.5,
                          flexGrow: 1
                        }}
                      >
                        {emotion.description}
                      </Typography>

                      {/* Action Button inside card */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 1.5,
                          borderTop: `1px dashed ${emotion.borderColor}50`
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: emotion.textColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          Léeme cuando te sientas {emotion.name.toLowerCase()}
                        </Typography>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            color: emotion.accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                          }}
                        >
                          <SparkleIcon sx={{ fontSize: '0.95rem' }} />
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* TAB 1: ALL VERSES BROWSER */}
      {activeTab === 1 && (
        <Box>
          {/* Search & Filter Header */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar versículo, promesa o libro bíblico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                  <Chip
                    label="Todas"
                    clickable
                    color={selectedFilterEmotion === 'all' ? 'primary' : 'default'}
                    variant={selectedFilterEmotion === 'all' ? 'filled' : 'outlined'}
                    onClick={() => setSelectedFilterEmotion('all')}
                  />
                  {EMOTIONS_DATA.map((em) => (
                    <Chip
                      key={em.id}
                      label={em.name}
                      clickable
                      onClick={() => setSelectedFilterEmotion(em.id)}
                      sx={{
                        backgroundColor: selectedFilterEmotion === em.id ? em.color : 'transparent',
                        color: selectedFilterEmotion === em.id ? '#FFFFFF' : em.textColor,
                        borderColor: em.color,
                        fontWeight: selectedFilterEmotion === em.id ? 700 : 500
                      }}
                      variant={selectedFilterEmotion === em.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Verses Grid */}
          <Grid container spacing={2}>
            {allVersesList.map((verse) => {
              const fav = isFavorite(verse);
              return (
                <Grid item xs={12} sm={6} md={4} key={`${verse.emotionId}-${verse.id}`}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      border: `1px solid ${verse.borderColor}40`,
                      backgroundColor: '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 20px -4px ${verse.color}30`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        backgroundColor: verse.bgColor,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: `1px solid ${verse.borderColor}20`
                      }}
                    >
                      <Chip
                        icon={getEmotionIcon(verse.emotionId, 16)}
                        label={verse.emotionName}
                        size="small"
                        sx={{
                          backgroundColor: '#FFFFFF',
                          color: verse.textColor,
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: verse.textColor }}>
                        {verse.reference}
                      </Typography>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2.2 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '0.94rem',
                          fontStyle: 'italic',
                          color: '#1E293B',
                          lineHeight: 1.6,
                          position: 'relative'
                        }}
                      >
                        «{verse.text}»
                      </Typography>
                    </CardContent>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 0.8 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title={isSpeaking ? 'Detener' : 'Escuchar versículo'}>
                          <IconButton size="small" onClick={() => handleToggleSpeak(verse)} sx={{ color: '#64748B' }}>
                            <SoundIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar versículo">
                          <IconButton size="small" onClick={() => handleCopyVerse(verse)} sx={{ color: '#64748B' }}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Compartir en WhatsApp">
                          <IconButton size="small" onClick={() => handleShareWhatsApp(verse)} sx={{ color: '#16A34A' }}>
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Tooltip title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                        <IconButton size="small" onClick={() => toggleFavorite(verse)} sx={{ color: fav ? '#E11D48' : '#94A3B8' }}>
                          {fav ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {allVersesList.length === 0 && (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
                No se encontraron versículos que coincidan con tu búsqueda
              </Typography>
              <Button variant="outlined" onClick={() => { setSearchQuery(''); setSelectedFilterEmotion('all'); }}>
                Restablecer filtros
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* TAB 2: FAVORITES */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 700 }}>
              Mis Versículos Guardados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Tu colección personal de promesas bíblicas favoritas para meditar en cualquier momento.
            </Typography>
          </Box>

          {favorites.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: '16px',
                border: '1px dashed #CBD5E1',
                backgroundColor: '#FFFFFF'
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                Aún no tienes versículos guardados en favoritos
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 450, mx: 'auto', mb: 2.5 }}>
                Toca el ícono de corazón en cualquier versículo para guardarlo aquí y tenerlo siempre a mano.
              </Typography>
              <Button variant="contained" onClick={() => setActiveTab(0)}>
                Explorar Frasco de Emociones
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {favorites.map((verse, idx) => (
                <Grid item xs={12} sm={6} md={4} key={`fav-${idx}`}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        backgroundColor: verse.bgColor || '#F8FAFC',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      <Chip
                        icon={getEmotionIcon(verse.emotionId, 16)}
                        label={verse.emotionName || 'Versículo'}
                        size="small"
                        sx={{
                          backgroundColor: '#FFFFFF',
                          color: verse.textColor || '#0F172A',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {verse.reference}
                      </Typography>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2.2 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '0.94rem',
                          fontStyle: 'italic',
                          color: '#1E293B',
                          lineHeight: 1.6
                        }}
                      >
                        «{verse.text}»
                      </Typography>
                    </CardContent>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 0.8 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Escuchar">
                          <IconButton size="small" onClick={() => handleToggleSpeak(verse)}>
                            <SoundIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar">
                          <IconButton size="small" onClick={() => handleCopyVerse(verse)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Compartir WhatsApp">
                          <IconButton size="small" onClick={() => handleShareWhatsApp(verse)} sx={{ color: '#16A34A' }}>
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Tooltip title="Quitar de favoritos">
                        <IconButton size="small" onClick={() => toggleFavorite(verse)} sx={{ color: '#E11D48' }}>
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      {/* POPUP MODAL: ANIMATED VERSE REVELATION (LA PALABRA REVELADA) */}
      <Dialog
        open={verseModalOpen}
        onClose={() => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setIsSpeaking(false);
          setVerseModalOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            m: { xs: 1, sm: 2 },
            maxHeight: '92vh',
            overflow: 'hidden',
            border: activeVerse ? `2px solid ${activeVerse.borderColor}` : '1px solid #E2E8F0',
            boxShadow: activeVerse ? `0 20px 40px -10px ${activeVerse.color}40` : '0 20px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        {activeVerse && (
          <Box>
            {/* Modal Header with Emotion Theme */}
            <Box
              sx={{
                p: 2.5,
                background: activeVerse.cardBg || `linear-gradient(135deg, ${activeVerse.bgColor} 0%, #FFFFFF 100%)`,
                borderBottom: `1px solid ${activeVerse.borderColor}40`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: activeVerse.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.06)'
                  }}
                >
                  {getEmotionIcon(activeVerse.emotionId, 26)}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: activeVerse.textColor, fontWeight: 700, textTransform: 'uppercase' }}>
                    Palabra cuando te sientas
                  </Typography>
                  <Typography variant="h6" sx={{ color: activeVerse.textColor, fontWeight: 800, lineHeight: 1.1 }}>
                    {activeVerse.emotionName}
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setVerseModalOpen(false);
                }}
                sx={{ color: activeVerse.textColor }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Body: The Paper Slip Presentation */}
            <DialogContent sx={{ p: { xs: 3, md: 4 }, backgroundColor: '#FFFFFF' }}>
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, sm: 3.5 },
                  borderRadius: '16px',
                  backgroundColor: activeVerse.bgColor || '#F8FAFC',
                  border: `1.5px solid ${activeVerse.borderColor}40`,
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)',
                  mb: 3
                }}
              >
                <QuoteIcon
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontSize: 40,
                    color: activeVerse.color,
                    opacity: 0.35
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    fontWeight: 600,
                    lineHeight: 1.6,
                    color: '#0F172A',
                    fontFamily: '"Lora", "Georgia", serif',
                    textAlign: 'center',
                    py: 1,
                    px: 1
                  }}
                >
                  «{activeVerse.text}»
                </Typography>

                <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                  <Chip
                    label={`${activeVerse.reference} • RVR1960`}
                    sx={{
                      backgroundColor: '#FFFFFF',
                      color: activeVerse.textColor,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      py: 1.8,
                      px: 1,
                      border: `1px solid ${activeVerse.borderColor}50`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  />
                </Box>
              </Box>

              {/* Guided Prayer for this emotion */}
              {activeVerse.prayer && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    mb: 2.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.5 }}>
                    ORACIÓN PARA ESTE MOMENTO:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {activeVerse.prayer}
                  </Typography>
                </Box>
              )}

              {/* Audio and Sharing Bar */}
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isSpeaking ? <StopIcon /> : <SoundIcon />}
                  onClick={() => handleToggleSpeak(activeVerse)}
                  color={isSpeaking ? 'error' : 'inherit'}
                  sx={{ borderRadius: '8px' }}
                >
                  {isSpeaking ? 'Detener Voz' : 'Escuchar'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopyVerse(activeVerse)}
                  sx={{ borderRadius: '8px' }}
                >
                  Copiar
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  onClick={() => handleShareWhatsApp(activeVerse)}
                  sx={{ borderRadius: '8px', color: '#16A34A', borderColor: '#16A34A' }}
                >
                  WhatsApp
                </Button>

                <Button
                  variant={isFavorite(activeVerse) ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={isFavorite(activeVerse) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={() => toggleFavorite(activeVerse)}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: isFavorite(activeVerse) ? '#E11D48' : 'transparent',
                    color: isFavorite(activeVerse) ? '#FFFFFF' : '#E11D48',
                    borderColor: '#E11D48',
                    '&:hover': {
                      backgroundColor: isFavorite(activeVerse) ? '#BE123C' : 'rgba(225, 29, 72, 0.08)'
                    }
                  }}
                >
                  {isFavorite(activeVerse) ? 'Guardado' : 'Favorito'}
                </Button>
              </Stack>
            </DialogContent>

            <Divider />

            {/* Modal Actions */}
            <DialogActions sx={{ p: 2.5, justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
              <Button
                startIcon={<BibleIcon />}
                onClick={() => {
                  setVerseModalOpen(false);
                  navigate('/bible');
                }}
                size="small"
                sx={{ color: '#475569' }}
              >
                Ir a la Santa Biblia
              </Button>

              <Button
                variant="contained"
                onClick={handleRedrawCurrent}
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: activeVerse.accentColor || '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: activeVerse.textColor || '#1E293B'
                  }
                }}
              >
                Sacar otro versículo
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
