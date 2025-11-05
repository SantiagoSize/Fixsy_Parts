import React from 'react';

export type Role = 'User' | 'Admin' | 'Support';

export type AuthUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string; // demo/localStorage únicamente
  role: Role;
};

type AuthContextValue = {
  user: Omit<AuthUser, 'password'> | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Omit<AuthUser, 'id' | 'role'>) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = 'fixsy_users';
const SESSION_KEY = 'fixsy_current_user';

function loadUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as AuthUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): Omit<AuthUser, 'password'> | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Omit<AuthUser, 'password'>) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Omit<AuthUser, 'password'> | null>(loadSession());

  const login = React.useCallback(async (email: string, password: string) => {
    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      const sessionUser: Omit<AuthUser, 'password'> = {
        id: found.id,
        nombre: found.nombre,
        apellido: found.apellido,
        email: found.email,
        role: found.role,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return true;
    }
    return false;
  }, []);

  const register = React.useCallback(async (newUser: Omit<AuthUser, 'id' | 'role'>) => {
    const users = loadUsers();
    const exists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) return { ok: false, error: 'El email ya está registrado' };
    const emailLower = newUser.email.toLowerCase();
    const role: Role = emailLower.includes('admin') ? 'Admin' : emailLower.includes('support') ? 'Support' : 'User';
    const userToSave: AuthUser = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      password: newUser.password,
      role,
    };
    users.push(userToSave);
    saveUsers(users);
    return { ok: true };
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
