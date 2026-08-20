import { createTheme } from '@mui/material/styles';

/**
 * Material UI Custom Theme - Iglesia Cristiana Evangélica
 * Diseño: Minimalista, sobrio, profesional y libre de distracciones visuales.
 * Paleta: Azul Marino Oscuro (#0F172A), Gris Ceniza (#475569), Fondo Blanco Roto (#F8FAFC).
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A',      // Azul Marino Oscuro
      light: '#1E293B',
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#475569',      // Gris Ceniza / Slate
      light: '#64748B',
      dark: '#334155',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',   // Fondo sutil ceniza ultra-limpio
      paper: '#FFFFFF',     // Tarjetas y modales blancos
    },
    text: {
      primary: '#0F172A',   // Alto contraste y legibilidad óptima
      secondary: '#64748B', // Subtítulos y metadatos
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',     // Borde sutil de 1px
    success: {
      main: '#0D9488',      // Verde azulado sobrio para peticiones respondidas
      light: '#CCFBF1',
    },
    info: {
      main: '#2563EB',      // Azul informativo discreto
      light: '#DBEAFE',
    },
    warning: {
      main: '#D97706',      // Ámbar mate para etiquetas de atención
      light: '#FEF3C7',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h3: {
      fontSize: '1.35rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#475569',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#1E293B',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#64748B',
    },
    button: {
      textTransform: 'none', // Desactiva Mayúsculas automáticas en MUI
      fontWeight: 600,
      fontSize: '0.9rem',
    },
  },
  shape: {
    borderRadius: 12, // Esquinas suaves de 12px
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(15, 23, 42, 0.04)', // Sombra ultra-difusa nivel 1
    '0px 2px 6px rgba(15, 23, 42, 0.06)',
    '0px 4px 12px rgba(15, 23, 42, 0.08)',
    ...Array(21).fill('none') // Elimina sombras pesadas por defecto
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E2E8F0', // Bordes sutiles en vez de sombras recargadas
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.03)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          minHeight: '44px', // Tamaño táctil confortable para accesibilidad
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#0F172A',
          '&:hover': {
            backgroundColor: '#1E293B',
          },
        },
        outlined: {
          borderColor: '#CBD5E1',
          color: '#0F172A',
          '&:hover': {
            borderColor: '#0F172A',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.03)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.8rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 8px 30px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          height: '64px',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#64748B',
          '&.Mui-selected': {
            color: '#0F172A',
          },
        },
      },
    },
  },
});

export default theme;
