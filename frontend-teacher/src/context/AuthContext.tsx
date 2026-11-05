import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeacherUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: TeacherUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: TeacherUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TeacherUser | null>(() => {
    const saved = localStorage.getItem('teacher_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('teacher_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: TeacherUser) => {
    localStorage.setItem('teacher_token', newToken);
    localStorage.setItem('teacher_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('teacher_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('teacher_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

