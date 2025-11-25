export type Role = 'Usuario' | 'Admin' | 'Soporte';

export type SessionUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  profilePic?: string;
};
