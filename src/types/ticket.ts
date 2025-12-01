export type TicketCategory = 'Consulta' | 'Reclamo' | 'Devolucion' | 'Problema Tecnico' | 'Compra' | 'Boleta' | 'Otro' | string;
export type TicketStatus = 'Abierto' | 'En Proceso' | 'Resuelto' | 'Cerrado' | string;
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente' | string;

export type TicketMessage = {
  id: string | number;
  ticketId: string | number;
  senderId?: string | null;
  senderEmail: string;
  senderName: string;
  senderRole?: string;
  contenido: string;
  adjuntos?: string[];
  isRead?: boolean;
  createdAt?: string;
};

export type TicketResponseDTO = {
  id: string | number;
  userId?: string | null;
  userEmail: string;
  userName: string;
  asunto: string;
  categoria: TicketCategory;
  estado: TicketStatus;
  prioridad: TicketPriority;
  assignedTo?: string;
  assignedName?: string;
  orderId?: string | number;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  mensajes?: TicketMessage[];
  resumenCompra?: string;
};

export type CreateTicketPayload = {
  userId?: string | null;
  userEmail: string;
  userName: string;
  asunto: string;
  categoria: TicketCategory;
  prioridad?: TicketPriority;
  orderId?: string | number;
  mensajeInicial: string;
};

export type CreateTicketMessagePayload = {
  ticketId?: string | number;
  userId?: string | number | null;
  userEmail?: string;
  userName?: string;
  contenido: string;
};
