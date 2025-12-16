import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { USERS_API_BASE } from '../utils/api';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  role: string; // "Admin" | "Soporte" | "Usuario"
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  setSessionUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fixsy_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('fixsy_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await axios.post(`${USERS_API_BASE}/api/auth/login`, {
      email: email.toLowerCase().trim(),
      password
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al iniciar sesion');
    }

    const userData: User = {
      id: response.data.id,
      email: response.data.email,
      nombre: response.data.nombres,
      apellido: response.data.apellidos,
      telefono: response.data.telefono,
      role: response.data.role
    };

    setUser(userData);
    localStorage.setItem('fixsy_user', JSON.stringify(userData));
    return userData;
  };

  const setSessionUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('fixsy_user', JSON.stringify(updatedUser));
  };

  const register = async (data: any) => {
    // Map fields to Backend DTO
    const payload = {
      email: data.email.toLowerCase().trim(),
      nombres: data.nombre || data.nombres,
      apellidos: data.apellido || data.apellidos,
      contrasena: data.password || data.contrasena,
      telefono: data.telefono || data.phone
    };

    const response = await axios.post(`${USERS_API_BASE}/api/auth/register`, payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al registrar');
    }

    const userData: User = {
      id: response.data.id,
      email: response.data.email,
      nombre: response.data.nombres,
      apellido: response.data.apellidos,
      role: response.data.role
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fixsy_user');
  };

  // Implementacion simple de authenticatedFetch sin tokens
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const finalOptions = {
      ...options,
      credentials: 'include' as RequestCredentials // Para enviar cookies si el backend las usa
      // No agregamos Authorization header porque no usamos JWT
    };

    return fetch(url, finalOptions);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
      authenticatedFetch,
      setSessionUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
