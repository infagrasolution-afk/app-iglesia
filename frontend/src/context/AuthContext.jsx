import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos de inactividad

export function AuthProvider({ children }) {
  // Check if session was remembered explicitly via remember_me
  const isRemembered = localStorage.getItem('remember_me') === 'true';

  const [token, setToken] = useState(() => {
    if (isRemembered) {
      return localStorage.getItem('token') || '';
    }
    // If not explicitly remembered, clear temporary session on page reload/refresh
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return '';
  });

  const [user, setUser] = useState(() => {
    if (isRemembered) {
      const savedLocal = localStorage.getItem('user');
      if (savedLocal) return JSON.parse(savedLocal);
    }
    return null;
  });

  const [inactivityNotice, setInactivityNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inactivityTimerRef = useRef(null);

  const currentRole = user?.role || 'MIEMBRO';

  // Validate session when token changes
  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((userData) => {
          setUser(userData);
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(userData));
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch((err) => {
          console.warn('Session check failed or token invalid:', err);
        });
    }
  }, [token]);

  // Inactivity monitor
  useEffect(() => {
    if (!token) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const handleInactivityLogout = () => {
      logout();
      setInactivityNotice('Su sesión se ha cerrado automáticamente debido a 5 minutos de inactividad.');
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer(); // Start initial timer

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setInactivityNotice('');
    try {
      const data = await authAPI.login(email, password);
      setToken(data.access_token);
      setUser(data.user);

      if (rememberMe) {
        // Save in localStorage to persist across refreshes and browser restarts
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remembered_user', email);
        localStorage.setItem('remembered_password', password);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        // Save ONLY in sessionStorage so page reload / browser restart forces login
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_user');
        localStorage.removeItem('remembered_password');
      }

      return { success: true, user: data.user };
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    if (localStorage.getItem('remember_me') === 'true') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        inactivityNotice,
        setInactivityNotice,
        login,
        logout,
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
