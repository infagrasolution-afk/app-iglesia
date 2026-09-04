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
  Avatar
} from '@mui/material';
import {
  PersonOutline as UserIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password);
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
        p: 2,
        overflow: 'hidden'
      }}
    >
      {/* Soft dark vignette to focus on the center lamp and glass card */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 18%, rgba(255, 200, 110, 0.22) 0%, rgba(10, 17, 40, 0.45) 45%, rgba(6, 10, 25, 0.92) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Luminous Warm Light Beam overlay streaming from lamp */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '340px', sm: '480px' },
          height: { xs: '380px', sm: '500px' },
          background: 'radial-gradient(ellipse at top, rgba(255, 220, 140, 0.35) 0%, rgba(255, 190, 80, 0.12) 35%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* FROSTED GLASS CARD (Glassmorphism as in the reference image) */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '390px',
          mt: { xs: 4, sm: 6 },
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: '26px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(22px) saturate(190%)',
          WebkitBackdropFilter: 'blur(22px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderTop: '1px solid rgba(255, 235, 180, 0.45)', // Catches the top lamp light
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 210, 120, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Church Logo Image at Top (Circular badge with soft warm halo) */}
        <Box
          sx={{
            position: 'relative',
            mb: 1.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Outer glowing ring */}
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
            alt="Restauración"
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

        {/* Church Name "Restauración" replacing "Login" */}
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: { xs: '1.85rem', sm: '2.1rem' },
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.25)',
            mb: 0.4
          }}
        >
          Restauración
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.72)',
            fontSize: '0.85rem',
            fontWeight: 400,
            mb: 3,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
          }}
        >

        </Typography>

        {/* Error Alert */}
        {errorMsg && (
          <Fade in={Boolean(errorMsg)}>
            <Alert
              severity="error"
              onClose={() => setErrorMsg('')}
              sx={{
                width: '100%',
                mb: 2.2,
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#FEE2E2',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '0.84rem',
                '& .MuiAlert-icon': { color: '#F87171' }
              }}
            >
              {errorMsg}
            </Alert>
          </Fade>
        )}

        {/* Username / Email Input (Frosted glass pill with user icon on the right) */}
        <TextField
          fullWidth
          name="usuario"
          placeholder="Usuario"
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

        {/* Password Input (Frosted glass pill with lock icon on the right) */}
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
          sx={{ ...glassInputStyles, mt: 1.8 }}
        />

        {/* Remember me & Forgot password Row */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1.5,
            mb: 2.8,
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
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.84rem', userSelect: 'none' }}>
                Remember me
              </Typography>
            }
            sx={{ m: 0 }}
          />

          <Typography
            onClick={() => setErrorMsg('Comunícate con el pastor o administrador para restablecer tu contraseña.')}
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                color: '#FFFFFF',
                textDecoration: 'underline'
              }
            }}
          >
            Forgot password?
          </Typography>
        </Box>

        {/* Primary Action Button (White Rounded Pill Button matching the reference) */}
        <Button
          type="submit"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.35,
            borderRadius: '50px',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            fontWeight: 700,
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
          {loading ? <CircularProgress size={22} sx={{ color: '#0F172A' }} /> : 'Login'}
        </Button>
      </Box>
    </Box>
  );
}

// Glassmorphism input styling matching the reference image
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
