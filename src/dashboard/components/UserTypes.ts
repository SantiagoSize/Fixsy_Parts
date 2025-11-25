import { Role } from "../../types/auth";

export type Status = "Activo" | "Bloqueado" | "Suspendido";

export type MgmtTicket = { id: string; asunto: string; estado: string; fecha: string };
export type MgmtCompra = { fecha: string; producto: string; monto: number };

export type MgmtUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  status: Status;
  foto?: string;
  suspensionHasta?: string;
  historialCompras?: MgmtCompra[];
  tickets?: MgmtTicket[];
};
