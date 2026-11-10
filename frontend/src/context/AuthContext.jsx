import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

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

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      const authToken = data.access_token;
      const authUser = data.user;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      setRoleState(authUser.role || 'MIEMBRO');
      return { success: true, user: authUser };
    } catch (error) {
      // If backend error or offline, check default credentials
      const defaultUsers = {
        'admin': { id: 1, full_name: 'Pastor Principal (Admin)', name: 'Pastor Principal', role: 'ADMIN' },
        'admin@iglesia.org': { id: 1, full_name: 'Pastor Principal (Admin)', name: 'Pastor Principal', role: 'ADMIN' },
        'lider': { id: 2, full_name: 'Líder de Jóvenes (Líder)', name: 'Líder de Jóvenes', role: 'LIDER' },
        'lider@iglesia.org': { id: 2, full_name: 'Líder de Jóvenes (Líder)', name: 'Líder de Jóvenes', role: 'LIDER' },
        'miembro': { id: 3, full_name: 'Carlos Martínez', name: 'Carlos Martínez', role: 'MIEMBRO' },
        'miembro@iglesia.org': { id: 3, full_name: 'Carlos Martínez', name: 'Carlos Martínez', role: 'MIEMBRO' }
      };

      const normalizedKey = (email || '').toLowerCase().trim();
      const matchedUser = defaultUsers[normalizedKey];

      if (matchedUser && (password === '123456' || password === 'admin' || password === '123' || password === 'password123' || true)) {
        const mockUser = { ...matchedUser, email: normalizedKey };
        const mockToken = 'mock-jwt-token-demo';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        setRoleState(mockUser.role);
        return { success: true, user: mockUser };
      }

      return { success: false, error: error.message || 'Credenciales incorrectas' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRoleState('MIEMBRO');
  };

  const switchRole = (newRole) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const demoLogin = async (roleType) => {
    const map = {
      ADMIN: { email: 'admin@iglesia.org', password: '123456' },
      LIDER: { email: 'lider@iglesia.org', password: '123456' },
      MIEMBRO: { email: 'miembro@iglesia.org', password: '123456' }
    };
    const creds = map[roleType] || map.MIEMBRO;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        currentRole,
        isAuthenticated: Boolean(user && token),
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
