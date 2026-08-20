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
  Avatar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  Church
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, inactivityNotice, setInactivityNotice } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user credentials were remembered
    const isRemembered = localStorage.getItem('remember_me') === 'true';
    if (isRemembered) {
      setRememberMe(true);
      const savedUser = localStorage.getItem('remembered_user');
      const savedPass = localStorage.getItem('remembered_password');
      if (savedUser) setEmail(savedUser);
      if (savedPass) setPassword(savedPass);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingrese usuario/correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    if (setInactivityNotice) setInactivityNotice('');

    try {
      const res = await login(email, password, rememberMe);
      const userRole = res.user?.role?.toUpperCase();
      if (userRole === 'ADMIN' || userRole === 'PASTOR') {
        navigate('/admin/users');
      } else {
        navigate('/prayers');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales incorrectas o servidor no disponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        // High quality church sanctuary background image with dark overlay
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.92) 100%), url("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
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
                label="Contraseña"
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
                sx={{ mb: 1.5 }}
              />

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
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2.5,
                  backgroundColor: '#0F172A',
                  boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.4)',
                  '&:hover': {
                    backgroundColor: '#1E293B',
                    boxShadow: '0 12px 20px -4px rgba(15, 23, 42, 0.5)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}
