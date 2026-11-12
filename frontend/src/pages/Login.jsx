import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Fade,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  PersonOutline as UserIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  LocationOn as LocationIcon,
  Public as GlobalIcon,
  Language as WebIcon,
  CheckCircle as CheckCircleIcon,
  Key as KeyIcon,
  Send as SendIcon,
  MenuBook as BibleIcon,
  AutoAwesome as SparkleIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { SEDES_LIST, CHURCH_INFO } from '../data/sedesData';
import { authAPI } from '../services/api';

const LOGIN_BIBLE_VERSES = [
  {
    theme: '✨ Promesa y Esperanza',
    text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    highlightWords: ['pensamientos', 'Jehová,', 'paz,', 'esperáis.'],
    ref: 'Jeremías 29:11'
  },
  {
    theme: '🦅 Nuevas Fuerzas',
    text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
    highlightWords: ['esperan', 'Jehová', 'nuevas', 'fuerzas;', 'águilas;'],
    ref: 'Isaías 40:31'
  },
  {
    theme: '🛡️ Fortaleza en Cristo',
    text: 'Todo lo puedo en Cristo que me fortalece.',
    highlightWords: ['Todo', 'Cristo', 'fortalece.'],
    ref: 'Filipenses 4:13'
  },
  {
    theme: '🌿 Paz y Pastoreo',
    text: 'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.',
    highlightWords: ['Jehová', 'pastor;', 'descansar;', 'reposo', 'pastoreará.'],
    ref: 'Salmos 23:1-2'
  },
  {
    theme: '🔥 Valentía y Fe',
    text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
    highlightWords: ['esfuerces', 'valiente;', 'Jehová', 'Dios', 'contigo'],
    ref: 'Josué 1:9'
  },
  {
    theme: '🕊️ Refugio del Alma',
    text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    highlightWords: ['Venid', 'todos', 'descansar.'],
    ref: 'Mateo 11:28'
  },
  {
    theme: '👑 Propósito Eterno',
    text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    highlightWords: ['aman', 'Dios,', 'bien,', 'propósito', 'llamados.'],
    ref: 'Romanos 8:28'
  },
  {
    theme: '⛺ Protección Divina',
    text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré.',
    highlightWords: ['Altísimo', 'Omnipotente.', 'Esperanza', 'castillo', 'confiaré.'],
    ref: 'Salmos 91:1-2'
  }
];

