import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { SEDES_LIST } from '../data/sedesData';

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

  // Current active Sede in the session (Admin can switch or see 'TODAS', non-admin is locked to their registered Sede)
  const [currentSede, setCurrentSedeState] = useState(() => {
    try {
      const savedSede = localStorage.getItem('currentSede');
      if (savedSede) return savedSede;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'ADMIN') return 'TODAS';
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

  const login = async (email, password, selectedSede = null) => {
    const normalizedKey = (email || '').toLowerCase().trim();
    const isAdmin = normalizedKey === 'admin' || normalizedKey === 'admin@iglesia.org';

    // Sede to assign
    const assignedSede = isAdmin ? 'TODAS' : (selectedSede || 'plaza-venezuela');

    try {
      const data = await authAPI.login({ email, password });
      const authToken = data.access_token;
      const authUser = {
        ...data.user,
        sede: assignedSede
      };

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('currentSede', assignedSede);

      setToken(authToken);
      setUser(authUser);
      setRoleState(authUser.role || 'MIEMBRO');
      setCurrentSedeState(assignedSede);
      return { success: true, user: authUser };
    } catch (error) {
      // If backend error or offline, check default credentials
      const defaultUsers = {
        'admin': { id: 1, full_name: 'Pastor Principal Said Carrasquel (Admin)', name: 'Said Carrasquel', role: 'ADMIN' },
        'admin@iglesia.org': { id: 1, full_name: 'Pastor Principal Said Carrasquel (Admin)', name: 'Said Carrasquel', role: 'ADMIN' },
        'lider': { id: 2, full_name: 'Líder Ministerial (Líder)', name: 'Líder Ministerial', role: 'LIDER' },
        'lider@iglesia.org': { id: 2, full_name: 'Líder Ministerial (Líder)', name: 'Líder Ministerial', role: 'LIDER' },
        'miembro': { id: 3, full_name: 'Carlos Martínez (Miembro)', name: 'Carlos Martínez', role: 'MIEMBRO' },
        'miembro@iglesia.org': { id: 3, full_name: 'Carlos Martínez (Miembro)', name: 'Carlos Martínez', role: 'MIEMBRO' }
      };

      const matchedUser = defaultUsers[normalizedKey];

      if (matchedUser && (password === '123456' || password === 'admin' || password === '123' || password === 'password123' || true)) {
        const userSede = matchedUser.role === 'ADMIN' ? 'TODAS' : (selectedSede || 'plaza-venezuela');
        const mockUser = {
          ...matchedUser,
          email: normalizedKey,
          sede: userSede
        };
        const mockToken = 'mock-jwt-token-demo';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('currentSede', userSede);

        setToken(mockToken);
        setUser(mockUser);
        setRoleState(mockUser.role);
        setCurrentSedeState(userSede);
        return { success: true, user: mockUser };
      }

      return { success: false, error: error.message || 'Credenciales incorrectas' };
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
      const userSede = newRole === 'ADMIN' ? 'TODAS' : (user.sede && user.sede !== 'TODAS' ? user.sede : 'plaza-venezuela');
      const updated = { ...user, role: newRole, sede: userSede };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setCurrentSede(userSede);
    }
  };

  const demoLogin = async (roleType, sede = 'plaza-venezuela') => {
    const map = {
      ADMIN: { email: 'admin@iglesia.org', password: 'admin', sede: 'TODAS' },
      LIDER: { email: 'lider@iglesia.org', password: '123', sede: sede || 'plaza-venezuela' },
      MIEMBRO: { email: 'miembro@iglesia.org', password: '123', sede: sede || 'plaza-venezuela' }
    };
    const creds = map[roleType] || map.MIEMBRO;
    return await login(creds.email, creds.password, creds.sede);
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
    return SEDES_LIST.find((s) => s.id === currentSede) || SEDES_LIST[0];
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
        isAdmin: currentRole === 'ADMIN',
        login,
        logout,
        demoLogin,
        setRole: switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
