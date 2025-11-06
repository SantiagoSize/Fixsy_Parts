type TicketStatus = 'Abierto' | 'En progreso' | 'Cerrado';

type TicketMessage = {
  id: string;
  from: string;
  to: string;
  body: string;
  date: string;
};

type Ticket = {
  id: string;
  ownerEmail: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessage[];
};

const TICKETS_PREFIX = 'fixsy_tickets_';

function seedFor(email: string, tickets: Ticket[]) {
  try {
    const key = TICKETS_PREFIX + email.toLowerCase();
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    if (Array.isArray(existing) && existing.length > 0) return; // ya existen
    localStorage.setItem(key, JSON.stringify(tickets));
  } catch {}
}

export function seedTicketsOnce() {
  try {
    const now = Date.now();
    const mk = (ownerEmail: string, idx: number): Ticket => ({
      id: `${now}_${idx}`,
      ownerEmail,
      subject: idx % 2 ? 'Problema con mi pedido' : 'Consulta sobre producto',
      status: (['Abierto','En progreso','Cerrado'] as TicketStatus[])[idx % 3],
      createdAt: new Date(now - idx * 3600_000).toISOString(),
      messages: [
        { id: `${now}_${idx}_m1`, from: ownerEmail, to: 'soporte@soporte.fixsy.com', body: 'Hola, necesito ayuda con mi compra.', date: new Date(now - idx * 3500_000).toISOString() },
        { id: `${now}_${idx}_m2`, from: 'soporte@soporte.fixsy.com', to: ownerEmail, body: '¡Hola! ¿Puedes compartir el ID del pedido?', date: new Date(now - idx * 3400_000).toISOString() },
      ],
    });

    const demoEmails = ['lucas.morales@gmail.com','valentina.rojas@gmail.com','diego.castro@gmail.com'];
    demoEmails.forEach((email, i) => {
      const pack: Ticket[] = [mk(email, i*3), mk(email, i*3+1)];
      seedFor(email, pack);
    });
  } catch {}
}

