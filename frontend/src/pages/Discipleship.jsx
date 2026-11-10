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
  IconButton,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as DiscipleshipIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as ActivityIcon,
  Add as AddIcon,
  Send as SendIcon,
  Star as StarIcon,
  RateReview as EvaluateIcon,
  TrendingUp as ProgressIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
  Close as CloseIcon,
  VolumeUp as SoundIcon,
  Stop as StopIcon,
  Lock as LockIcon,
  EmojiEvents as TrophyIcon,
  SupervisorAccount as MentorIcon,
  Psychology as ReflectionIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { discipleshipAPI } from '../services/api';
import { INITIAL_DISCIPLESHIP_DATA } from '../data/discipleshipData';

export default function Discipleship() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, currentRole } = useAuth();

  // Mode: 'disciple' (learning & answering) vs 'mentor' (management & evaluation)
  const isLeaderOrAdmin = currentRole === 'ADMIN' || currentRole === 'LIDER';
  const [activeMode, setActiveMode] = useState(isLeaderOrAdmin ? 'mentor' : 'disciple');

  // Discipleship data state
  const [data, setData] = useState(INITIAL_DISCIPLESHIP_DATA);
  const [loading, setLoading] = useState(true);

  // Tabs for Mentor View (0: Evaluaciones Pendientes, 1: Cargar Nueva Lección, 2: Monitor de Discípulos)
  const [mentorTab, setMentorTab] = useState(0);

  // Lesson Reading / Study Dialog
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  // Evaluation Submission Form State (for disciple)
  const [userAnswers, setUserAnswers] = useState({});
  const [taskDone, setTaskDone] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mentor Evaluation Dialog (for evaluating a submission)
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalScore, setEvalScore] = useState('Excelente (100%)');
  const [evalStatus, setEvalStatus] = useState('APROBADO');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // New Lesson Creation Form State (for discipler)
  const [newLessonModuleId, setNewLessonModuleId] = useState('mod-1');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonScripture, setNewLessonScripture] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('30 min');
  const [newLessonObjective, setNewLessonObjective] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonQuestions, setNewLessonQuestions] = useState(['', '', '']);
  const [newLessonTask, setNewLessonTask] = useState('');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load discipleship data from API or localStorage
  useEffect(() => {
    async function loadDiscipleship() {
      setLoading(true);
      try {
        const res = await discipleshipAPI.getAll();
        if (res && res.modules) {
          setData(res);
        }
      } catch (e) {
        console.warn('Fallback discipleship data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDiscipleship();
  }, []);

  // Save to localStorage when data changes
  const updateDataState = (newData) => {
    setData(newData);
    try {
      localStorage.setItem('iglesia_discipleship_data', JSON.stringify(newData));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Clean speech synthesis
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Get active disciple profile (Carlos Martínez if role is MIEMBRO or user id)
  const currentDisciple =
    data.disciples.find((d) => d.email === user?.email || d.name === user?.name) ||
    data.disciples[0];

  // Calculate live progress for current disciple
  const allLessonsList = (data.modules || []).flatMap((m) => m.lessons || []);
  const totalLessonsCount = allLessonsList.length;
  const completedLessonsCount = (currentDisciple?.completed_lessons || []).length;
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Open lesson modal
  const handleOpenLesson = (lesson) => {
    setActiveLesson(lesson);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    // Check if this disciple already submitted this lesson
    const existingSub = data.submissions.find(
      (s) => s.disciple_id === currentDisciple.id && s.lesson_id === lesson.id
    );

    if (existingSub) {
      const answersMap = {};
      existingSub.answers.forEach((a, i) => {
        answersMap[i] = a.answer;
      });
      setUserAnswers(answersMap);
      setTaskDone(existingSub.practical_task_done || false);
      setTaskNotes(existingSub.practical_task_notes || '');
    } else {
      setUserAnswers({});
      setTaskDone(false);
      setTaskNotes('');
    }

    setLessonModalOpen(true);
  };

  // Disciple submits answers for evaluation
  const handleSubmitActivity = async () => {
    if (!activeLesson) return;

    // Check if all questions have answers
    const questions = activeLesson.questions || [];
    const formattedAnswers = questions.map((q, idx) => ({
      question: q,
      answer: userAnswers[idx] || 'Sin respuesta'
    }));

    setIsSubmitting(true);
    try {
      const submissionData = {
        disciple_id: currentDisciple.id,
        disciple_name: currentDisciple.name,
        lesson_id: activeLesson.id,
        lesson_title: activeLesson.title,
        answers: formattedAnswers,
        practical_task_done: taskDone,
        practical_task_notes: taskNotes
      };

      const res = await discipleshipAPI.submitActivity(submissionData);

      // Update local state
      const updatedSubmissions = [res, ...data.submissions.filter((s) => s.id !== res.id)];
      updateDataState({
        ...data,
        submissions: updatedSubmissions
      });

      setSnackbar({
        open: true,
        message: '¡Actividad enviada con éxito! Tu discipulador revisará tus respuestas y te dará retroalimentación.',
        severity: 'success'
      });
      setLessonModalOpen(false);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Error al enviar actividad', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mentor evaluates a submission
  const handleOpenEvaluateModal = (sub) => {
    setSelectedSubmission(sub);
    setEvalScore(sub.evaluation?.score || 'Excelente (100%)');
    setEvalStatus(sub.evaluation?.status || 'APROBADO');
    setEvalFeedback(
      sub.evaluation?.mentor_feedback ||
        '¡Felicitaciones! Has demostrado una comprensión bíblica sólida. Sigue adelante.'
    );
    setEvalModalOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedSubmission) return;
    setIsEvaluating(true);

    try {
      const evalPayload = {
        status: evalStatus,
        score: evalScore,
        evaluated_by: user?.full_name || user?.name || 'Pastor / Discipulador',
        mentor_feedback: evalFeedback
      };

      await discipleshipAPI.evaluateSubmission(selectedSubmission.id, evalPayload);

      // Update submissions and disciple progress
      const updatedSubmissions = data.submissions.map((s) => {
        if (s.id === selectedSubmission.id) {
          return {
            ...s,
            status: evalStatus,
            evaluation: {
              ...evalPayload,
              evaluated_at: new Date().toISOString()
            }
          };
        }
        return s;
      });

      let updatedDisciples = [...data.disciples];
      if (evalStatus === 'APROBADO') {
        updatedDisciples = updatedDisciples.map((d) => {
          if (d.id === selectedSubmission.disciple_id) {
            const completed = d.completed_lessons || [];
            if (!completed.includes(selectedSubmission.lesson_id)) {
              return {
                ...d,
                completed_lessons: [...completed, selectedSubmission.lesson_id]
              };
            }
          }
          return d;
        });
      }

      updateDataState({
        ...data,
        submissions: updatedSubmissions,
        disciples: updatedDisciples
      });

      setSnackbar({
        open: true,
        message: '¡Evaluación y retroalimentación guardadas con éxito! Progreso del discípulo actualizado.',
        severity: 'success'
      });
      setEvalModalOpen(false);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Error al guardar la evaluación', severity: 'error' });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Discipler creates a new lesson
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !newLessonContent.trim()) {
      setSnackbar({ open: true, message: 'Por favor completa el título y contenido de la lección', severity: 'warning' });
      return;
    }

    setIsCreatingLesson(true);
    try {
      const cleanQuestions = newLessonQuestions.filter((q) => q.trim().length > 0);
      const lessonPayload = {
        module_id: newLessonModuleId,
        title: newLessonTitle,
        scripture: newLessonScripture || 'Santa Biblia',
        duration: newLessonDuration || '30 min',
        objective: newLessonObjective,
        content: newLessonContent,
        questions: cleanQuestions.length > 0 ? cleanQuestions : ['Escribe una reflexión de lo aprendido.'],
        practical_task: newLessonTask
      };

      const created = await discipleshipAPI.createLesson(lessonPayload);

      // Add to modules in local state
      const updatedModules = data.modules.map((m) => {
        if (m.id === newLessonModuleId) {
          return {
            ...m,
            lessons: [...(m.lessons || []), created]
          };
        }
        return m;
      });

      updateDataState({
        ...data,
        modules: updatedModules
      });

      setSnackbar({ open: true, message: '¡Nueva lección de discipulado publicada con éxito!', severity: 'success' });

      // Reset form
      setNewLessonTitle('');
      setNewLessonScripture('');
      setNewLessonObjective('');
      setNewLessonContent('');
      setNewLessonQuestions(['', '', '']);
      setNewLessonTask('');
      setMentorTab(0); // return to dashboard
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al crear la lección', severity: 'error' });
    } finally {
      setIsCreatingLesson(false);
    }
  };

  // Text to speech for lesson content
  const handleToggleSpeakLesson = (text) => {
    if (!('speechSynthesis' in window)) {
      setSnackbar({ open: true, message: 'Síntesis de voz no disponible en este navegador', severity: 'warning' });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header Card */}
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
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
              <Chip
                icon={<DiscipleshipIcon sx={{ color: '#FCD34D !important', fontSize: '1rem' }} />}
                label="Escuela de Discipulado Bíblico"
                size="small"
                sx={{
                  backgroundColor: 'rgba(252, 211, 77, 0.15)',
                  color: '#FDE68A',
                  fontWeight: 700,
                  fontSize: '0.78rem'
                }}
              />
              <Chip
                label={`Modo Activo: ${activeMode === 'mentor' ? 'Discipulador / Mentor' : 'Discípulo'}`}
                size="small"
                sx={{
                  backgroundColor: activeMode === 'mentor' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}
              />
            </Stack>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.3rem' },
                fontWeight: 800,
                color: '#FFFFFF',
                mb: 1.2,
                lineHeight: 1.2
              }}
            >
              Programa de Discipulado: «Creciendo en Cristo»
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: '#CBD5E1',
                fontSize: { xs: '0.92rem', md: '1rem' },
                fontWeight: 400,
                maxWidth: 640,
                mb: 2,
                lineHeight: 1.6
              }}
            >
              {data.program_info.description}
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
              <BookIcon sx={{ color: '#93C5FD', fontSize: '1.1rem' }} />
              <Typography variant="body2" sx={{ color: '#E2E8F0', fontStyle: 'italic', fontSize: '0.86rem' }}>
                «{data.program_info.key_verse}»
              </Typography>
            </Box>
          </Grid>

          {/* Role Mode Switcher (Permite probar tanto la vista del discípulo como la del discipulador) */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}
            >
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                INTERCAMBIAR VISTA DE DEMOSTRACIÓN:
              </Typography>

              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button
                  size="small"
                  variant={activeMode === 'disciple' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMode('disciple')}
                  startIcon={<PersonIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    backgroundColor: activeMode === 'disciple' ? '#FFFFFF' : 'transparent',
                    color: activeMode === 'disciple' ? '#0F172A' : '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: activeMode === 'disciple' ? '#F1F5F9' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Soy Discípulo
                </Button>

                <Button
                  size="small"
                  variant={activeMode === 'mentor' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMode('mentor')}
                  startIcon={<MentorIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    backgroundColor: activeMode === 'mentor' ? '#3B82F6' : 'transparent',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: activeMode === 'mentor' ? '#2563EB' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Soy Discipulador
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.74rem' }}>
                {activeMode === 'disciple'
                  ? 'Estudia lecciones, responde actividades y observa tu progreso en directo.'
                  : 'Carga lecciones, califica actividades entregadas y guía a tus discípulos.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ========================================================
          VISTA 1: MODO DISCÍPULO (ESTUDIO, ACTIVIDADES Y PROGRESO)
          ======================================================== */}
      {activeMode === 'disciple' && (
        <Box>
          {/* Live Progress Bar & Spiritual Maturity Dashboard */}
          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 4,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#0F172A', width: 44, height: 44, fontWeight: 700 }}>
                    {currentDisciple.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                      Progreso en Directo: {currentDisciple.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Mentor asignado: <strong>{currentDisciple.mentor_name}</strong> • Nivel: <strong>{currentDisciple.spiritual_level}</strong>
                    </Typography>
                  </Box>
                </Box>

                {/* Linear progress bar */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Avance General del Programa:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>
                      {progressPercent}% ({completedLessonsCount} de {totalLessonsCount} lecciones aprobadas)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: 'linear-gradient(90deg, #2563EB 0%, #10B981 100%)'
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.8, borderRadius: '12px', textAlign: 'center', backgroundColor: '#F8FAFC' }}
                    >
                      <TrophyIcon sx={{ color: '#F59E0B', fontSize: '1.8rem', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                        {completedLessonsCount}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        Lecciones Aprobadas
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.8, borderRadius: '12px', textAlign: 'center', backgroundColor: '#F8FAFC' }}
                    >
                      <ActivityIcon sx={{ color: '#2563EB', fontSize: '1.8rem', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                        {totalLessonsCount - completedLessonsCount}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        Lecciones por Completar
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Modules and Lessons Roadmap */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.45rem', fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
              Módulos Formativos y Actividades a Evaluar
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Haz clic en cualquier lección para estudiar su contenido bíblico, responder las actividades y enviar tus respuestas a tu discipulador.
            </Typography>
          </Box>

          <Stack spacing={3.5}>
            {data.modules.map((module, mIdx) => (
              <Box key={module.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: module.color || '#2563EB'
                    }}
                  />
                  <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    {module.title}
                  </Typography>
                  <Chip
                    label={module.level}
                    size="small"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#F1F5F9',
                      color: '#475569'
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  {(module.lessons || []).map((lesson) => {
                    const isCompleted = (currentDisciple?.completed_lessons || []).includes(lesson.id);
                    const submission = data.submissions.find(
                      (s) => s.disciple_id === currentDisciple.id && s.lesson_id === lesson.id
                    );
                    const isPending = submission && submission.status === 'PENDIENTE';

                    return (
                      <Grid item xs={12} sm={6} md={6} key={lesson.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: '14px',
                            borderColor: isCompleted ? '#10B981' : isPending ? '#F59E0B' : '#E2E8F0',
                            backgroundColor: isCompleted ? '#F0FDF4' : '#FFFFFF',
                            transition: 'all 0.25s ease',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                            }
                          }}
                        >
                          <CardActionArea onClick={() => handleOpenLesson(lesson)} sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isCompleted ? (
                                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.4rem' }} />
                                ) : isPending ? (
                                  <EvaluateIcon sx={{ color: '#F59E0B', fontSize: '1.4rem' }} />
                                ) : (
                                  <UncheckedIcon sx={{ color: '#94A3B8', fontSize: '1.4rem' }} />
                                )}
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                  {lesson.title}
                                </Typography>
                              </Box>

                              <Chip
                                label={
                                  isCompleted
                                    ? 'Aprobada ✅'
                                    : isPending
                                    ? 'En Evaluación ⏳'
                                    : 'Pendiente ✍️'
                                }
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  backgroundColor: isCompleted ? '#DCFCE7' : isPending ? '#FEF3C7' : '#F1F5F9',
                                  color: isCompleted ? '#166534' : isPending ? '#92400E' : '#475569'
                                }}
                              />
                            </Box>

                            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block', mb: 1 }}>
                              📖 {lesson.scripture} • {lesson.duration}
                            </Typography>

                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, mb: 2 }}>
                              {lesson.objective}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                {lesson.questions?.length || 0} Preguntas evaluativas
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>
                                {isCompleted ? 'Ver corrección' : 'Abrir lección →'}
                              </Typography>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* ========================================================
          VISTA 2: MODO DISCIPULADOR / MENTOR (CARGAR Y EVALUAR)
          ======================================================== */}
      {activeMode === 'mentor' && (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={mentorTab}
              onChange={(e, val) => setMentorTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textTransform: 'none'
                }
              }}
            >
              <Tab
                icon={<EvaluateIcon fontSize="small" />}
                iconPosition="start"
                label={`Bandeja de Evaluaciones (${data.submissions.length})`}
              />
              <Tab
                icon={<AddIcon fontSize="small" />}
                iconPosition="start"
                label="Cargar Nueva Lección de Discipulado"
              />
              <Tab
                icon={<ProgressIcon fontSize="small" />}
                iconPosition="start"
                label={`Monitor de Discípulos (${data.disciples.length})`}
              />
            </Tabs>
          </Box>

          {/* MENTOR TAB 0: EVALUACIONES PENDIENTES / BANDEJA */}
          {mentorTab === 0 && (
            <Box>
              <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h2" sx={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    Entregas y Actividades de Discípulos
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Revisa las respuestas de tus discípulos, califícalos y escribe tu retroalimentación pastoral para aprobar su avance.
                  </Typography>
                </Box>
                <Chip
                  label="Evaluación Continua"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Grid container spacing={2}>
                {data.submissions.map((sub) => {
                  const isApproved = sub.status === 'APROBADO';
                  return (
                    <Grid item xs={12} md={6} key={sub.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: '14px',
                          borderColor: isApproved ? '#10B981' : '#F59E0B',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ bgcolor: isApproved ? '#10B981' : '#F59E0B', width: 38, height: 38 }}>
                              {sub.disciple_name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                {sub.disciple_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>
                                Entregado: {new Date(sub.submitted_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={isApproved ? 'Aprobado ✅' : 'Pendiente de Revisión ⏳'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              backgroundColor: isApproved ? '#DCFCE7' : '#FEF3C7',
                              color: isApproved ? '#166534' : '#92400E'
                            }}
                          />
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                          {sub.lesson_title}
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                            RESPUESTAS DEL DISCÍPULO ({sub.answers?.length || 0}):
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', fontSize: '0.86rem' }}>
                            «{sub.answers?.[0]?.answer?.substring(0, 110)}...»
                          </Typography>
                        </Paper>

                        {/* If evaluated, show mentor feedback */}
                        {sub.evaluation && (
                          <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block' }}>
                              CALIFICACIÓN: {sub.evaluation.score} • {sub.evaluation.evaluated_by}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#14532D', fontSize: '0.84rem' }}>
                              {sub.evaluation.mentor_feedback}
                            </Typography>
                          </Box>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleOpenEvaluateModal(sub)}
                          startIcon={<EvaluateIcon />}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            backgroundColor: isApproved ? '#0F172A' : '#F59E0B',
                            color: '#FFFFFF',
                            '&:hover': {
                              backgroundColor: isApproved ? '#1E293B' : '#D97706'
                            }
                          }}
                        >
                          {isApproved ? 'Ver / Modificar Evaluación' : 'Evaluar y Calificar Actividad'}
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* MENTOR TAB 1: CARGAR NUEVA LECCIÓN */}
          {mentorTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                maxWidth: 820,
                mx: 'auto'
              }}
            >
              <Typography variant="h3" sx={{ fontSize: '1.4rem', fontWeight: 800, mb: 1, color: '#0F172A' }}>
                Cargar Nueva Lección de Discipulado
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Ingresa los datos requeridos para la formación de los discípulos. Los discípulos podrán estudiarla inmediatamente y responder a las preguntas evaluativas.
              </Typography>

              <form onSubmit={handleCreateLesson}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="mod-select-label">Módulo de Pertenencia</InputLabel>
                      <Select
                        labelId="mod-select-label"
                        value={newLessonModuleId}
                        label="Módulo de Pertenencia"
                        onChange={(e) => setNewLessonModuleId(e.target.value)}
                      >
                        {data.modules.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.title} ({m.level})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Duración Estimada"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                      placeholder="Ej: 30 min de lectura y reflexión"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      label="Título de la Lección"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="Ej: Lección 7: El Bautismo en Agua y Testimonio Público"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Pasajes Bíblicos Clave"
                      value={newLessonScripture}
                      onChange={(e) => setNewLessonScripture(e.target.value)}
                      placeholder="Ej: Mateo 28:19 • Romanos 6:3-4"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Objetivo Espiritual"
                      value={newLessonObjective}
                      onChange={(e) => setNewLessonObjective(e.target.value)}
                      placeholder="Ej: Comprender el significado del bautismo como paso de obediencia."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      required
                      label="Contenido Teológico y de Estudio Bíblico"
                      value={newLessonContent}
                      onChange={(e) => setNewLessonContent(e.target.value)}
                      placeholder="Escribe la enseñanza bíblica que leerá el discípulo..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                      Preguntas de la Actividad a Evaluar (El discípulo debe responderlas):
                    </Typography>
                    {newLessonQuestions.map((q, idx) => (
                      <TextField
                        key={idx}
                        fullWidth
                        size="small"
                        sx={{ mb: 1.5 }}
                        label={`Pregunta evaluativa ${idx + 1}`}
                        value={q}
                        onChange={(e) => {
                          const updated = [...newLessonQuestions];
                          updated[idx] = e.target.value;
                          setNewLessonQuestions(updated);
                        }}
                        placeholder={`Escribe la pregunta ${idx + 1}...`}
                      />
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setNewLessonQuestions([...newLessonQuestions, ''])}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Agregar otra pregunta evaluativa
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tarea Práctica Semanal (Opcional)"
                      value={newLessonTask}
                      onChange={(e) => setNewLessonTask(e.target.value)}
                      placeholder="Ej: Asiste a la reunión de oración este jueves y comparte tu versículo clave."
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isCreatingLesson}
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 700,
                        px: 3.5,
                        backgroundColor: '#0F172A',
                        '&:hover': { backgroundColor: '#1E293B' }
                      }}
                    >
                      {isCreatingLesson ? 'Guardando Lección...' : 'Publicar Lección en Discipulado'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}

          {/* MENTOR TAB 2: MONITOR DE DISCÍPULOS */}
          {mentorTab === 2 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h2" sx={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  Discípulos en Formación Activa
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Supervisa el avance en tiempo real de cada creyente bajo tu mentoría pastoral.
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {data.disciples.map((disciple) => {
                  const completed = (disciple.completed_lessons || []).length;
                  const percent = totalLessonsCount > 0 ? Math.round((completed / totalLessonsCount) * 100) : 0;
                  return (
                    <Grid item xs={12} md={6} key={disciple.id}>
                      <Card variant="outlined" sx={{ p: 3, borderRadius: '14px', backgroundColor: '#FFFFFF' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#2563EB', width: 44, height: 44, fontWeight: 700 }}>
                              {disciple.name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                {disciple.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {disciple.email} • Ingreso: {disciple.joined_date}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={disciple.spiritual_level}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1E40AF' }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                              Progreso: {percent}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {completed} de {totalLessonsCount} lecciones completadas
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{ height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' }}
                          />
                        </Box>

                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          Mentor: <strong>{disciple.mentor_name}</strong>
                        </Typography>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* ========================================================
          MODAL DE ESTUDIO Y ACTIVIDAD A EVALUAR (DISCÍPULO)
          ======================================================== */}
      <Dialog
        open={lessonModalOpen}
        onClose={() => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setIsSpeaking(false);
          setLessonModalOpen(false);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        {activeLesson && (
          <Box>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Chip
                  label={activeLesson.scripture}
                  size="small"
                  sx={{ backgroundColor: '#EFF6FF', color: '#1E40AF', fontWeight: 700, mb: 0.5 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {activeLesson.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setLessonModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 2.5, md: 3.5 } }}>
              {/* Audio button & Duration */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  ⏱️ Duración estimada: {activeLesson.duration}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={isSpeaking ? <StopIcon /> : <SoundIcon />}
                  color={isSpeaking ? 'error' : 'inherit'}
                  onClick={() => handleToggleSpeakLesson(`${activeLesson.title}. ${activeLesson.content}`)}
                  sx={{ borderRadius: '8px' }}
                >
                  {isSpeaking ? 'Detener Voz' : 'Escuchar Lección'}
                </Button>
              </Box>

              {/* Lesson Content Box */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3.5, backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ color: '#2563EB', fontWeight: 800, mb: 1 }}>
                  ENSEÑANZA BÍBLICA:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#1E293B', lineHeight: 1.8, fontSize: '0.98rem', fontFamily: '"Lora", "Georgia", serif' }}
                >
                  {activeLesson.content}
                </Typography>
              </Paper>

              {/* Evaluation Questions Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ActivityIcon sx={{ color: '#2563EB' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Actividades a Evaluar por tu Discipulador
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Responde con sinceridad cada una de las preguntas de reflexión. Tu discipulador leerá tus respuestas y te dejará una evaluación constructiva.
                </Typography>

                <Stack spacing={2.5}>
                  {(activeLesson.questions || []).map((q, qIdx) => (
                    <Box key={qIdx}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.8 }}>
                        {qIdx + 1}. {q}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Escribe aquí tu respuesta y reflexión personal..."
                        value={userAnswers[qIdx] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [qIdx]: e.target.value })}
                        sx={{ backgroundColor: '#FFFFFF' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Practical Task */}
              {activeLesson.practical_task && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#B45309', display: 'block', mb: 0.5 }}>
                    TAREA PRÁCTICA DE LA SEMANA:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#92400E', mb: 1.5, fontWeight: 500 }}>
                    {activeLesson.practical_task}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={taskDone}
                        onChange={(e) => setTaskDone(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>He cumplido con esta tarea práctica</Typography>}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    sx={{ mt: 1, backgroundColor: '#FFFFFF' }}
                    placeholder="Notas o testimonio de cómo te fue cumpliendo la tarea..."
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                  />
                </Paper>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
              <Button onClick={() => setLessonModalOpen(false)}>Cerrar</Button>
              <Button
                variant="contained"
                onClick={handleSubmitActivity}
                disabled={isSubmitting}
                startIcon={<SendIcon />}
                sx={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#1E293B' }
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Actividad para Evaluación'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ========================================================
          MODAL DE CALIFICACIÓN Y EVALUACIÓN (DISCIPULADOR)
          ======================================================== */}
      <Dialog
        open={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        {selectedSubmission && (
          <Box>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                  PANEL DEL DISCIPULADOR
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Evaluar Entrega: {selectedSubmission.disciple_name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {selectedSubmission.lesson_title}
                </Typography>
              </Box>
              <IconButton onClick={() => setEvalModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Questions and Answers Review */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                RESPUESTAS DEL DISCÍPULO A EVALUAR:
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {(selectedSubmission.answers || []).map((ans, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      Pregunta {idx + 1}: {ans.question}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0F172A', fontWeight: 500, fontSize: '0.94rem' }}>
                      «{ans.answer}»
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              {selectedSubmission.practical_task_done && (
                <Box sx={{ mb: 3, p: 1.5, borderRadius: '8px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block' }}>
                    ✓ TAREA PRÁCTICA MARCADA COMO CUMPLIDA
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#14532D' }}>
                    {selectedSubmission.practical_task_notes || 'Sin notas adicionales.'}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2.5 }} />

              {/* Form to submit evaluation */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                CALIFICACIÓN Y RETROALIMENTACIÓN DE MENTORÍA:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="eval-status-label">Estado de la Lección</InputLabel>
                    <Select
                      labelId="eval-status-label"
                      value={evalStatus}
                      label="Estado de la Lección"
                      onChange={(e) => setEvalStatus(e.target.value)}
                    >
                      <MenuItem value="APROBADO">Aprobado (Avanza de Lección) ✅</MenuItem>
                      <MenuItem value="OBSERVACIONES">Aprobado con Observaciones ⚠️</MenuItem>
                      <MenuItem value="NECESITA_REFUERZO">Necesita Refuerzo / Repetir 🔄</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="eval-score-label">Calificación</InputLabel>
                    <Select
                      labelId="eval-score-label"
                      value={evalScore}
                      label="Calificación"
                      onChange={(e) => setEvalScore(e.target.value)}
                    >
                      <MenuItem value="Excelente (100%)">Excelente (100%) ⭐⭐⭐</MenuItem>
                      <MenuItem value="Muy Bueno (90%)">Muy Bueno (90%) ⭐⭐</MenuItem>
                      <MenuItem value="Aprobado (80%)">Aprobado (80%) ⭐</MenuItem>
                      <MenuItem value="En Proceso (70%)">En Proceso (70%)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    required
                    label="Mensaje de Retroalimentación Pastoral y Consejo Espiritual"
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    placeholder="Escribe palabras de ánimo, aclaraciones bíblicas y bendiciones para tu discípulo..."
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
              <Button onClick={() => setEvalModalOpen(false)}>Cancelar</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveEvaluation}
                disabled={isEvaluating}
                startIcon={<CheckCircleIcon />}
                sx={{ borderRadius: '8px', fontWeight: 700 }}
              >
                {isEvaluating ? 'Guardando...' : 'Guardar Evaluación y Actualizar Progreso'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '10px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
