import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Divider,
  Stack,
  Button
} from '@mui/material';
import {
  Church as ChurchIcon,
  AutoStories as BookIcon,
  Flag as FlagIcon,
  Visibility as VisionIcon,
  Groups as TeamIcon,
  Language as WebIcon,
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  CheckCircle as CheckIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { CHURCH_INFO, SEDES_LIST } from '../data/sedesData';

export default function AboutUs() {
  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Hero Banner */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3.5, sm: 5 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #83050B 0%, #1A0003 70%, #0F172A 100%)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Chip
          icon={<ChurchIcon sx={{ color: '#FCD34D !important', fontSize: 18 }} />}
          label={`FUNDADA EL ${CHURCH_INFO.founded.toUpperCase()} EN CARACAS`}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#FDE047',
            fontWeight: 700,
            fontSize: '0.76rem',
            letterSpacing: '0.06em',
            mb: 2,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '2rem', sm: '2.8rem' }, mb: 1, letterSpacing: '-0.02em' }}>
          {CHURCH_INFO.name}
        </Typography>
        <Typography variant="h6" sx={{ color: '#FDE047', fontWeight: 600, fontStyle: 'italic', mb: 2, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
          «{CHURCH_INFO.slogan}»
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.88)', maxWidth: '780px', mx: 'auto', fontSize: { xs: '0.94rem', sm: '1.05rem' }, lineHeight: 1.7 }}>
          Una comunidad de fe viva, arraigada en la gracia de Dios y comprometida con la transformación integral
          de las familias en Venezuela. Nacemos con el propósito de ser instrumento de restauración en las vidas,
          hogares y ciudades de nuestra nación.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component="a"
            href={CHURCH_INFO.website}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<WebIcon />}
            sx={{
              borderRadius: '50px',
              backgroundColor: '#FFFFFF',
              color: '#83050B',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#F8FAFC' }
            }}
          >
            Página Web Oficial
          </Button>
          <Button
            component="a"
            href={CHURCH_INFO.youtube}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<YouTubeIcon />}
            sx={{
              borderRadius: '50px',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            YouTube @restauracionglobal
          </Button>
        </Box>
      </Box>

      {/* Leadership & Identity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', height: '100%', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TeamIcon sx={{ color: '#83050B', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Pastores Globales
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Liderazgo y Cobertura Pastoral
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', mb: 1 }}>
                {CHURCH_INFO.globalPastors}
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Guiando la visión del ministerio desde su fundación en el 2007. Acompañados por un sólido equipo ministerial
                y pastoral en cada una de las 5 sedes en Caracas, Maracay, Miranda y Maracaibo, promoviendo una cultura de amor,
                sanidad interior y alineación al diseño de Dios.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', height: '100%', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ShieldIcon sx={{ color: '#2563EB', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Denominación e Identidad
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {CHURCH_INFO.denomination}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, mb: 1.5 }}>
                {CHURCH_INFO.denominationDetails}
              </Typography>
              <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 600 }}>
                  ✓ Fundamento Bíblico: Sola Scriptura (66 libros inspirados e inerrantes)
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 600, mt: 0.5 }}>
                  ✓ Identidad Pentecostal: Poder del Espíritu Santo para transformar vidas hoy
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mission & Vision */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', height: '100%', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <FlagIcon sx={{ color: '#059669', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Nuestra Misión
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem', mb: 2, fontStyle: 'italic' }}>
                {CHURCH_INFO.mission}
              </Typography>
              <Stack spacing={1.5}>
                {CHURCH_INFO.missionAxes.map((axis, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#166534' }}>
                      {axis.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#374151', mt: 0.3 }}>
                      {axis.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', height: '100%', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <VisionIcon sx={{ color: '#7C3AED', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Nuestra Visión
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '1.02rem', mb: 2.5, lineHeight: 1.6 }}>
                «{CHURCH_INFO.vision}»
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, fontSize: '0.98rem' }}>
                Sistema de Gobierno
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Rechazamos el legalismo autoritario y el desorden. Nos regimos bajo el modelo del Nuevo Testamento de un
                <strong> Equipo Ministerial Plural y Teocrático</strong> con liderazgo de cobertura y rendición de cuentas,
                garantizando transparencia, sabiduría y madurez espiritual.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Online Prayer Schedule Banner */}
      <Paper
        sx={{
          p: 3.5,
          borderRadius: '20px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          ¿Oramos por ti?
        </Typography>
        <Typography sx={{ color: '#FCD34D', fontWeight: 600, mb: 1.5, fontSize: '1rem' }}>
          {CHURCH_INFO.prayerTimes}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '650px', mx: 'auto', fontSize: '0.9rem', mb: 2.5 }}>
          Nuestro equipo se conecta a través de Google Meet para interceder con poder por cada una de tus necesidades.
          ¡Hay una familia unida respaldándote en oración!
        </Typography>
        <Button
          component="a"
          href="/prayers"
          variant="contained"
          sx={{
            borderRadius: '50px',
            backgroundColor: '#83050B',
            color: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1.2,
            '&:hover': { backgroundColor: '#A10E17' }
          }}
        >
          Dejar mi Petición en el Muro
        </Button>
      </Paper>
    </Box>
  );
}
