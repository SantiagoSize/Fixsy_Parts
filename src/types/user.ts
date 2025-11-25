import { Role } from './auth';

export type UserStatus = 'Activo' | 'Bloqueado' | 'Suspendido';

export type UserPurchaseItem = {
  id?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
};

export type UserPurchase = {
  idCompra: string;
  idUsuario: string;
  fecha: string;
  total?: number;
  items?: UserPurchaseItem[];
};

export type InboxMessage = {
  id: string;
  subject?: string;
  from: string;
  to: string;
  date: string;
  message?: string;
  replies?: InboxMessage[];
};

export type MgmtUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  status: UserStatus;
  foto?: string;
  suspensionHasta?: string;
  historialCompras?: UserPurchase[];
  tickets?: { id: string; asunto: string; estado: string; fecha: string }[];
};
