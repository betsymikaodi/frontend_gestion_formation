import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ROUTES, setAuthToken } from '@/config/api';
import { AuthService } from '@/services/auth.service';

export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createAccount: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pas de persistance localStorage: session en mémoire uniquement
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await AuthService.login(email, password);
      const token: string | undefined = data?.token;
      if (!token) return false;
      setAuthToken(token);
      const roleRaw: string = data?.role || 'USER';
      const nomComplet: string = data?.nomComplet || email;
      const [firstName = nomComplet, lastName = ''] = nomComplet.split(' ');
      const loggedUser: User = {
        email,
        firstName,
        lastName,
        role: roleRaw.toLowerCase() == 'admin' ? 'admin' : 'user',
      };
      setUser(loggedUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  const createAccount = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    const payload = {
      email: userData.email,
      motDePasse: userData.password,
      prenom: userData.firstName || '',
      nom: userData.lastName || '',
      role: (userData.role || 'user').toUpperCase(),
    };
    try {
      const res = await AuthService.register(payload);
      return res.ok;
    } catch {
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    createAccount,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};