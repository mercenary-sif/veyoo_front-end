import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const BaseUrl = 'http://127.0.0.1:8000';

export const AuthProvide = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, read any stored token and sync axios default header so other modules (axios instances)
  // will immediately use the correct Authorization header.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const access = parsed?.access || parsed?.accessToken;
        if (access) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        }
        setIsAuthenticated(true);
      } catch (e) {
        // bad data -> ignore
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Clear any previous global header to avoid race conditions
      delete axios.defaults.headers.common['Authorization'];

      const response = await fetch(`${BaseUrl}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        return data.message;
      }

      // Support both shapes: data.tokens or data (depending on backend)
      const userData = data.tokens ?? data;

      // Persist exactly what the backend returned (keeps format consistent)
      localStorage.setItem('user', JSON.stringify(userData));

      // Immediately update axios global default so any in-memory axios instances
      // (or subsequent calls) will use the fresh token.
      const access = userData?.access || userData?.accessToken;
      if (access) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      }

      setIsAuthenticated(true);
      return data.message;
    } catch (err) {
      return 'Une erreur est survenue';
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasRole = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;

    try {
      const tokenObj = JSON.parse(storedUser);
      const access = tokenObj?.access || tokenObj?.accessToken;
      if (!access) return false;

      const payload = JSON.parse(atob(access.split('.')[1]));
      return payload?.role || false;
    } catch (error) {
      return false;
    }
  };

  const AuthTokens = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      const token = JSON.parse(storedUser);
      const access = token?.access || token?.accessToken;
      const refresh = token?.refresh || token?.refreshToken;
      if (!access) return null;
      return { accessToken: access, refreshToken: refresh };
    } catch (error) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ logout, login, isAuthenticated, hasRole, AuthTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