const AMBIENT_PARTICLES = [
  { left: '12%', size: 4, duration: '9s', delay: '0s', opacity: 0.55 },
  { left: '24%', size: 6, duration: '12s', delay: '1.5s', opacity: 0.4 },
  { left: '37%', size: 3, duration: '8s', delay: '3s', opacity: 0.65 },
  { left: '51%', size: 5, duration: '11s', delay: '0.8s', opacity: 0.5 },
  { left: '64%', size: 4, duration: '10s', delay: '2.2s', opacity: 0.6 },
  { left: '78%', size: 6, duration: '13s', delay: '4s', opacity: 0.45 },
  { left: '88%', size: 3.5, duration: '9.5s', delay: '1.2s', opacity: 0.55 }
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSede, setSelectedSede] = useState('plaza-venezuela');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Recovery State
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSede, setForgotSede] = useState('plaza-venezuela');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');


  // Check user role types
  const normalizedUser = (username || '').toLowerCase().trim();
  const isOwnerUser = normalizedUser === 'linfante' || normalizedUser === 'linfante@restauracionglobal.org';
  const isPastorSaid = normalizedUser === 'scarrasquel' || normalizedUser === 'scarrasquel@restauracionglobal.org';
  const isGeneralAdmin = normalizedUser === 'admin' || normalizedUser === 'admin@iglesia.org';
  const isSedeAdminUser = normalizedUser.startsWith('admin_');
  const hasGlobalAccess = isOwnerUser || isPastorSaid || isGeneralAdmin;

  // Auto-detect sede for Sede Admins
  useEffect(() => {
    if (normalizedUser === 'admin_maracay') setSelectedSede('maracay');
    else if (normalizedUser === 'admin_plazavzla') setSelectedSede('plaza-venezuela');
    else if (normalizedUser === 'admin_lasuiza') setSelectedSede('la-suiza');
    else if (normalizedUser === 'admin_sucre') setSelectedSede('sucre');
    else if (normalizedUser === 'admin_maracaibo') setSelectedSede('maracaibo');
  }, [normalizedUser]);

  // If already authenticated, redirect to portal
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/prayers');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Por favor completa tu usuario y contraseña.');
      return;
    }

    // If not global admin, require a valid sede
    if (!hasGlobalAccess && !selectedSede) {
      setErrorMsg('Debes indicar a qué sede de Restauración Global perteneces.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password, hasGlobalAccess ? 'TODAS' : selectedSede);
      if (res.success) {
        navigate('/prayers');
      } else {
        setErrorMsg(res.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
    } catch {
      setErrorMsg('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetSubmit = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier) return;
    setForgotSubmitting(true);
    setForgotMsg('');

    try {
      const res = await authAPI.requestPasswordReset(forgotIdentifier, forgotPhone, forgotSede);
      setForgotSuccess(true);
      setForgotMsg(res.message || 'Tu solicitud ha sido enviada con éxito a los Superadministradores.');
    } catch {
      setForgotSuccess(true);
      setForgotMsg('Tu solicitud de recuperación ha sido registrada para revisión de los Superadministradores.');
    } finally {
      setForgotSubmitting(false);
    }
  };


  // Animated Bible Verses state
  const [verseIndex, setVerseIndex] = useState(0);
  const [verseFade, setVerseFade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const changeVerse = (nextIdx) => {
    setVerseFade(false);
    setTimeout(() => {
      setVerseIndex(nextIdx);
      setVerseFade(true);
    }, 320);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setVerseFade(false);
      setTimeout(() => {
        setVerseIndex((prev) => (prev + 1) % LOGIN_BIBLE_VERSES.length);
        setVerseFade(true);
      }, 360);
    }, 7500);
    return () => clearInterval(interval);
  }, [isPaused, verseIndex]);

  const currentVerse = LOGIN_BIBLE_VERSES[verseIndex];
  const currentWords = currentVerse.text.split(' ');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/brick-lamp-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0A1128',
        p: { xs: 2, sm: 3 },
        overflow: 'hidden'
      }}
    >
      {/* Soft dark vignette */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 18%, rgba(255, 200, 110, 0.22) 0%, rgba(10, 17, 40, 0.55) 45%, rgba(6, 10, 25, 0.94) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Luminous Warm Light Beam overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '340px', sm: '520px' },
          height: { xs: '380px', sm: '520px' },
          background: 'radial-gradient(ellipse at top, rgba(255, 220, 140, 0.35) 0%, rgba(255, 190, 80, 0.12) 35%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
          '@keyframes floatMote': {
            '0%': { transform: 'translateY(0px) translateX(0px) scale(0.7)', opacity: 0 },
            '25%': { opacity: 0.75 },
            '75%': { opacity: 0.6 },
            '100%': { transform: 'translateY(-240px) translateX(18px) scale(1.15)', opacity: 0 }
          },
          '@keyframes wordCelestialIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(10px) scale(0.92)',
              filter: 'blur(6px)',
              textShadow: '0 0 18px rgba(253, 224, 71, 0.95)'
            },
            '65%': {
              opacity: 1,
              transform: 'translateY(-1px) scale(1.02)',
              filter: 'blur(0px)',
              textShadow: '0 0 12px rgba(253, 224, 71, 0.55)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0px) scale(1)',
              filter: 'blur(0px)'
            }
          },
          '@keyframes borderBeamSweep': {
            '0%': { transform: 'translateX(-120%)' },
            '100%': { transform: 'translateX(220%)' }
          },
          '@keyframes scriptureProgress': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          },
          '@keyframes haloBreath': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.55, boxShadow: '0 0 12px rgba(253, 224, 71, 0.45)' },
            '50%': { transform: 'scale(1.14)', opacity: 0.95, boxShadow: '0 0 22px rgba(253, 224, 71, 0.85)' }
          }
        }}
      />

      {/* Ambient Floating Golden Light Particles */}
      {AMBIENT_PARTICLES.map((p, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: '12%',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFFBEB 0%, #FDE047 60%, rgba(251, 191, 36, 0) 100%)',
            boxShadow: '0 0 10px 2px rgba(253, 224, 71, 0.65)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: p.opacity,
            animation: `floatMote ${p.duration} ease-in-out ${p.delay} infinite`
          }}
        />
      ))}

      {/* FROSTED GLASS CARD */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '430px',
          my: { xs: 2, sm: 4 },
          p: { xs: 3, sm: 4 },
          borderRadius: '26px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(22px) saturate(190%)',
          WebkitBackdropFilter: 'blur(22px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderTop: '1px solid rgba(255, 235, 180, 0.45)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 210, 120, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Church Logo Image at Top */}
        <Box
          sx={{
            position: 'relative',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 225, 140, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
              filter: 'blur(4px)'
            }}
          />
          <Avatar
            src="/logo.png"
            alt="Restauración Global"
            sx={{
              width: 68,
              height: 68,
              border: '2px solid rgba(255, 255, 255, 0.65)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 15px rgba(255, 220, 130, 0.3)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              p: 1
            }}
            imgProps={{
              style: {
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }
            }}
          />
        </Box>

        {/* Church Name & Slogan from restauracionglobal.org */}
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: { xs: '1.65rem', sm: '1.9rem' },
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.25)',
            mb: 0.3
          }}
        >
          {CHURCH_INFO.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#FDE047',
            fontSize: '0.86rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 2,
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)'
          }}
        >
          «{CHURCH_INFO.slogan}»
        </Typography>

        {/* Error Alert */}
        {errorMsg && (
          <Fade in={Boolean(errorMsg)}>
            <Alert
              severity="error"
              onClose={() => setErrorMsg('')}
              sx={{
                width: '100%',
                mb: 2,
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                backdropFilter: 'blur(10px)',
                color: '#FEE2E2',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '0.84rem',
                textAlign: 'left',
                '& .MuiAlert-icon': { color: '#F87171' }
              }}
            >
              {errorMsg}
            </Alert>
          </Fade>
        )}

        {/* Username / Email Input */}
        <TextField
          fullWidth
          name="usuario"
          placeholder="Usuario o Correo"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrorMsg('');
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <UserIcon sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
          sx={glassInputStyles}
        />

        {/* Password Input */}
        <TextField
          fullWidth
          name="contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMsg('');
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: 'rgba(255, 255, 255, 0.75)', p: 0.5, '&:hover': { color: '#FFFFFF' } }}
                >
                  {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <LockIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ ...glassInputStyles, mt: 1.6 }}
        />

        {/* SEDE SELECTION SECTION */}
        {!hasGlobalAccess && (
          <Box sx={{ width: '100%', mt: 1.8, textAlign: 'left' }}>
            <Box>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  mb: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6
                }}
              >
                <LocationIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                ¿A qué sede perteneces? <span style={{ color: '#F87171' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '50px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    height: '46px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.6)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#38BDF8',
                      boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#FFFFFF'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                      }
                    }
                  }}
                >
                  {SEDES_LIST.map((sede) => (
                    <MenuItem
                      key={sede.id}
                      value={sede.id}
                      sx={{
                        py: 1.2,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                        '&.Mui-selected': { backgroundColor: 'rgba(56, 189, 248, 0.2) !important' }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#FFFFFF' }}>
                          {sede.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          {sede.city} • {sede.scheduleShort}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* Remember me & Forgot password Row */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1.2,
            mb: 2.2,
            px: 0.5
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.65)',
                  p: 0.6,
                  '&.Mui-checked': {
                    color: '#FFFFFF'
                  }
                }}
              />
            }
            label={
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem', userSelect: 'none' }}>
                Recordarme
              </Typography>
            }
            sx={{ m: 0 }}
          />

          <Typography
            onClick={() => {
              setForgotSuccess(false);
              setForgotMsg('');
              setForgotIdentifier(username || '');
              setForgotDialogOpen(true);
            }}
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                color: '#FDE047',
                textDecoration: 'underline'
              }
            }}
          >
            ¿Olvidaste tu clave?
          </Typography>
        </Box>


        {/* Primary Action Button */}
        <Button
          type="submit"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.35,
            borderRadius: '50px',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            letterSpacing: '0.01em',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 15px rgba(255, 255, 255, 0.25)',
            transition: 'all 0.25s ease',
            '&:hover': {
              backgroundColor: '#F8FAFC',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45), 0 0 25px rgba(255, 255, 255, 0.5)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            }
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#0F172A' }} /> : 'Iniciar Sesión'}
        </Button>

        {/* Animated Bible Verses Showcase (Celestial 3D & Word-by-Word Reveal) */}
        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{
            mt: 2.6,
            width: '100%',
            p: { xs: 2, sm: 2.4 },
             pb: { xs: 2.2, sm: 2.5 },
            borderRadius: '22px',
            background:
              'linear-gradient(145deg, rgba(254, 240, 138, 0.14) 0%, rgba(15, 23, 42, 0.72) 50%, rgba(30, 41, 59, 0.65) 100%)',
            border: '1px solid rgba(253, 224, 71, 0.38)',
            boxShadow:
              '0 16px 36px -8px rgba(0, 0, 0, 0.65), 0 0 28px rgba(253, 224, 71, 0.14), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '158px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            perspective: '900px',
            transition: 'all 0.35s ease',
            '&:hover': {
              borderColor: 'rgba(253, 224, 71, 0.65)',
              boxShadow:
                '0 18px 40px -8px rgba(0, 0, 0, 0.75), 0 0 36px rgba(253, 224, 71, 0.24), inset 0 1px 2px rgba(255, 255, 255, 0.35)'
            }
          }}
        >
          {/* Sweeping Golden Shimmer Beam along top edge */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '55%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #FEF08A, #F59E0B, transparent)',
              animation: 'borderBeamSweep 4.2s ease-in-out infinite',
              pointerEvents: 'none'
            }}
          />

          {/* Decorative Giant Quotation Marks Watermark */}
          <Typography
            sx={{
              position: 'absolute',
              top: -12,
              left: 10,
              fontSize: '5.2rem',
              fontFamily: 'Georgia, serif',
              fontWeight: 900,
              lineHeight: 1,
              color: 'rgba(253, 224, 71, 0.08)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            “
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: 6,
              right: 12,
              fontSize: '4.5rem',
              fontFamily: 'Georgia, serif',
              fontWeight: 900,
              lineHeight: 1,
              color: 'rgba(253, 224, 71, 0.07)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            ”
          </Typography>

          {/* Header Bar: Pulsing Bible Emblem + Theme Pill + Prev/Next Controls */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              zIndex: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(253, 224, 71, 0.3) 0%, rgba(234, 179, 8, 0.1) 100%)',
                  border: '1px solid rgba(253, 224, 71, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'haloBreath 3s ease-in-out infinite'
                }}
              >
                <BibleIcon sx={{ color: '#FDE047', fontSize: 15 }} />
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  sx={{
                    color: '#FEF08A',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.11em',
                    lineHeight: 1.1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4
                  }}
                >
                  Palabra Viva <SparkleIcon sx={{ fontSize: 11, color: '#FDE047' }} />
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}
                >
                  {currentVerse.theme}
                </Typography>
              </Box>
            </Box>

            {/* Manual Prev / Next Arrow Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <IconButton
                size="small"
                onClick={() =>
                  changeVerse((verseIndex - 1 + LOGIN_BIBLE_VERSES.length) % LOGIN_BIBLE_VERSES.length)
                }
                sx={{
                  width: 24,
                  height: 24,
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  '&:hover': {
                    color: '#FDE047',
                    backgroundColor: 'rgba(253, 224, 71, 0.16)',
                    borderColor: 'rgba(253, 224, 71, 0.45)'
                  }
                }}
              >
                <PrevIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => changeVerse((verseIndex + 1) % LOGIN_BIBLE_VERSES.length)}
                sx={{
                  width: 24,
                  height: 24,
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  '&:hover': {
                    color: '#FDE047',
                    backgroundColor: 'rgba(253, 224, 71, 0.16)',
                    borderColor: 'rgba(253, 224, 71, 0.45)'
                  }
                }}
              >
                <NextIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Animated Scripture Body with Word-by-Word Celestial Reveal */}
          <Box
            key={verseIndex}
            sx={{
              px: 0.8,
              py: 0.5,
              zIndex: 2,
              opacity: verseFade ? 1 : 0,
              transform: verseFade
                ? ' perspective(800px) rotateX(0deg) translateY(0px) scale(1)'
                : 'perspective(800px) rotateX(-12deg) translateY(8px) scale(0.96)',
              filter: verseFade ? 'blur(0px)' : 'blur(4px)',
              transition: 'all 0.36s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <Typography
              component="div"
              sx={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: { xs: '0.84rem', sm: '0.88rem' },
                fontStyle: 'italic',
                lineHeight: 1.52,
                mb: 1,
                textAlign: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                columnGap: '4.5px',
                rowGap: '2px'
              }}
            >
              {currentWords.map((word, wIdx) => {
                const isHighlighted = (currentVerse.highlightWords || []).includes(word);
                return (
                  <Box
                    component="span"
                    key={`${verseIndex}-${wIdx}`}
                    sx={{
                      display: 'inline-block',
                      color: isHighlighted ? '#FEF08A' : 'rgba(255, 255, 255, 0.96)',
                      fontWeight: isHighlighted ? 700 : 400,
                      textShadow: isHighlighted
                        ? '0 0 12px rgba(253, 224, 71, 0.55), 0 1px 3px rgba(0,0,0,0.8)'
                        : '0 1px 4px rgba(0,0,0,0.65)',
                      opacity: 0,
                      animation: `wordCelestialIn 0.52s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`,
                      animationDelay: `${wIdx * 0.045}s`
                    }}
                  >
                    {word}
                  </Box>
                );
              })}
            </Typography>

            {/* Scripture Reference Pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.7,
                px: 1.5,
                py: 0.35,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, rgba(253, 224, 71, 0.18), rgba(245, 158, 11, 0.28), rgba(253, 224, 71, 0.18))',
                border: '1px solid rgba(253, 224, 71, 0.45)',
                boxShadow: '0 2px 10px rgba(253, 224, 71, 0.18)'
              }}
            >
              <Typography
                sx={{
                  color: '#FDE047',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {currentVerse.ref} • RVR1960
              </Typography>
            </Box>
          </Box>

          {/* Interactive Verse Indicator Dots */}
          <Box sx={{ display: 'flex', gap: 0.65, mt: 1.3, justifyContent: 'center', zIndex: 2 }}>
            {LOGIN_BIBLE_VERSES.map((v, idx) => (
              <Tooltip key={idx} title={v.ref} placement="top" arrow>
                <Box
                  onClick={() => changeVerse(idx)}
                  sx={{
                    width: idx === verseIndex ? 22 : 6,
                    height: 6,
                    borderRadius: '4px',
                    background:
                      idx === verseIndex
                        ? 'linear-gradient(90deg, #FEF08A, #F59E0B)'
                        : 'rgba(255, 255, 255, 0.25)',
                    boxShadow: idx === verseIndex ? '0 0 8px rgba(253, 224, 71, 0.7)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.35s ease',
                    '&:hover': {
                      backgroundColor: idx === verseIndex ? '#FDE047' : 'rgba(255, 255, 255, 0.55)',
                      transform: 'scale(1.15)'
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          {/* Bottom Luminous Time Progress Bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.07)'
            }}
          >
            <Box
              key={`${verseIndex}-${isPaused ? 'paused' : 'play'}`}
              sx={{
                height: '100%',
                background: 'linear-gradient(90deg, #F59E0B, #FDE047, #FEF9C3)',
                boxShadow: '0 0 10px rgba(253, 224, 71, 0.85)',
                animation: isPaused ? 'none' : 'scriptureProgress 7.5s linear forwards'
              }}
            />
          </Box>
        </Box>

        {/* Website link */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <WebIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }} />
          <Typography
            component="a"
            href="https://www.restauracionglobal.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.76rem',
              textDecoration: 'none',
              '&:hover': { color: '#FFFFFF', textDecoration: 'underline' }
            }}
          >
            www.restauracionglobal.org
          </Typography>
        </Box>
      </Box>

      {/* MODAL: RECUPERAR CONTRASEÑA */}
      <Dialog
        open={forgotDialogOpen}
        onClose={() => setForgotDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <KeyIcon sx={{ color: '#FCD34D' }} />
          Recuperar Contraseña
        </DialogTitle>
        <form onSubmit={handleRequestResetSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {forgotSuccess ? (
              <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 44, color: '#34D399', mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: '#A7F3D0', fontSize: '0.96rem', mb: 0.5 }}>
                  ¡Solicitud Enviada a los Superadmins!
                </Typography>
                <Typography sx={{ color: '#D1FAE5', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {forgotMsg}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem', mt: 1.5 }}>
                  Una vez que el Pastor Said Carrasquel o L. Infante aprueben tu solicitud, tu clave temporal será restablecida.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                  Indica tu usuario o correo registrado. Tu solicitud llegará directamente al panel de los <strong>Superadministradores</strong> para su verificación y aprobación.
                </Typography>

                <TextField
                  required
                  fullWidth
                  placeholder="Tu Usuario o Correo Electrónico *"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  sx={glassInputStyles}
                />

                <TextField
                  fullWidth
                  placeholder="Teléfono o WhatsApp de Contacto"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  sx={glassInputStyles}
                />

                <FormControl fullWidth size="small">
                  <Select
                    value={forgotSede}
                    onChange={(e) => setForgotSede(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '50px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      height: '46px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.24)' }
                    }}
                  >
                    {SEDES_LIST.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setForgotDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: '50px',
                color: 'rgba(255,255,255,0.85)',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: '#FFFFFF', color: '#FFFFFF' }
              }}
            >
              Cerrar
            </Button>
            {!forgotSuccess && (
              <Button
                type="submit"
                variant="contained"
                disabled={forgotSubmitting || !forgotIdentifier}
                startIcon={<SendIcon />}
                sx={{
                  borderRadius: '50px',
                  px: 3,
                  fontWeight: 700,
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  '&:hover': { backgroundColor: '#D97706' }
                }}
              >
                {forgotSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}


// Glassmorphism input styling
const glassInputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50px',
    color: '#FFFFFF',
    fontSize: '0.94rem',
    height: '48px',
    transition: 'all 0.25s ease',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.24)',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.45)'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.85)',
      boxShadow: '0 0 16px rgba(255, 255, 255, 0.28)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '12px 18px'
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.65)',
    opacity: 1
  }
};
