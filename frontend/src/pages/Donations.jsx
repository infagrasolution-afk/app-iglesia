import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import {
  Favorite as HeartIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobilePayIcon,
  History as HistoryIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { donationAPI } from '../services/api';

const BANK_DETAILS = {
  bankName: "Banco Nacional / Internacional",
  accountHolder: "Iglesia Cristiana Evangélica A.R.",
  accountNumber: "0102-0123-45-0100012345",
  taxId: "J-30982341-0",
  mobilePay: "+58 414 1234567"
};

const PRESET_AMOUNTS = [10, 25, 50, 100, 200];

export default function Donations() {
  const [activeStep, setActiveStep] = useState(0);

  // Step 1 State
  const [donationType, setDonationType] = useState('Diezmo');
  const [amount, setAmount] = useState('50');

  // Step 2 State
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedDonation, setCompletedDonation] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const data = await donationAPI.getAll();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbarMsg(`¡${label} copiado al portapapeles!`);
    setSnackbarOpen(true);
  };

  const handleNext = () => {
    if (parseFloat(amount) > 0) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await donationAPI.create({
        donation_type: donationType,
        amount: parseFloat(amount),
        payment_method: paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Pago Móvil',
        reference: reference || 'CONFIRMADO_ONLINE'
      });

      setCompletedDonation(result);
      setHistory([result, ...history]);
      setActiveStep(2); // Step 3: Receipt Confirmation
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setAmount('50');
    setReference('');
    setCompletedDonation(null);
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 0.5 }}>
          Diezmos y Ofrendas
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          "Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre." (2 Corintios 9:7)
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: 2-Step Donation Wizard */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              <Step><StepLabel>Tipo y Monto</StepLabel></Step>
              <Step><StepLabel>Método de Pago</StepLabel></Step>
              <Step><StepLabel>Recibo Digital</StepLabel></Step>
            </Stepper>

            {/* STEP 1: Select Type & Amount */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  1. Selecciona el Tipo de Aporte
                </Typography>

                <RadioGroup
                  row
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  sx={{ mb: 3, gap: 1 }}
                >
                  {['Diezmo', 'Ofrenda', 'Pro-Templo'].map((t) => (
                    <Paper
                      key={t}
                      variant="outlined"
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        borderColor: donationType === t ? '#0F172A' : '#E2E8F0',
                        backgroundColor: donationType === t ? 'rgba(15, 23, 42, 0.04)' : '#FFFFFF'
                      }}
                    >
                      <FormControlLabel value={t} control={<Radio color="primary" />} label={t} />
                    </Paper>
                  ))}
                </RadioGroup>

                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Monto a Generar ($ / Moneda Local)
                </Typography>

                {/* Preset Amount Chips */}
                <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                  {PRESET_AMOUNTS.map((preset) => (
                    <Chip
                      key={preset}
                      label={`$${preset}`}
                      clickable
                      color={amount === String(preset) ? 'primary' : 'default'}
                      onClick={() => setAmount(String(preset))}
                      sx={{ fontWeight: 600, fontSize: '0.9rem', px: 1 }}
                    />
                  ))}
                </Stack>

                <TextField
                  fullWidth
                  type="number"
                  label="Monto Personalizado"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: '#64748B' }}>$</Typography>
                  }}
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<NextIcon />}
                    onClick={handleNext}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    Continuar al Método de Pago
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 2: Bank details and fast copy */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleSubmitDonation}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  2. Datos Bancarios para Transferencia Rápida
                </Typography>

                <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
                  Haz clic en el botón de copiar para pegar rápidamente los datos en la app de tu banco:
                </Typography>

                {/* Quick Copy Box */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 3, backgroundColor: '#F8FAFC' }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Titular:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{BANK_DETAILS.accountHolder}</Typography>
                        <IconButton size="small" onClick={() => handleCopy(BANK_DETAILS.accountHolder, 'Titular')}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Cuenta Bancaria:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{BANK_DETAILS.accountNumber}</Typography>
                        <IconButton size="small" onClick={() => handleCopy(BANK_DETAILS.accountNumber, 'Número de Cuenta')}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>RUC / Tax ID:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{BANK_DETAILS.taxId}</Typography>
                        <IconButton size="small" onClick={() => handleCopy(BANK_DETAILS.taxId, 'RUC / Tax ID')}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>

                <TextField
                  fullWidth
                  label="Número de Referencia / Comprobante (Opcional)"
                  placeholder="Ej: 981240"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<HeartIcon />}
                    disabled={submitting}
                  >
                    {submitting ? 'Confirmando...' : 'Confirmar Aporte'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 3: Receipt Confirmation */}
            {activeStep === 2 && completedDonation && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckIcon sx={{ fontSize: '4rem', color: '#0D9488', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
                  ¡Muchas gracias por tu generosidad!
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
                  Tu {completedDonation.donation_type} por valor de <strong>${completedDonation.amount.toFixed(2)}</strong> ha sido registrado satisfactoriamente.
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'inline-block', minWidth: 280, backgroundColor: '#F8FAFC' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>RECIBO DIGITAL #00{completedDonation.id}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>Fecha: {new Date().toLocaleDateString('es-ES')}</Typography>
                </Paper>

                <Box>
                  <Button variant="contained" color="primary" onClick={handleReset}>
                    Realizar Otro Aporte
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Personal Contribution History */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryIcon sx={{ color: '#0F172A' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Histórico Personal de Aportes
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {history.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center', py: 3 }}>
                Aún no registras diezmos u ofrendas en tu historial.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Monto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Chip label={item.donation_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#0D9488' }}>
                          ${item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {new Date(item.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}
