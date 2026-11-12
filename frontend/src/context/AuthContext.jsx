import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getSedesList, assignSedeAdmin, INITIAL_SEDES_LIST } from '../data/sedesData';

export const APP_MODULES_CATALOG = [
  { key: 'prayers', label: 'Muro de Oración', shortLabel: 'Oración', path: '/prayers', desc: 'Intercesión y peticiones de fe' },
  { key: 'members', label: 'Directorio de Miembros', shortLabel: 'Directorio', path: '/members', desc: 'Directorio congregacional de la sede' },
  { key: 'discipleship', label: 'Discipulado Bíblico', shortLabel: 'Discipulado', path: '/discipleship', desc: 'Lecciones, módulos y evaluaciones' },
  { key: 'emotions', label: 'Frasco de Emociones', shortLabel: 'Emociones', path: '/emotions', desc: 'Promesas bíblicas según tu estado de ánimo' },
  { key: 'bible', label: 'Santa Biblia (3 Versiones)', shortLabel: 'Biblia', path: '/bible', desc: 'RVR1960, NVI, NTV y Devocional IA' },
  { key: 'sedes', label: 'Nuestras Sedes', shortLabel: 'Sedes', path: '/sedes', desc: 'Ubicaciones, horarios y pastores' },
  { key: 'about', label: 'Nuestra Iglesia', shortLabel: 'Nosotros', path: '/about', desc: 'Historia, visión, misión y doctrina' },
  { key: 'announcements', label: 'Anuncios y Boletín', shortLabel: 'Anuncios', path: '/announcements', desc: 'Comunicados oficiales y eventos' },
  { key: 'sermons', label: 'Sermones y Podcast', shortLabel: 'Sermones', path: '/sermons', desc: 'Prédicas en audio, video y bosquejos PDF' },
  { key: 'donations', label: 'Diezmos y Ofrendas', shortLabel: 'Diezmos', path: '/donations', desc: 'Aportes, Pago Móvil y recibos digitales' }
];

export const ALL_MODULE_KEYS = APP_MODULES_CATALOG.map((m) => m.key);

