import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getAuthToken, removeAuthToken } from '../lib/api';

interface User {
  id: number | string;
  email: string;
  role: string;
  canonical_role: string;
  full_name?: string;
  mobile?: string;
  is_hod?: boolean;
  hod_department_id?: number | string;
  hod_department_code?: string;
  last_login_at?: string | null;
  faculty?: any;
  student?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        removeAuthToken();
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // ignore
    } finally {
      removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      window.location.hash = '#Faculty/Login';
      window.location.reload();
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
