import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Select,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FormatSize as FontSizeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  AutoAwesome as DailyIcon,
  Share as ShareIcon,
  VolumeUp as SoundIcon,
  Stop as StopIcon,
  Close as CloseIcon,
  LibraryBooks as LibraryIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

import { bibleAPI } from '../services/api';
import { BIBLE_BOOKS, BIBLE_VERSIONS, BIBLE_CATEGORIES } from '../data/bibleData';

export default function Bible() {
  const [books, setBooks] = useState(BIBLE_BOOKS);
  const [versions, setVersions] = useState(BIBLE_VERSIONS);
  const [selectedVersion, setSelectedVersion] = useState('RVR1960'); // Default: RVR1960
  const [selectedBook, setSelectedBook] = useState(19); // Default: Salmos (id: 19)
  const [selectedChapter, setSelectedChapter] = useState(23); // Default: Salmos 23
  const [chapterData, setChapterData] = useState(null);
  const [aiDevotional, setAiDevotional] = useState(null);
  const [loading, setLoading] = useState(true);

  // Font Size Accessibility
  const [fontSize, setFontSize] = useState(18);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 66 Books Library Index Modal
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilterTestament, setCatalogFilterTestament] = useState('ALL'); // 'ALL', 'OT', 'NT'

  // AI Devotional Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customAiResult, setCustomAiResult] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // General Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Snackbar Notification
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Initial Load: Books and Devotional
  useEffect(() => {
    async function init() {
      try {
        const [booksList, devotional] = await Promise.all([
          bibleAPI.getBooks(),
          bibleAPI.getAIDailyDevotional()
        ]);
        if (booksList && booksList.length >= 66) setBooks(booksList);
        setAiDevotional(devotional);
      } catch (err) {
        console.warn('Fallback local data used:', err);
      }
    }
    init();
  }, []);

  // Fetch Chapter Content when Book, Chapter, or Version changes
  useEffect(() => {
    async function loadChapter() {
      setLoading(true);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try {
        const data = await bibleAPI.getChapter(selectedBook, selectedChapter, selectedVersion);
        setChapterData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [selectedBook, selectedChapter, selectedVersion]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const currentBookObj = books.find((b) => b.id === Number(selectedBook)) || BIBLE_BOOKS[18]; // Salmos
  const currentVersionObj = versions.find((v) => v.id === selectedVersion) || BIBLE_VERSIONS[0];

  const handleBookChange = (e) => {
    const newBookId = Number(e.target.value);
    setSelectedBook(newBookId);
    setSelectedChapter(1);
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) setSelectedChapter(selectedChapter - 1);
  };

  const handleNextChapter = () => {
    if (selectedChapter < currentBookObj.chapters) setSelectedChapter(selectedChapter + 1);
  };

  const handleCopyVerse = (verseNum, text) => {
    const fullRef = verseNum
      ? `${currentBookObj.name} ${selectedChapter}:${verseNum} (${selectedVersion})`
      : 'Versículo Bíblico';
    const copyText = `«${text}» — ${fullRef}\nIglesia Restauración`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText);
      setSnackbarMsg(`Copiado al portapapeles: ${fullRef}`);
      setSnackbarOpen(true);
    }
  };

  const handleShareWhatsApp = (verseNum, text) => {
    const fullRef = `${currentBookObj.name} ${selectedChapter}:${verseNum} (${selectedVersion})`;
    const message = `📖 *Palabra de Dios*\n\n«${text}»\n\n— *${fullRef}*\n🕊️ *Iglesia Restauración*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleToggleSpeak = (textToRead) => {
    if (!('speechSynthesis' in window)) {
      setSnackbarMsg('La síntesis de voz no está soportada en tu navegador');
      setSnackbarOpen(true);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleGenerateCustomAI = async (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setIsGeneratingAi(true);
    try {
      const result = await bibleAPI.generateAIReflection(customTopic);
      setCustomAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Group books for the select dropdown
  const otBooks = books.filter((b) => b.testament === 'OT');
  const ntBooks = books.filter((b) => b.testament === 'NT');

  // Filter books for catalog modal
  const filteredCatalogBooks = books.filter((b) => {
    const matchesTestament =
      catalogFilterTestament === 'ALL' || b.testament === catalogFilterTestament;
    const q = catalogSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q));
    return matchesTestament && matchesSearch;
  });

  return (
    <Box sx={{ py: 1, pb: 6 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BookIcon sx={{ fontSize: '2.2rem', color: '#0F172A' }} />
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: '1.55rem', sm: '1.95rem' }, fontWeight: 800 }}>
                Santa Biblia Completa (66 Libros)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                3 Versiones Principales: Reina-Valera 1960 • NVI • NTV
              </Typography>
            </Box>
          </Box>

          {/* Button to open 66 Books Catalog */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<LibraryIcon />}
            onClick={() => setCatalogModalOpen(true)}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              px: 2.2,
              py: 1,
              backgroundColor: '#0F172A',
              '&:hover': { backgroundColor: '#1E293B' }
            }}
          >
            Índice de los 66 Libros
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
          «Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.» — <strong>2 Timoteo 3:16</strong>
        </Typography>
      </Box>

      {/* Hero Card: Devocional del Día Generado por IA */}
      {aiDevotional && (
        <Card
          sx={{
            mb: 3.5,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0px 8px 25px rgba(15, 23, 42, 0.22)'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<DailyIcon sx={{ color: '#F59E0B !important', fontSize: '0.9rem' }} />}
                  label="Versículo & Devocional Diario"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                />
                <Chip
                  label={aiDevotional.version}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#FDE68A',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                />
              </Stack>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DailyIcon />}
                onClick={() => setAiModalOpen(true)}
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                Pedir Reflexión Teológica
              </Button>
            </Box>

            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600, mb: 1, color: '#F8FAFC' }}>
              «{aiDevotional.text}»
            </Typography>

            <Typography variant="subtitle2" sx={{ color: '#93C5FD', fontWeight: 600, mb: 2 }}>
              — {aiDevotional.reference}
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 2 }} />

            <Typography variant="subtitle1" sx={{ color: '#38BDF8', fontWeight: 700, mb: 0.5 }}>
              💡 {aiDevotional.ai_title}
            </Typography>

            <Typography variant="body2" sx={{ color: '#E2E8F0', lineHeight: 1.7, mb: 2 }}>
              {aiDevotional.ai_reflection}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    🎯 APLICACIÓN PRÁCTICA DEL DÍA:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.85rem' }}>
                    {aiDevotional.ai_application}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    🛐 ORACIÓN GUIADA DEL DÍA:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    "{aiDevotional.ai_prayer}"
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Navigation & Toolbar Controls (Selector de Versiones, Libro, Capítulo y Tamaño) */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2} alignItems="center">
          {/* VERSION SELECTOR: The 3 Main Versions in exact order */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, pb: 1.5, borderBottom: '1px dashed #E2E8F0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Versión Bíblica:
                </Typography>
                <Chip
                  label={currentVersionObj.shortName}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <ToggleButtonGroup
                value={selectedVersion}
                exclusive
                onChange={(e, val) => val && setSelectedVersion(val)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: { xs: 1.5, sm: 2.5 },
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    '&.Mui-selected': {
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      '&:hover': { backgroundColor: '#1E293B' }
                    }
                  }
                }}
              >
                {BIBLE_VERSIONS.map((ver) => (
                  <ToggleButton key={ver.id} value={ver.id}>
                    {ver.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Grid>

          {/* Book Selector (Categorized with All 66 Books) */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="book-select-label">Seleccionar Libro (66)</InputLabel>
              <Select
                labelId="book-select-label"
                value={selectedBook}
                label="Seleccionar Libro (66)"
                onChange={handleBookChange}
                MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
              >
                <ListSubheader sx={{ fontWeight: 800, color: '#0F172A', backgroundColor: '#F1F5F9', lineHeight: '36px' }}>
                  📜 ANTIGUO TESTAMENTO (39 Libros)
                </ListSubheader>
                {otBooks.map((b) => (
                  <MenuItem key={b.id} value={b.id} sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.id}. {b.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', ml: 1 }}>
                        {b.chapters} caps
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}

                <ListSubheader sx={{ fontWeight: 800, color: '#0F172A', backgroundColor: '#F1F5F9', lineHeight: '36px' }}>
                  ✝️ NUEVO TESTAMENTO (27 Libros)
                </ListSubheader>
                {ntBooks.map((b) => (
                  <MenuItem key={b.id} value={b.id} sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.id}. {b.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', ml: 1 }}>
                        {b.chapters} caps
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Chapter Selector */}
          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="chapter-select-label">Capítulo</InputLabel>
              <Select
                labelId="chapter-select-label"
                value={selectedChapter}
                label="Capítulo"
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
                MenuProps={{ PaperProps: { sx: { maxHeight: 350 } } }}
              >
                {Array.from({ length: currentBookObj.chapters }, (_, i) => i + 1).map((ch) => (
                  <MenuItem key={ch} value={ch}>
                    Capítulo {ch} de {currentBookObj.chapters}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Font Size Accessibility Controls */}
          <Grid item xs={6} sm={3} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', md: 'block' } }}>
              Tamaño Texto:
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={fontSize}
              exclusive
              onChange={(e, val) => val && setFontSize(val)}
            >
              <ToggleButton value={15}>A-</ToggleButton>
              <ToggleButton value={18}>Normal</ToggleButton>
              <ToggleButton value={22}>A+</ToggleButton>
              <ToggleButton value={26}>XL</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Book Summary Card (Description from user) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              fontWeight: 800,
              fontSize: '1rem'
            }}
          >
            {currentBookObj.id}
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                {currentBookObj.name}
              </Typography>
              <Chip
                label={currentBookObj.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
                size="small"
                sx={{
                  backgroundColor: currentBookObj.testament === 'OT' ? '#DBEAFE' : '#DCFCE7',
                  color: currentBookObj.testament === 'OT' ? '#1E40AF' : '#166534',
                  fontWeight: 700,
                  fontSize: '0.72rem'
                }}
              />
              <Chip
                label={currentBookObj.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.72rem', borderColor: '#CBD5E1', display: { xs: 'none', md: 'inline-flex' } }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
              «{currentBookObj.description}»
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title={isSpeaking ? 'Detener lectura' : 'Escuchar todo el capítulo'}>
            <Button
              variant="outlined"
              size="small"
              startIcon={isSpeaking ? <StopIcon /> : <SoundIcon />}
              color={isSpeaking ? 'error' : 'inherit'}
              onClick={() => {
                if (chapterData && chapterData.verses) {
                  const fullText = chapterData.verses.map((v) => `${v.verse}. ${v.text}`).join(' ');
                  handleToggleSpeak(`${currentBookObj.name} capítulo ${selectedChapter}. ${fullText}`);
                }
              }}
              sx={{ borderRadius: '8px' }}
            >
              {isSpeaking ? 'Detener Voz' : 'Escuchar Capítulo'}
            </Button>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Bible Reading Surface */}
      <Paper sx={{ p: { xs: 2.5, sm: 4.5 }, borderRadius: '16px', minHeight: 400, border: '1px solid #E2E8F0' }}>
        {/* Reading Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem' }, fontWeight: 800 }}>
              {currentBookObj.name} {selectedChapter}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              {currentVersionObj.fullName} • {currentBookObj.category}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrevIcon />}
              onClick={handlePrevChapter}
              disabled={selectedChapter <= 1}
              sx={{ borderRadius: '8px' }}
            >
              Anterior
            </Button>
            <Button
              size="small"
              variant="outlined"
              endIcon={<NextIcon />}
              onClick={handleNextChapter}
              disabled={selectedChapter >= currentBookObj.chapters}
              sx={{ borderRadius: '8px' }}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>

        {/* Verses List Reader */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} variant="text" height={36} />
            ))}
          </Stack>
        ) : chapterData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chapterData.verses.map((v) => (
              <Box
                key={v.verse}
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 1.8,
                  py: 0.8,
                  px: 1.2,
                  borderRadius: '8px',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.03)'
                  }
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    fontSize: `${fontSize * 0.8}px`,
                    minWidth: 26,
                    userSelect: 'none'
                  }}
                >
                  {v.verse}
                </Typography>

                <Typography
                  component="span"
                  sx={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.8,
                    color: '#1E293B',
                    fontFamily: '"Lora", "Georgia", serif',
                    flexGrow: 1
                  }}
                >
                  {v.text}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                  <Tooltip title="Escuchar este versículo">
                    <IconButton size="small" onClick={() => handleToggleSpeak(v.text)}>
                      <SoundIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copiar versículo">
                    <IconButton size="small" onClick={() => handleCopyVerse(v.verse, v.text)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Compartir en WhatsApp">
                    <IconButton size="small" onClick={() => handleShareWhatsApp(v.verse, v.text)} sx={{ color: '#16A34A' }}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : null}

        {/* Bottom Pagination Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrevIcon />}
            onClick={handlePrevChapter}
            disabled={selectedChapter <= 1}
            sx={{ borderRadius: '8px' }}
          >
            Capítulo Anterior
          </Button>

          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            Capítulo {selectedChapter} de {currentBookObj.chapters} ({currentBookObj.name})
          </Typography>

          <Button
            variant="outlined"
            endIcon={<NextIcon />}
            onClick={handleNextChapter}
            disabled={selectedChapter >= currentBookObj.chapters}
            sx={{ borderRadius: '8px' }}
          >
            Capítulo Siguiente
          </Button>
        </Box>
      </Paper>

      {/* MODAL: 66 BOOKS COMPLETE CATALOG */}
      <Dialog
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LibraryIcon sx={{ color: '#0F172A' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Índice Completo de los 66 Libros Bíblicos
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setCatalogModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {/* Search & Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar libro por nombre, tema o categoría..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <ToggleButtonGroup
                value={catalogFilterTestament}
                exclusive
                onChange={(e, val) => val && setCatalogFilterTestament(val)}
                size="small"
                fullWidth
              >
                <ToggleButton value="ALL">Todos (66)</ToggleButton>
                <ToggleButton value="OT">A.T. (39)</ToggleButton>
                <ToggleButton value="NT">N.T. (27)</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          {/* Books Grid */}
          <Grid container spacing={2}>
            {filteredCatalogBooks.map((b) => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    borderColor: b.id === selectedBook ? '#0F172A' : '#E2E8F0',
                    backgroundColor: b.id === selectedBook ? '#F8FAFC' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#0F172A',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setSelectedBook(b.id);
                      setSelectedChapter(1);
                      setCatalogModalOpen(false);
                    }}
                    sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {b.id}. {b.name}
                      </Typography>
                      <Chip
                        label={`${b.chapters} caps`}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#F1F5F9' }}
                      />
                    </Box>

                    <Chip
                      label={b.category}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        mb: 1,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: b.testament === 'OT' ? '#EFF6FF' : '#ECFDF5',
                        color: b.testament === 'OT' ? '#1D4ED8' : '#047857'
                      }}
                    />

                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, flexGrow: 1 }}>
                      {b.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Mostrando {filteredCatalogBooks.length} de 66 libros
          </Typography>
          <Button onClick={() => setCatalogModalOpen(false)} variant="contained" sx={{ borderRadius: '8px' }}>
            Cerrar Índice
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Custom Devotional Generator Modal */}
      <Dialog
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DailyIcon sx={{ color: '#F59E0B' }} />
          Generar Reflexión Teológica
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Escribe un tema bíblico, una pregunta o situación (ej: "Superar el temor", "Gratitud en la prueba", "La fidelidad de Dios").
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Tema o situación de tu vida"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={isGeneratingAi}
            sx={{ mb: 2 }}
          />

          {isGeneratingAi && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Buscando escrituras y preparando reflexión espiritual...
              </Typography>
            </Box>
          )}

          {customAiResult && !isGeneratingAi && (
            <Paper variant="outlined" sx={{ p: 2.5, backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700, mb: 1 }}>
                📖 {customAiResult.reference}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, color: '#334155' }}>
                «{customAiResult.verse_text}»
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', mb: 0.5 }}>
                REFLEXIÓN:
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.6 }}>
                {customAiResult.ai_generated_reflection}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', display: 'block', mb: 0.5 }}>
                ORACIÓN GUIADA:
              </Typography>
              <Typography variant="body2" sx={{ color: '#047857', fontStyle: 'italic' }}>
                "{customAiResult.ai_guided_prayer}"
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAiModalOpen(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={handleGenerateCustomAI}
            disabled={isGeneratingAi || !customTopic.trim()}
          >
            {isGeneratingAi ? 'Generando...' : 'Generar Reflexión'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: '10px' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