export const DEFAULT_MEMBER_MODULES = [
  'prayers', 'discipleship', 'emotions', 'bible',
  'sedes', 'about', 'announcements', 'sermons', 'donations'
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setRoleState] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved).role || 'MIEMBRO' : 'MIEMBRO';
    } catch {
      return 'MIEMBRO';
    }
  });

  // Current active Sede in session
  const [currentSede, setCurrentSedeState] = useState(() => {
    try {
      const savedSede = localStorage.getItem('currentSede');
      if (savedSede) return savedSede;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN_PRINCIPAL' || parsed.role === 'ADMIN') {
          return 'TODAS';
        }
        return parsed.sede || 'plaza-venezuela';
      }
      return 'TODAS';
    } catch {
      return 'TODAS';
    }
  });

  const setCurrentSede = (sedeId) => {
    setCurrentSedeState(sedeId);
    localStorage.setItem('currentSede', sedeId);
  };

  const [mustChangePassword, setMustChangePassword] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? Boolean(JSON.parse(saved).must_change_password) : false;
    } catch {
      return false;
    }
  });

  const changePassword = async (newPassword) => {
    if (!user?.id) throw new Error("No hay usuario autenticado.");
    const res = await authAPI.changePassword(user.id, newPassword);
    const updatedUser = { ...user, must_change_password: false };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setMustChangePassword(false);
    return res;
  };

  const login = async (email, password, selectedSede = null) => {
    const normalizedKey = (email || '').toLowerCase().trim();

    // Check if user is Super Admin (Owner or Pastor Said) or Admin Principal
    const isOwner = normalizedKey === 'linfante' || normalizedKey === 'linfante@restauracionglobal.org' || normalizedKey === 'linfante@restauracion.org';
    const isPastorSaid = normalizedKey === 'scarrasquel' || normalizedKey === 'scarrasquel@restauracionglobal.org' || normalizedKey === 'scarrasquel@restauracion.org';
    const isGeneralAdmin = normalizedKey === 'admin' || normalizedKey === 'admin@iglesia.org';
    const hasGlobalAccess = isOwner || isPastorSaid || isGeneralAdmin;

    // Sede to assign
    const assignedSede = hasGlobalAccess ? 'TODAS' : (selectedSede || 'plaza-venezuela');

    try {
      const data = await authAPI.login({ email, password });
      const authToken = data.access_token;
      const requiresChange = Boolean(data.must_change_password || data.user?.must_change_password);
      const isGlobalRole = data.user?.role === 'SUPER_ADMIN' || data.user?.role === 'ADMIN_PRINCIPAL' || hasGlobalAccess;
      const authUser = {
        ...data.user,
        sede: isGlobalRole ? 'TODAS' : (data.user.sede || assignedSede),
        must_change_password: requiresChange
      };

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('currentSede', authUser.sede || assignedSede);

      setToken(authToken);
      setUser(authUser);
      setRoleState(authUser.role || 'MIEMBRO');
      setCurrentSedeState(authUser.sede || assignedSede);
      setMustChangePassword(requiresChange);
      return { success: true, user: authUser, must_change_password: requiresChange };
    } catch (error) {

      // Default / offline credentials check
      const defaultUsers = {
        // 1. SUPER ADMIN: DUEÑO DE LA APP (L. INFANTE)
        'linfante': {
          id: 100,
          username: 'linfante',
          full_name: 'Ing. L. Infante (Dueño de la App / Super Admin)',
          name: 'L. Infante',
          role: 'SUPER_ADMIN',
          isOwner: true,
          isSuperAdmin: true,
          sede: 'TODAS',
          passwordReq: 'aa11..**'
        },
        'linfante@restauracionglobal.org': {
          id: 100,
          username: 'linfante',
          full_name: 'Ing. L. Infante (Dueño de la App / Super Admin)',
          name: 'L. Infante',
          role: 'SUPER_ADMIN',
          isOwner: true,
          isSuperAdmin: true,
          sede: 'TODAS',
          passwordReq: 'aa11..**'
        },
        'linfante@restauracion.org': {
          id: 100,
          username: 'linfante',
          full_name: 'Ing. L. Infante (Dueño de la App / Super Admin)',
          name: 'L. Infante',
          role: 'SUPER_ADMIN',
          isOwner: true,
          isSuperAdmin: true,
          sede: 'TODAS',
          passwordReq: 'aa11..**'
        },

        // 2. SUPER ADMIN: PASTOR PRINCIPAL GLOBAL (SAID CARRASQUEL)
        'scarrasquel': {
          id: 1,
          username: 'scarrasquel',
          full_name: 'Pastor Said Carrasquel (Pastor Global / Super Admin)',
          name: 'Pastor Said Carrasquel',
          role: 'SUPER_ADMIN',
          isOwner: false,
          isSuperAdmin: true,
          isGlobalPastor: true,
          sede: 'TODAS',
          passwordReq: 'said1234'
        },
        'scarrasquel@restauracionglobal.org': {
          id: 1,
          username: 'scarrasquel',
          full_name: 'Pastor Said Carrasquel (Pastor Global / Super Admin)',
          name: 'Pastor Said Carrasquel',
          role: 'SUPER_ADMIN',
          isOwner: false,
          isSuperAdmin: true,
          isGlobalPastor: true,
          sede: 'TODAS',
          passwordReq: 'said1234'
        },
        'scarrasquel@restauracion.org': {
          id: 1,
          username: 'scarrasquel',
          full_name: 'Pastor Said Carrasquel (Pastor Global / Super Admin)',
          name: 'Pastor Said Carrasquel',
          role: 'SUPER_ADMIN',
          isOwner: false,
          isSuperAdmin: true,
          isGlobalPastor: true,
          sede: 'TODAS',
          passwordReq: 'said1234'
        },

        // Alias admin
        'admin': {
          id: 200,
          username: 'scarrasquel',
          full_name: 'Pastor Said Carrasquel (Pastor Global / Super Admin)',
          name: 'Pastor Said Carrasquel',
          role: 'SUPER_ADMIN',
          isOwner: false,
          isSuperAdmin: true,
          sede: 'TODAS',
          passwordReq: 'said1234'
        },
        'admin@iglesia.org': {
          id: 200,
          username: 'scarrasquel',
          full_name: 'Pastor Said Carrasquel (Pastor Global / Super Admin)',
          name: 'Pastor Said Carrasquel',
          role: 'SUPER_ADMIN',
          isOwner: false,
          isSuperAdmin: true,
          sede: 'TODAS',
          passwordReq: 'said1234'
        },

        // 3. SEDE ADMINS
        'admin_maracay': {
          id: 11,
          username: 'admin_maracay',
          full_name: 'Pastor Wilmer (Admin Sede Maracay)',
          name: 'Pastor Wilmer',
          role: 'ADMIN_SEDE',
          sede: 'maracay',
          passwordReq: '123'
        },
        'admin_plazavzla': {
          id: 10,
          username: 'admin_plazavzla',
          full_name: 'Alexander López (Admin Plaza Venezuela)',
          name: 'Alexander López',
          role: 'ADMIN_SEDE',
          sede: 'plaza-venezuela',
          passwordReq: '123'
        },
        'admin_lasuiza': {
          id: 12,
          username: 'admin_lasuiza',
          full_name: 'Pastor Moisés Gómez (Admin Sede La Suiza)',
          name: 'Pastor Moisés',
          role: 'ADMIN_SEDE',
          sede: 'la-suiza',
          passwordReq: '123'
        },
        'admin_sucre': {
          id: 13,
          username: 'admin_sucre',
          full_name: 'Pastor Ezequiel Carrasquel (Admin Sede Sucre)',
          name: 'Pastor Ezequiel',
          role: 'ADMIN_SEDE',
          sede: 'sucre',
          passwordReq: '123'
        },
        'admin_maracaibo': {
          id: 14,
          username: 'admin_maracaibo',
          full_name: 'Pastor Daniel Osorio (Admin Sede Maracaibo)',
          name: 'Pastor Daniel',
          role: 'ADMIN_SEDE',
          sede: 'maracaibo',
          passwordReq: '123'
        },

        // 4. LÍDER & MIEMBRO
        'lider': {
          id: 2,
          username: 'lider',
          full_name: 'Líder de Jóvenes (Líder)',
          name: 'Líder de Jóvenes',
          role: 'LIDER',
          sede: 'plaza-venezuela',
          passwordReq: '123'
        },
        'lider@iglesia.org': {
          id: 2,
          username: 'lider',
          full_name: 'Líder de Jóvenes (Líder)',
          name: 'Líder de Jóvenes',
          role: 'LIDER',
          sede: 'plaza-venezuela',
          passwordReq: '123'
        },
        'miembro': {
          id: 3,
          username: 'miembro',
          full_name: 'Carlos Martínez (Miembro)',
          name: 'Carlos Martínez',
          role: 'MIEMBRO',
          sede: 'maracay',
          passwordReq: '123'
        },
        'miembro@iglesia.org': {
          id: 3,
          username: 'miembro',
          full_name: 'Carlos Martínez (Miembro)',
          name: 'Carlos Martínez',
          role: 'MIEMBRO',
          sede: 'maracay',
          passwordReq: '123'
        }
      };

      const matchedUser = defaultUsers[normalizedKey];

      if (matchedUser) {
        // Validate password
        const expected = matchedUser.passwordReq;
        const isValidPass =
          password === expected ||
          (expected === 'said1234' && (password === 'said1234' || password === 'admin' || password === '123456')) ||
          (expected === 'admin' && (password === 'said1234' || password === '123456' || password === 'admin')) ||
          (expected === '123' && (password === '123' || password === '123456')) ||
          (matchedUser.isOwner && password === 'aa11..**');

        if (isValidPass) {
          const userSede = (matchedUser.role === 'SUPER_ADMIN' || matchedUser.role === 'ADMIN_PRINCIPAL')
            ? 'TODAS'
            : (matchedUser.sede || selectedSede || 'plaza-venezuela');

          const mockUser = {
            ...matchedUser,
            email: normalizedKey.includes('@') ? normalizedKey : `${normalizedKey}@restauracionglobal.org`,
            sede: userSede
          };
          const mockToken = `mock-token-${matchedUser.username}-${Date.now()}`;
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('currentSede', userSede);

          setToken(mockToken);
          setUser(mockUser);
          setRoleState(mockUser.role);
          setCurrentSedeState(userSede);
          return { success: true, user: mockUser };
        }
      }

      return { success: false, error: 'Credenciales incorrectas. Verifica tu usuario y contraseña.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentSede');
    setToken(null);
    setUser(null);
    setRoleState('MIEMBRO');
    setCurrentSedeState('TODAS');
  };

  const switchRole = (newRole) => {
    setRoleState(newRole);
    if (user) {
      const isGlobal = newRole === 'SUPER_ADMIN' || newRole === 'ADMIN_PRINCIPAL' || newRole === 'ADMIN';
      const userSede = isGlobal ? 'TODAS' : (user.sede && user.sede !== 'TODAS' ? user.sede : 'plaza-venezuela');
      const updated = { ...user, role: newRole, sede: userSede };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setCurrentSede(userSede);
    }
  };

  const demoLogin = async (roleType, sede = 'maracay') => {
    const map = {
      SUPER_ADMIN: { email: 'linfante', password: 'aa11..**', sede: 'TODAS' },
      ADMIN_PRINCIPAL: { email: 'admin', password: 'admin', sede: 'TODAS' },
      ADMIN: { email: 'admin', password: 'admin', sede: 'TODAS' },
      ADMIN_SEDE: { email: 'admin_maracay', password: '123', sede: 'maracay' },
      LIDER: { email: 'lider', password: '123', sede: sede || 'plaza-venezuela' },
      MIEMBRO: { email: 'miembro', password: '123', sede: sede || 'maracay' }
    };
    const creds = map[roleType] || map.MIEMBRO;
    return await login(creds.email, creds.password, creds.sede);
  };

  // Helper to assign a Sede Admin
  const handleAssignAdmin = (sedeId, adminData) => {
    const updatedList = assignSedeAdmin(sedeId, {
      ...adminData,
      assignedBy: user?.name || "L. Infante / Pastor Principal"
    });
    return updatedList;
  };

  // Helper to get active sede details
  const getActiveSedeDetails = () => {
    if (currentSede === 'TODAS') {
      return {
        id: 'TODAS',
        name: 'Todas las Sedes (Nacional)',
        shortName: 'Todas las Sedes',
        type: 'Vista Global de Administración',
        badge: 'Global'
      };
    }
    const list = getSedesList();
    return list.find((s) => s.id === currentSede) || list[0];
  };

  const isSuperAdmin = currentRole === 'SUPER_ADMIN' || user?.username === 'linfante' || user?.username === 'scarrasquel';
  const isAdminPrincipal = isSuperAdmin || currentRole === 'ADMIN_PRINCIPAL' || currentRole === 'ADMIN';
  const isSedeAdmin = currentRole === 'ADMIN_SEDE';
  const canManageAllSedes = isSuperAdmin || isAdminPrincipal;
  const canCreateMembers = canManageAllSedes || isSedeAdmin;

  // Módulos permitidos para el usuario activo:
  // Superadmins y Admins de Sede siempre ven todos los módulos.
  // Los miembros ven únicamente los módulos asignados en su registro (user.allowed_modules).
  const allowedModules = (canManageAllSedes || isSedeAdmin)
    ? ALL_MODULE_KEYS
    : (Array.isArray(user?.allowed_modules) && user.allowed_modules.length > 0
        ? user.allowed_modules
        : DEFAULT_MEMBER_MODULES);

  const canViewModule = (keyOrPath) => {
    if (canManageAllSedes || isSedeAdmin) return true;
    const clean = (keyOrPath || '').replace(/^\//, '');
    const aliasMap = {
      miembros: 'members',
      discipulado: 'discipleship',
      frasco: 'emotions',
      nosotros: 'about'
    };
    const resolvedKey = aliasMap[clean] || clean;
    return allowedModules.includes(resolvedKey);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        currentRole,
        currentSede,
        setCurrentSede,
        activeSedeDetails: getActiveSedeDetails(),
        isAuthenticated: Boolean(user && token),
        isSuperAdmin,
        isAdminPrincipal,
        isSedeAdmin,
        canManageAllSedes,
        canCreateMembers,
        isAdmin: canManageAllSedes || isSedeAdmin,
        allowedModules,
        canViewModule,
        login,
        logout,
        demoLogin,
        setRole: switchRole,
        assignSedeAdmin: handleAssignAdmin,
        mustChangePassword,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
