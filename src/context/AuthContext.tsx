import React from 'react';
import { AuthSessionResponse, LoginPayload, RegisterPayload, Role, SessionUser, UserProfileResponse } from '../types/auth';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { ApiResult, USERS_API_BASE, apiFetch } from '../utils/api';

type LoginResult = { ok: boolean; status?: number; error?: string };
type RegisterResult = { ok: boolean; status?: number; error?: string };

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (user: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
  refreshUser: () => Promise<SessionUser | null>;
  setSessionUser: (user: SessionUser) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEYS = [STORAGE_KEYS.currentUser, 'fixsy_auth_user'] as const;

function readSession(): SessionUser | null {
  for (const key of SESSION_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as SessionUser;
    } catch {}
  }
  return null;
}

function persistSession(value: SessionUser | null) {
  SESSION_KEYS.forEach(key => {
    try {
      if (value) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
    } catch {}
  });
}

function mapRole(value: any, roleId?: any): Role {
  const id = Number(roleId);
  if (id === 2) return 'Admin';
  if (id === 3) return 'Soporte';
  const v = String(value || '').toLowerCase();
  if (v.includes('admin')) return 'Admin';
  if (v.includes('soporte') || v.includes('support')) return 'Soporte';
  return 'Usuario';
}

function mapApiUser(raw: any): SessionUser {
  const source = raw?.user ?? raw;
  const idValue = source?.id ?? source?.userId ?? source?.uid;
  const token = source?.token ?? raw?.token ?? raw?.accessToken;
  const email = source?.email ?? '';
  const rawRole = source?.role ?? source?.rol ?? source?.authority ?? source?.roleName ?? source?.role?.name;
  const rawRoleId = source?.roleId ?? source?.role_id ?? source?.role?.id;
  const forcedRole = (() => {
    const lower = String(email).toLowerCase();
    if (lower === 'admin@admin.fixsy.com') return 'Admin';
    if (lower === 'soporte@soporte.fixsy.com') return 'Soporte';
    return null;
  })();
  return {
    id: idValue ? String(idValue) : '',
    nombre: source?.nombre ?? source?.firstName ?? '',
    apellido: source?.apellido ?? source?.lastName ?? '',
    email,
    role: forcedRole ? (forcedRole as Role) : mapRole(rawRole, rawRoleId),
    profilePic: source?.profilePic || source?.avatarUrl || source?.avatar || undefined,
    token,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(readSession());

  const setSessionUser = React.useCallback((next: SessionUser) => {
    persistSession(next);
    setUser(next);
  }, []);

  const logout = React.useCallback(() => {
    persistSession(null);
    setUser(null);
  }, []);

  const safeApiCall = React.useCallback(
    <T,>(path: string, options?: RequestInit & { json?: unknown }) =>
      apiFetch<T>(USERS_API_BASE, path, { ...(options || {}), asResult: true }) as Promise<ApiResult<T>>,
    []
  );

  const login = React.useCallback(async (email: string, password: string) => {
    const payload: LoginPayload = { email: email.trim(), password };
    const result = await safeApiCall<AuthSessionResponse | UserProfileResponse>('/api/users/login', {
      method: 'POST',
      json: payload,
    });

    if (!result.ok) {
      const unauthorized = result.status === 401 || result.status === 403;
      const message = result.error || (unauthorized ? 'Credenciales invalidas' : 'No se pudo iniciar sesion');
      return { ok: false, status: result.status, error: message };
    }

    const sessionUser = mapApiUser(result.data);
    setSessionUser(sessionUser);
    return { ok: true, status: result.status };
  }, [safeApiCall, setSessionUser]);

  const register = React.useCallback(async (newUser: RegisterPayload) => {
    const phoneValue = newUser.phone ?? newUser.telefono ?? '';
    const payload = { ...newUser, email: newUser.email.trim(), phone: phoneValue, telefono: phoneValue };
    const result = await safeApiCall('/api/users/register', { method: 'POST', json: payload });

    if (!result.ok) {
      const generic = result.status === 400 ? 'Datos invalidos' : 'No se pudo completar el registro';
      return { ok: false, status: result.status, error: result.error || generic };
    }

    return { ok: true, status: result.status };
  }, [safeApiCall]);

  const refreshUser = React.useCallback(async () => {
    if (!user?.id) return null;
    const result = await safeApiCall<UserProfileResponse>(`/api/users/${user.id}`, { method: 'GET' });
    if (!result.ok) {
      if (result.status === 401 || result.status === 403) logout();
      return null;
    }
    const mapped = mapApiUser({ ...result.data, email: (result.data as any)?.email ?? user.email });
    setSessionUser(mapped);
    return mapped;
  }, [user?.id, user?.email, logout, setSessionUser, safeApiCall]);

  const value = React.useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    setSessionUser,
  }), [user, login, register, logout, refreshUser, setSessionUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
