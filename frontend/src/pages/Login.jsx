import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
  Paper,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, inactivityNotice, setInactivityNotice } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPwd, setResetNewPwd] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    // Read saved credentials if remember me was enabled
    const savedUser = localStorage.getItem('remembered_email');
    const savedPwd = localStorage.getItem('remembered_password');
    const isRemembered = localStorage.getItem('remember_me') === 'true';

    if (isRemembered && savedUser) {
      setEmail(savedUser);
      if (savedPwd) setPassword(savedPwd);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      await login(email, password);
      navigate('/prayers');
    } catch (err) {
      setErrorMessage(err.message || 'Error al iniciar sesión. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetUser.trim() || !resetPhone.trim()) {
      setResetError('Por favor ingrese su Nombre de Usuario y Teléfono Registrado.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await authAPI.resetPassword(resetUser, resetPhone, resetNewPwd);
      setResetSuccess(res.message || 'Contraseña restablecida con éxito. Ya puede iniciar sesión.');
    } catch (err) {
      setResetError(err.message || 'No se pudo restablecer la contraseña. Verifique sus datos.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleContactAdminWhatsApp = () => {
    const adminPhone = '584141234567';
    const msg = `¡Hola! Olvidé mi contraseña de la app de la Iglesia Restauración.\n• Usuario: ${resetUser || 'Mi usuario'}\n• Teléfono: ${resetPhone || 'Mi teléfono'}\nPor favor, solicito su ayuda para restablecer mis credenciales.`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              py: 4,
              px: 3,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Iglesia Restauración"
              sx={{
                width: 90,
                height: 90,
                objectFit: 'cover',
                borderRadius: '50%',
                mixBlendMode: 'screen',
                mb: 1.5,
                filter: 'drop-shadow(0 4px 10px rgba(56, 189, 248, 0.4))'
              }}
            />

            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
              Iglesia Restauración
            </Typography>
          </Box>

          <CardContent sx={{ p: 3.5 }}>
            {inactivityNotice && (
              <Alert severity="warning" onClose={() => setInactivityNotice && setInactivityNotice('')} sx={{ mb: 2.5, borderRadius: 2 }}>
                {inactivityNotice}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Usuario *"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Linfante"
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Contraseña *"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 1 }}
              />

              {/* Enlace Olvidé mi Contraseña */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setResetUser(email);
                    setResetError('');
                    setResetSuccess('');
                    setResetModalOpen(true);
                  }}
                  sx={{ textTransform: 'none', color: '#0284C7', fontWeight: 600, fontSize: '0.82rem' }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>

              {/* Checkbox para Recordar Usuario y Contraseña */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                    Recordar usuario y contraseña
                  </Typography>
                }
                sx={{ mb: 2.5, display: 'flex', alignItems: 'center', ml: -0.5 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  backgroundColor: '#0F172A',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1E293B',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.35)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Paper>
      </Container>

      {/* Password Reset Modal Dialog */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleResetPassword}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
            🔑 Recuperar Contraseña
          </DialogTitle>
          <Typography variant="caption" sx={{ px: 3, color: '#64748B', display: 'block', mb: 1 }}>
            Ingrese su usuario y teléfono registrado para restablecer su clave.
          </Typography>
          <Divider />

          <DialogContent sx={{ p: 3 }}>
            {resetSuccess && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {resetSuccess}
              </Alert>
            )}
            {resetError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {resetError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nombre de Usuario *"
              required
              value={resetUser}
              onChange={(e) => setResetUser(e.target.value)}
              placeholder="ej. Linfante, Jperez"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Número de Teléfono Registrado *"
              required
              value={resetPhone}
              onChange={(e) => setResetPhone(e.target.value)}
              placeholder="ej. +58 414 0000000"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Nueva Contraseña (Opcional - Defecto: 123456)"
              type="password"
              value={resetNewPwd}
              onChange={(e) => setResetNewPwd(e.target.value)}
              placeholder="••••••••"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #E2E8F0', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                ¿Prefieres asistencia directa de la iglesia?
              </Typography>
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={handleContactAdminWhatsApp}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Solicitar ayuda por WhatsApp
              </Button>
            </Box>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setResetModalOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={resetLoading}
              sx={{ backgroundColor: '#0F172A', '&:hover': { backgroundColor: '#1E293B' } }}
            >
              {resetLoading ? <CircularProgress size={20} color="inherit" /> : 'Restablecer Clave'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
