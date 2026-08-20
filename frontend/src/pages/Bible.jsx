import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Snackbar,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FormatSize as FontSizeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  AutoAwesome as DailyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { bibleAPI } from '../services/api';

export default function Bible() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(19); // Default: Salmos
  const [selectedChapter, setSelectedChapter] = useState(23); // Default: Salmos 23
  const [chapterData, setChapterData] = useState(null);
  const [aiDevotional, setAiDevotional] = useState(null);
  const [loading, setLoading] = useState(true);

  // Font Size Control for accessibility (Small, Medium, Large, Extra Large)
  const [fontSize, setFontSize] = useState(18); // Default 18px

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customAiResult, setCustomAiResult] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Snackbar Notification
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        const [booksList, devotional] = await Promise.all([
          bibleAPI.getBooks(),
          bibleAPI.getAIDailyDevotional()
        ]);
        setBooks(booksList);
        setAiDevotional(devotional);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  // Fetch Chapter Content
  useEffect(() => {
    async function loadChapter() {
      setLoading(true);
      try {
        const data = await bibleAPI.getChapter(selectedBook, selectedChapter);
        setChapterData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [selectedBook, selectedChapter]);

  const currentBookObj = books.find((b) => b.id === Number(selectedBook)) || { name: 'Salmos', chapters: 150 };

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
    const fullRef = verseNum ? `${currentBookObj.name} ${selectedChapter}:${verseNum} (RVR1960)` : 'Versículo Bíblico';
    const copyText = `"${text}" - ${fullRef}`;
    navigator.clipboard.writeText(copyText);
    setSnackbarMsg(`Copiado al portapapeles: ${fullRef}`);
    setSnackbarOpen(true);
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

  return (
    <Box sx={{ py: 1 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <BookIcon sx={{ fontSize: '2rem', color: '#0F172A' }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
            Santa Biblia (Reina-Valera 1960)
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia." (2 Timoteo 3:16)
        </Typography>
      </Box>

      {/* Hero Card: Devocional del Día Generado por IA */}
      {aiDevotional && (
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.2)'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<DailyIcon sx={{ color: '#F59E0B !important', fontSize: '0.9rem' }} />}
                  label="Versículo & Devocional del Día (IA)"
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
                  variant="outlined"
                  sx={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
                />
              </Stack>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DailyIcon sx={{ color: '#F59E0B' }} />}
                onClick={() => setAiModalOpen(true)}
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontSize: '0.8rem',
                  '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Generar Reflexión IA por Tema
              </Button>
            </Box>

            {/* Main Verse */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
                lineHeight: 1.6,
                fontStyle: 'italic',
                mb: 1,
                color: '#F8FAFC'
              }}
            >
              "{aiDevotional.text}"
            </Typography>

            <Typography variant="subtitle2" sx={{ color: '#CBD5E1', fontWeight: 700, mb: 2.5 }}>
              — {aiDevotional.reference}
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 2 }} />

            {/* AI Devotional Title & Content */}
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

      {/* Navigation & Toolbar Controls */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Book Selector */}
          <Grid item xs={12} sm={5} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="book-select-label">Seleccionar Libro</InputLabel>
              <Select
                labelId="book-select-label"
                value={books.some((b) => b.id === selectedBook) ? selectedBook : ''}
                label="Seleccionar Libro"
                onChange={handleBookChange}
              >
                {books.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.testament === 'OT' ? 'A.T.' : 'N.T.'})
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
                value={currentBookObj && currentBookObj.chapters >= selectedChapter ? selectedChapter : ''}
                label="Capítulo"
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
              >
                {Array.from({ length: currentBookObj.chapters }, (_, i) => i + 1).map((ch) => (
                  <MenuItem key={ch} value={ch}>
                    Capítulo {ch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Font Size Accessibility Controls */}
          <Grid item xs={6} sm={4} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
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

      {/* Bible Reading Surface */}
      <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: '16px', minHeight: 400 }}>
        {/* Reading Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' }, fontWeight: 700 }}>
              {currentBookObj.name} {selectedChapter}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Versión Reina-Valera 1960 (RVR1960)
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrevIcon />}
              onClick={handlePrevChapter}
              disabled={selectedChapter <= 1}
            >
              Anterior
            </Button>
            <Button
              size="small"
              variant="outlined"
              endIcon={<NextIcon />}
              onClick={handleNextChapter}
              disabled={selectedChapter >= currentBookObj.chapters}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>

        {/* Verses List Reader */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} variant="text" height={30} />)}
          </Stack>
        ) : chapterData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chapterData.verses.map((v) => (
              <Box
                key={v.verse}
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.02)'
                  }
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: '#0F172A',
                    fontSize: `${fontSize * 0.8}px`,
                    minWidth: 24,
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
                    flexGrow: 1
                  }}
                >
                  {v.text}
                </Typography>

                <Tooltip title="Copiar versículo">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyVerse(v.verse, v.text)}
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        ) : null}

        {/* Bottom Pagination Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #E2E8F0' }}>
          <Button
            variant="outlined"
            startIcon={<PrevIcon />}
            onClick={handlePrevChapter}
            disabled={selectedChapter <= 1}
          >
            Capítulo Anterior
          </Button>

          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Capítulo {selectedChapter} de {currentBookObj.chapters}
          </Typography>

          <Button
            variant="outlined"
            endIcon={<NextIcon />}
            onClick={handleNextChapter}
            disabled={selectedChapter >= currentBookObj.chapters}
          >
            Capítulo Siguiente
          </Button>
        </Box>
      </Paper>

      {/* AI Custom Devotional Generator Modal */}
      <Dialog
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DailyIcon sx={{ color: '#F59E0B' }} />
          Generador de Reflexión Devocional con IA
        </DialogTitle>
        <form onSubmit={handleGenerateCustomAI}>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
              Ingresa un tema espiritual o necesidad (Ej: <em>'Paz en tiempos de prueba'</em>, <em>'Sabiduría para la familia'</em>, <em>'Gratitud'</em>) y la IA generará una reflexión bíblica RVR1960.
            </Typography>

            <TextField
              required
              fullWidth
              label="Tema o Necesidad Espiritual"
              placeholder="Ej: Fortaleza en la prueba..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            {isGeneratingAi && (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                  ✨ Inspirando reflexión bíblica con IA...
                </Typography>
              </Box>
            )}

            {customAiResult && !isGeneratingAi && (
              <Paper variant="outlined" sx={{ p: 2.5, backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700, mb: 1 }}>
                  📖 {customAiResult.reference}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#475569', mb: 2 }}>
                  "{customAiResult.verse_text}"
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  REFLEXIÓN ESPIRITUAL IA:
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', mb: 2, lineHeight: 1.6 }}>
                  {customAiResult.ai_generated_reflection}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0D9488', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  ORACIÓN GUIADA:
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
                  "{customAiResult.ai_guided_prayer}"
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setAiModalOpen(false)} color="inherit">
              Cerrar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isGeneratingAi || !customTopic.trim()}
              startIcon={<DailyIcon sx={{ color: '#F59E0B' }} />}
            >
              {isGeneratingAi ? 'Generando...' : 'Generar Reflexión'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Copy Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}
