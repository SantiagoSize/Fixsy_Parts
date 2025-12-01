export type Role = 'Usuario' | 'Admin' | 'Soporte';

export type SessionUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  profilePic?: string;
  token?: string;
};

export type RegisterPayload = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthSessionResponse = {
  user?: unknown;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};

export type UserProfileResponse = {
  id?: string | number;
  userId?: string | number;
  uid?: string | number;
  nombre?: string;
  apellido?: string;
  email?: string;
  role?: Role | string;
  rol?: Role | string;
  authority?: Role | string;
  profilePic?: string;
  avatarUrl?: string;
  avatar?: string;
  telefono?: string;
  telefonoFijo?: string;
  phone?: string;
  landline?: string;
};
