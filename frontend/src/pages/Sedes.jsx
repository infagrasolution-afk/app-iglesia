import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Instagram as InstagramIcon,
  AccountBalance as BankIcon,
  ContentCopy as CopyIcon,
  VolunteerActivism as PrayerIcon,
  YouTube as YouTubeIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { SEDES_LIST, CHURCH_INFO } from '../data/sedesData';
import { useAuth } from '../context/AuthContext';

export default function Sedes() {
  const { currentSede, setCurrentSede, isAdmin } = useAuth();
  const [selectedState, setSelectedState] = useState('ALL');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbarMsg(`¡${label} copiado al portapapeles!`);
    setSnackbarOpen(true);
  };

  const filteredSedes = SEDES_LIST.filter((sede) => {
    if (selectedState === 'ALL') return true;
    if (selectedState === 'CARACAS') return sede.state === 'Distrito Capital' || sede.state === 'Miranda';
    if (selectedState === 'ARAGUA') return sede.state === 'Aragua';
    if (selectedState === 'ZULIA') return sede.state === 'Zulia';
    return true;
  });

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 50%, #83050B 100%)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip
            icon={<LocationIcon sx={{ color: '#FDE047 !important', fontSize: '1rem' }} />}
            label="PRESENCIA NACIONAL • 5 SEDES"
            size="small"
            sx={{
              backgroundColor: 'rgba(253, 224, 71, 0.15)',
              color: '#FEF08A',
              fontWeight: 700,
              fontSize: '0.76rem',
              letterSpacing: '0.05em',
              mb: 1.5,
              border: '1px solid rgba(253, 224, 71, 0.3)'
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.5rem' }, mb: 1, letterSpacing: '-0.02em' }}>
            Nuestras Sedes
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.82)', maxWidth: '750px', fontSize: { xs: '0.92rem', sm: '1.05rem' }, lineHeight: 1.6 }}>
            {CHURCH_INFO.name} es una comunidad de fe viva presente en Caracas, Aragua y Zulia.
            Ubica tu sede más cercana, conoce a sus pastores, horarios de reunión y formas de ofrendar.
          </Typography>

          {/* Quick Stats */}
          <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 1.5 }}>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem' }}>5</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Sedes Activas</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '1.2rem' }}>2007</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Año de Fundación</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Typography sx={{ color: '#6EE7B7', fontWeight: 800, fontSize: '1.2rem' }}>4 Días/Sem</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Oración Online 8pm</Typography>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Region Filter Tabs */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'center' }}>
        <Paper
          sx={{
            p: 0.5,
            borderRadius: '50px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0'
          }}
        >
          <Tabs
            value={selectedState}
            onChange={(e, val) => setSelectedState(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-indicator': { display: 'none' }
            }}
          >
            <Tab
              value="ALL"
              label="Todas las Sedes (5)"
              sx={tabStyles(selectedState === 'ALL')}
            />
            <Tab
              value="CARACAS"
              label="Caracas / Miranda (3)"
              sx={tabStyles(selectedState === 'CARACAS')}
            />
            <Tab
              value="ARAGUA"
              label="Maracay (1)"
              sx={tabStyles(selectedState === 'ARAGUA')}
            />
            <Tab
              value="ZULIA"
              label="Maracaibo (1)"
              sx={tabStyles(selectedState === 'ZULIA')}
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Sedes Cards Grid */}
      <Grid container spacing={3}>
        {filteredSedes.map((sede) => {
          const isUserSede = currentSede === sede.id;
          return (
            <Grid item xs={12} md={6} key={sede.id}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: isUserSede ? '0 12px 30px rgba(131, 5, 11, 0.25)' : '0 8px 25px rgba(0,0,0,0.06)',
                  border: isUserSede ? '2px solid #83050B' : '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 35px rgba(0,0,0,0.12)'
                  }
                }}
              >
                {/* Header banner with color theme */}
                <Box
                  sx={{
                    p: 2.5,
                    background: sede.bgGradient || 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Chip
                      label={sede.badge}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        mb: 1,
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                      {sede.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: '#FCD34D' }} />
                      {sede.location}
                    </Typography>
                  </Box>

                  {/* Sede badge or indicator */}
                  {isUserSede && (
                    <Chip
                      icon={<StarIcon sx={{ color: '#FCD34D !important', fontSize: 16 }} />}
                      label="Tu Sede"
                      size="small"
                      sx={{
                        backgroundColor: '#FFFFFF',
                        color: '#83050B',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Schedule & Meeting pill */}
                  <Box
                    sx={{
                      p: 1.6,
                      borderRadius: '14px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <ScheduleIcon sx={{ color: '#0F172A', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Horario de Reunión
                      </Typography>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.98rem' }}>
                        {sede.schedule}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pastoral Team */}
                  <Box>
                    <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                      Pastores & Liderazgo
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                      {sede.pastors}
                    </Typography>
                    {sede.team && (
                      <Typography sx={{ color: '#64748B', fontSize: '0.82rem', mt: 0.3 }}>
                        {sede.team}
                      </Typography>
                    )}
                  </Box>

                  {/* Description */}
                  <Typography sx={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {sede.description}
                  </Typography>

                  <Divider />

                  {/* Giving / Donation Info */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <BankIcon sx={{ fontSize: 18, color: '#83050B' }} />
                        Datos para Diezmos y Ofrendas
                      </Typography>
                      <Chip label={sede.donation.bank} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem', backgroundColor: '#FFFFFF' }} />
                    </Box>

                    <Stack spacing={0.6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Cédula / RIF: <strong>{sede.donation.taxId}</strong>
                        </Typography>
                        <Tooltip title="Copiar Cédula">
                          <IconButton size="small" onClick={() => handleCopy(sede.donation.taxId, 'Cédula/RIF')}>
                            <CopyIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Pago Móvil: <strong>{sede.donation.phone}</strong>
                        </Typography>
                        <Tooltip title="Copiar Teléfono">
                          <IconButton size="small" onClick={() => handleCopy(sede.donation.phone, 'Teléfono Pago Móvil')}>
                            <CopyIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions Row */}
                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                    {sede.social.instagramUrl && (
                      <Button
                        component="a"
                        href={sede.social.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<InstagramIcon />}
                        endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          borderColor: '#E2E8F0',
                          color: '#475569',
                          '&:hover': { borderColor: '#E1306C', color: '#E1306C' }
                        }}
                      >
                        {sede.social.instagram}
                      </Button>
                    )}

                    {isAdmin && (
                      <Button
                        size="small"
                        variant={isUserSede ? 'contained' : 'outlined'}
                        onClick={() => setCurrentSede(sede.id)}
                        sx={{
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          ml: 'auto',
                          backgroundColor: isUserSede ? '#0F172A' : 'transparent',
                          borderColor: '#0F172A',
                          color: isUserSede ? '#FFFFFF' : '#0F172A'
                        }}
                      >
                        {isUserSede ? 'Sede Seleccionada' : 'Filtrar por esta Sede'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Online Prayer Banner (¿Oramos por ti? from Website) */}
      <Box
        sx={{
          mt: 5,
          p: { xs: 3, sm: 4 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}
      >
        <Box sx={{ maxWidth: '680px' }}>
          <Chip
            icon={<PrayerIcon sx={{ color: '#F472B6 !important', fontSize: 16 }} />}
            label="TIEMPO DE INTERCESIÓN ONLINE"
            size="small"
            sx={{
              backgroundColor: 'rgba(244, 114, 182, 0.15)',
              color: '#FBCFE8',
              fontWeight: 700,
              fontSize: '0.72rem',
              mb: 1
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
            ¿Oramos por ti?
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            No pases por tus luchas en soledad, en <strong>Restauración Global</strong> oramos contigo.
            Cada <strong>lunes, martes, jueves y viernes a las 8:00 pm</strong>, nuestro equipo se conecta vía Google Meet
            con el único propósito de interceder por tus necesidades. ¡Hay una familia respaldándote!
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Button
            component="a"
            href={CHURCH_INFO.youtube}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<YouTubeIcon />}
            sx={{
              borderRadius: '50px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              py: 1.2,
              '&:hover': { backgroundColor: '#DC2626' }
            }}
          >
            Prédicas en YouTube
          </Button>
          <Button
            component="a"
            href={CHURCH_INFO.website}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            sx={{
              borderRadius: '50px',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.2,
              '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.08)' }
            }}
          >
            Sitio Web Oficial
          </Button>
        </Stack>
      </Box>

      {/* Copy Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const tabStyles = (isSelected) => ({
  borderRadius: '50px',
  px: 2.4,
  py: 0.8,
  minHeight: 'auto',
  fontSize: '0.84rem',
  fontWeight: isSelected ? 700 : 500,
  textTransform: 'none',
  color: isSelected ? '#FFFFFF !important' : '#64748B',
  backgroundColor: isSelected ? '#0F172A' : 'transparent',
  transition: 'all 0.2s',
  '&:hover': { color: '#0F172A' }
});
