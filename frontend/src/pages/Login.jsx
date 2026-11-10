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
  Tooltip
} from '@mui/material';
import {
  PersonOutline as UserIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  LocationOn as LocationIcon,
  Public as GlobalIcon,
  Language as WebIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { SEDES_LIST, CHURCH_INFO } from '../data/sedesData';

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

  // Check user role types
  const normalizedUser = (username || '').toLowerCase().trim();
  const isOwnerUser = normalizedUser === 'linfante' || normalizedUser === 'linfante@restauracionglobal.org';
  const isGeneralAdmin = normalizedUser === 'admin' || normalizedUser === 'admin@iglesia.org';
  const isSedeAdminUser = normalizedUser.startsWith('admin_');
  const hasGlobalAccess = isOwnerUser || isGeneralAdmin;

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

  const handleQuickDemo = (role, defaultSede) => {
    if (role === 'owner') {
      setUsername('linfante');
      setPassword('aa11..**');
      setSelectedSede('plaza-venezuela');
    } else if (role === 'admin') {
      setUsername('admin');
      setPassword('admin');
      setSelectedSede('plaza-venezuela');
    } else if (role === 'admin_sede') {
      setUsername('admin_maracay');
      setPassword('123');
      setSelectedSede('maracay');
    } else if (role === 'lider') {
      setUsername('lider');
      setPassword('123');
      setSelectedSede(defaultSede || 'plaza-venezuela');
    } else {
      setUsername('miembro');
      setPassword('123');
      setSelectedSede(defaultSede || 'maracay');
    }
    setErrorMsg('');
  };

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
          zIndex: 1
        }}
      />

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
        <Box sx={{ width: '100%', mt: 1.8, textAlign: 'left' }}>
          {isOwnerUser ? (
            /* Owner / Super Admin Notification */
            <Box
              sx={{
                p: 1.4,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(194, 65, 12, 0.15) 100%)',
                border: '1.5px solid rgba(251, 146, 60, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2
              }}
            >
              <GlobalIcon sx={{ color: '#FDBA74', fontSize: 26 }} />
              <Box>
                <Typography sx={{ color: '#FFEDD5', fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.2 }}>
                  👑 Dueño de la App / Super Admin (L. Infante)
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.74rem' }}>
                  Acceso supremo a <strong>todas las sedes</strong>, control total y asignación de administradores de sede.
                </Typography>
              </Box>
            </Box>
          ) : isGeneralAdmin ? (
            /* General Admin Notification: Global Access */
            <Box
              sx={{
                p: 1.4,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2
              }}
            >
              <GlobalIcon sx={{ color: '#FCD34D', fontSize: 26 }} />
              <Box>
                <Typography sx={{ color: '#FEF3C7', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
                  🏛️ Pastor Principal / Admin General
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.74rem' }}>
                  El usuario admin tiene vista y control de <strong>todas las sedes</strong> nacionales.
                </Typography>
              </Box>
            </Box>
          ) : isSedeAdminUser ? (
            /* Sede Admin Notification */
            <Box
              sx={{
                p: 1.4,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2
              }}
            >
              <LocationIcon sx={{ color: '#93C5FD', fontSize: 26 }} />
              <Box>
                <Typography sx={{ color: '#EFF6FF', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
                  🏢 Administrador de Sede Asignado
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.74rem' }}>
                  Administras localmente tu sede con autoridad pastoral y de discipulado.
                </Typography>
              </Box>
            </Box>
          ) : (
            /* Non-Admin Requirement: Select Sede */
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
          )}
        </Box>

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
            onClick={() => setErrorMsg('Comunícate con el pastor o administrador de tu sede para asistencia con tu contraseña.')}
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                color: '#FFFFFF',
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

        {/* Quick Demo Access Chips */}
        <Box sx={{ mt: 2.2, width: '100%' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Acceso Rápido para Pruebas:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Dueño de la App / Super Admin (L. Infante: linfante / aa11..**)">
              <Chip
                size="small"
                label="👑 Linfante (Dueño)"
                onClick={() => handleQuickDemo('owner')}
                sx={{
                  backgroundColor: 'rgba(234, 88, 12, 0.25)',
                  color: '#FED7AA',
                  border: '1px solid rgba(251, 146, 60, 0.6)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  '&:hover': { backgroundColor: 'rgba(234, 88, 12, 0.45)' }
                }}
              />
            </Tooltip>
            <Tooltip title="Pastor Principal (Said Carrasquel: admin / admin)">
              <Chip
                size="small"
                label="🏛️ Admin General"
                onClick={() => handleQuickDemo('admin')}
                sx={{
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#FDE68A',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.35)' }
                }}
              />
            </Tooltip>
            <Tooltip title="Administrador de Sede (Pastor Wilmer: admin_maracay / 123)">
              <Chip
                size="small"
                label="🏢 Admin Sede (Maracay)"
                onClick={() => handleQuickDemo('admin_sede')}
                sx={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#BFDBFE',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.35)' }
                }}
              />
            </Tooltip>
            <Tooltip title="Miembro / Discípulo en Sede Maracay">
              <Chip
                size="small"
                label="🌱 Miembro (Maracay)"
                onClick={() => handleQuickDemo('miembro', 'maracay')}
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#A7F3D0',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.35)' }
                }}
              />
            </Tooltip>
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
