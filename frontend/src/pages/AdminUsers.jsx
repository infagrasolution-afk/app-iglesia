import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Shield as PastorIcon,
  Groups as LeaderIcon,
  Person as MemberIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COUNTRY_CODES = [
  { code: '+58', name: 'Venezuela', iso: 've', flag: '🇻🇪' },
  { code: '+57', name: 'Colombia', iso: 'co', flag: '🇨🇴' },
  { code: '+52', name: 'México', iso: 'mx', flag: '🇲🇽' },
  { code: '+1', name: 'EE.UU. / Canadá', iso: 'us', flag: '🇺🇸' },
  { code: '+34', name: 'España', iso: 'es', flag: '🇪🇸' },
  { code: '+54', name: 'Argentina', iso: 'ar', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', iso: 'cl', flag: '🇨🇱' },
  { code: '+51', name: 'Perú', iso: 'pe', flag: '🇵🇪' },
  { code: '+593', name: 'Ecuador', iso: 'ec', flag: '🇪🇨' },
  { code: '+1-809', name: 'Rep. Dominicana', iso: 'do', flag: '🇩🇴' },
  { code: '+507', name: 'Panamá', iso: 'pa', flag: '🇵🇦' },
  { code: '+506', name: 'Costa Rica', iso: 'cr', flag: '🇨🇷' },
  { code: '+502', name: 'Guatemala', iso: 'gt', flag: '🇬🇹' },
  { code: '+504', name: 'Honduras', iso: 'hn', flag: '🇭🇳' },
  { code: '+503', name: 'El Salvador', iso: 'sv', flag: '🇸🇻' },
  { code: '+505', name: 'Nicaragua', iso: 'ni', flag: '🇳🇮' },
  { code: '+591', name: 'Bolivia', iso: 'bo', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', iso: 'py', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', iso: 'uy', flag: '🇺🇾' }
];

export default function AdminUsers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [welcomeUser, setWelcomeUser] = useState(null);

  // Phone Country Code state
  const [countryCode, setCountryCode] = useState('+58');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'MIEMBRO',
    phone: '',
    status: 'Activo',
    password: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await userAPI.getAll();
      setUsers(data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generateUsername = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '';
    const firstInitial = parts[0][0].toUpperCase();
    const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0].slice(1);
    const capitalizedLast = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    return `${firstInitial}${capitalizedLast}`;
  };

  const handleNameChange = (val) => {
    const autoUsername = generateUsername(val);
    setFormData((prev) => ({
      ...prev,
      full_name: val,
      email: autoUsername
    }));
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setCountryCode('+58');
    setPhoneNumber('');
    setFormData({
      full_name: '',
      email: '',
      role: 'MIEMBRO',
      phone: '',
      status: 'Activo',
      password: '123456'
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);

    // Extract country code if present
    let rawPhone = user.phone || '';
    let foundCode = '+58';
    let numOnly = rawPhone;

    for (const c of COUNTRY_CODES) {
      if (rawPhone.startsWith(c.code)) {
        foundCode = c.code;
        numOnly = rawPhone.replace(c.code, '').trim();
        break;
      }
    }

    setCountryCode(foundCode);
    setPhoneNumber(numOnly);

    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'MIEMBRO',
      phone: user.phone || '',
      status: user.status || 'Activo',
      password: ''
    });
    setDialogOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.full_name.trim() || !phoneNumber.trim() || !formData.role) {
      setErrorMsg('Por favor ingrese los campos obligatorios: Nombre Completo, Número de Teléfono y Rol.');
      return;
    }

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
    const payload = {
      ...formData,
      phone: fullPhone
    };

    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, payload);
        setSuccessMsg(`Usuario ${formData.full_name} actualizado exitosamente.`);
      } else {
        const created = await userAPI.create(payload);
        setSuccessMsg(`Usuario ${formData.full_name} registrado exitosamente.`);

        // Set welcomeUser to open WhatsApp modal
        setWelcomeUser({
          full_name: created.full_name,
          username: created.email,
          phone: created.phone,
          password: formData.password || '123456'
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al guardar el usuario.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await userAPI.delete(deleteId);
      setSuccessMsg('Usuario eliminado correctamente.');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar el usuario.');
      setDeleteId(null);
    }
  };

  // Helper to generate WhatsApp wa.me link with welcome message & app download URL
  const getWhatsAppLink = (fullName, phone, username, password = '123456') => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const appUrl = 'https://app-iglesia-frontend.onrender.com';
    const msg = `¡Hola ${fullName}! Bendiciones. Te damos la bienvenida a la aplicación oficial de la Iglesia Restauración.\n\n🔑 Tus credenciales de acceso:\n• Usuario: ${username}\n• Contraseña: ${password}\n\n📲 Ingresa y descarga la App desde aquí:\n${appUrl}/\n\n¡Que sea de gran edificación para tu vida!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleSendWhatsApp = (user) => {
    const link = getWhatsAppLink(user.full_name, user.phone, user.email, '123456');
    if (link) {
      window.open(link, '_blank');
    } else {
      setErrorMsg('El usuario no posee un número telefónico válido para WhatsApp.');
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Summary Statistics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const pastorLeaderCount = users.filter((u) => u.role === 'PASTOR' || u.role === 'LIDER').length;
  const memberCount = users.filter((u) => u.role === 'MIEMBRO').length;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Chip icon={<AdminIcon />} label="Administrador Principal" color="primary" size="small" />;
      case 'PASTOR':
        return <Chip icon={<PastorIcon />} label="Pastor" color="secondary" size="small" />;
      case 'LIDER':
        return <Chip icon={<LeaderIcon />} label="Líder" color="info" size="small" />;
      default:
        return <Chip icon={<MemberIcon />} label="Miembro" variant="outlined" size="small" />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Módulo Administrativo de Usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Gestión de roles de Miembros, Líderes y Pastores de la Iglesia.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#0F172A',
              '&:hover': { backgroundColor: '#1E293B' }
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Success and Error Alerts */}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #0F172A' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                TOTAL REGISTRADOS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                {totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #0284C7' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 600 }}>
                ADMINISTRADORES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
                {adminCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #EAB308' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#CA8A04', fontWeight: 600 }}>
                PASTORES Y LÍDERES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#CA8A04', mt: 0.5 }}>
                {pastorLeaderCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #10B981' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                MIEMBROS CONGREGANTES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
                {memberCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre completo o usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por Rol</InputLabel>
              <Select value={roleFilter} label="Filtrar por Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="ALL">Todos los Roles</MenuItem>
                <MenuItem value="ADMIN">Administradores Principales</MenuItem>
                <MenuItem value="PASTOR">Pastores</MenuItem>
                <MenuItem value="LIDER">Líderes de Ministerio</MenuItem>
                <MenuItem value="MIEMBRO">Miembros Congregantes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* User List Table or Mobile Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ color: '#64748B' }}>
            No se encontraron usuarios coincidentes.
          </Typography>
        </Paper>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredUsers.map((u) => (
            <Card key={u.id} elevation={2} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {u.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    ID: #{u.id}
                  </Typography>
                </Box>
                {getRoleBadge(u.role)}
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155', fontWeight: 600 }}>
                  <MemberIcon sx={{ fontSize: 16, color: '#0284C7' }} /> Usuario: {u.email}
                </Typography>
                {u.phone && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155' }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#16A34A' }} /> {u.phone}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={u.status || 'Activo'}
                  color={u.status === 'Inactivo' ? 'error' : 'success'}
                  variant="outlined"
                  size="small"
                />

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton color="success" onClick={() => handleSendWhatsApp(u)} sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpenEdit(u)} sx={{ backgroundColor: 'rgba(2, 132, 199, 0.1)' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(u.id)} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nombre Completo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Usuario / Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rol Asignado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{u.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {u.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontWeight: 600 }}>
                          <MemberIcon sx={{ fontSize: 14 }} /> {u.email}
                        </Typography>
                        {u.phone && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                            <PhoneIcon sx={{ fontSize: 14 }} /> {u.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.status || 'Activo'}
                        color={u.status === 'Inactivo' ? 'error' : 'success'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Enviar Bienvenida por WhatsApp">
                        <IconButton
                          color="success"
                          onClick={() => handleSendWhatsApp(u)}
                          sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', mr: 0.5, '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.2)' } }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar Usuario">
                        <IconButton color="primary" onClick={() => handleOpenEdit(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Usuario">
                        <IconButton color="error" onClick={() => setDeleteId(u.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create / Edit User Dialog Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <form onSubmit={handleSaveUser}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', px: 3, py: 2 }}>
            {editingUser ? 'Editar Información del Usuario' : 'Registrar Nuevo Usuario / Miembro'}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo *"
                  required
                  value={formData.full_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ej. Juan Pérez"
                />
              </Grid>

              {/* Country Code & Phone Inputs */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>País *</InputLabel>
                  <Select
                    value={countryCode}
                    label="País *"
                    onChange={(e) => setCountryCode(e.target.value)}
                    renderValue={(selected) => {
                      const item = COUNTRY_CODES.find((c) => c.code === selected);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={`https://flagcdn.com/w40/${item?.iso || 've'}.png`}
                            alt={item?.name}
                            sx={{ width: 22, height: 15, borderRadius: '2px', objectFit: 'cover' }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected}</Typography>
                        </Box>
                      );
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            component="img"
                            src={`https://flagcdn.com/w40/${c.iso}.png`}
                            alt={c.name}
                            sx={{ width: 22, height: 15, borderRadius: '2px', objectFit: 'cover', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>{c.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{c.code}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Número de Teléfono *"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="414 0000000"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Rol en la Iglesia *</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol en la Iglesia *"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="ADMIN">Administrador Principal (Admin)</MenuItem>
                    <MenuItem value="PASTOR">Pastor</MenuItem>
                    <MenuItem value="LIDER">Líder de Ministerio</MenuItem>
                    <MenuItem value="MIEMBRO">Miembro Congregante</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario (Opcional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Se generará si se deja en blanco"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Estado de Cuenta</InputLabel>
                  <Select
                    value={formData.status}
                    label="Estado de Cuenta"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={editingUser ? 'Nueva Contraseña' : 'Contraseña (Defecto: 123456)'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3.5, py: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit" size="large" sx={{ borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" size="large" sx={{ backgroundColor: '#0F172A', '&:hover': { backgroundColor: '#1E293B' }, borderRadius: 2, px: 3 }}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* WhatsApp Welcome Modal for Newly Created Users */}
      <Dialog open={Boolean(welcomeUser)} onClose={() => setWelcomeUser(null)} maxWidth="xs" fullWidth>
        <Box
          sx={{
            backgroundColor: '#16A34A',
            color: '#FFFFFF',
            py: 3,
            px: 2.5,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 54, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            ¡Usuario Creado Exitosamente!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Notifica al nuevo miembro directamente a su WhatsApp.
          </Typography>
        </Box>

        {welcomeUser && (
          <DialogContent sx={{ p: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2.5, backgroundColor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700, mb: 1 }}>
                Resumen de Credenciales:
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                👤 <strong>Nombre:</strong> {welcomeUser.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>
                🔑 <strong>Usuario:</strong> {welcomeUser.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>
                🔒 <strong>Contraseña:</strong> {welcomeUser.password}
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>
                📱 <strong>Teléfono:</strong> {welcomeUser.phone}
              </Typography>
            </Paper>

            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<WhatsAppIcon />}
              onClick={() => {
                const link = getWhatsAppLink(
                  welcomeUser.full_name,
                  welcomeUser.phone,
                  welcomeUser.username,
                  welcomeUser.password
                );
                if (link) window.open(link, '_blank');
              }}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2.5,
                backgroundColor: '#22C55E',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                '&:hover': { backgroundColor: '#16A34A' }
              }}
            >
              Enviar Bienvenida por WhatsApp 💬
            </Button>
          </DialogContent>
        )}

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWelcomeUser(null)} color="inherit" fullWidth>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog Modal */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
