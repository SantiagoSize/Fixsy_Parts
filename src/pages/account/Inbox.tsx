import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import { apiFetch, MESSAGES_API_BASE } from '../../utils/api';
import { CreateTicketMessagePayload, TicketMessage, TicketResponseDTO } from '../../types/ticket';

function isReceiptTicket(ticket: TicketResponseDTO) {
  const cat = (ticket.categoria || '').toLowerCase();
  const subject = (ticket.asunto || '').toLowerCase();
  return cat === 'boleta' || cat === 'compra' || subject.includes('boleta');
}

function TicketCard({ ticket, onSelect }: { ticket: TicketResponseDTO; onSelect: () => void }) {
  const isReceipt = isReceiptTicket(ticket);
  const updatedAt = ticket.updatedAt || ticket.createdAt;
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '12px',
        background: '#fff',
        textAlign: 'left',
        display: 'grid',
        gap: 6,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
        <strong>{ticket.asunto}</strong>
        <small>{updatedAt ? new Date(updatedAt).toLocaleString() : ''}</small>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="price__badge">{ticket.categoria}</span>
        <span className="price__badge" style={{ background: '#111827' }}>{ticket.estado}</span>
        {isReceipt && <span className="price__badge" style={{ background: '#e65100' }}>Boleta</span>}
      </div>
    </button>
  );
}

function TicketDetail({ ticket, currentUserId }: { ticket: TicketResponseDTO; currentUserId: string }) {
  const isReceipt = isReceiptTicket(ticket);
  const messages: TicketMessage[] = Array.isArray(ticket.mensajes) ? ticket.mensajes : [];

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff', display: 'grid', gap: 8 }}>
      <h2 style={{ margin: 0 }}>{ticket.asunto}</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="price__badge">{ticket.categoria}</span>
        <span className="price__badge" style={{ background: '#111827' }}>{ticket.estado}</span>
        <span className="price__badge">{ticket.prioridad}</span>
        {ticket.orderId && <span className="price__badge">Orden #{ticket.orderId}</span>}
      </div>
      <div style={{ color: '#4B5563', fontSize: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>Creado: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/D'}</span>
        {ticket.updatedAt && <span>Actualizado: {new Date(ticket.updatedAt).toLocaleString()}</span>}
      </div>
      {isReceipt && (
        <div style={{ marginTop: 4 }}>
          <strong>Resumen de compra:</strong>
          <pre style={{ background: '#F9FAFB', padding: 10, borderRadius: 8, overflowX: 'auto' }}>{ticket.resumenCompra || messages[0]?.contenido || 'Detalle no disponible'}</pre>
        </div>
      )}
      {messages.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          {messages.map((m) => {
            const mine = m.senderId && String(m.senderId) === String(currentUserId);
            return (
              <div
                key={m.id}
                style={{
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: 8,
                  background: mine ? '#F3F4F6' : '#FFFFFF',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{m.senderName} ({m.senderEmail})</strong>
                  <small>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</small>
                </div>
                <p style={{ margin: '6px 0', whiteSpace: 'pre-wrap' }}>{m.contenido}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Inbox() {
  const { user } = useAuth();
  const [tickets, setTickets] = React.useState<TicketResponseDTO[]>([]);
  const [selected, setSelected] = React.useState<TicketResponseDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [messageBody, setMessageBody] = React.useState('');

  const loadTickets = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TicketResponseDTO[]>(MESSAGES_API_BASE, `/api/tickets/user/${user.id}`);
      setTickets(data);
      setSelected(prev => {
        if (prev) {
          const match = data.find(t => String(t.id) === String(prev.id));
          if (match) return match;
        }
        return data.find(t => isReceiptTicket(t)) || data[0] || null;
      });
    } catch (err: any) {
      setError(err?.message || 'No pudimos cargar tus tickets.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const loadDetail = async (ticketId: string | number) => {
    if (!user?.id) return;
    try {
      const detail = await apiFetch<TicketResponseDTO>(MESSAGES_API_BASE, `/api/tickets/${ticketId}?userId=${user.id}`);
      setSelected(detail);
      setTickets(prev => prev.map(t => (String(t.id) === String(ticketId) ? detail : t)));
    } catch (err: any) {
      setError(err?.message || 'No pudimos cargar el detalle del ticket.');
    }
  };

  const onSendMessage = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!user?.id || !selected) return;
    const trimmed = messageBody.trim();
    if (!trimmed) return;
    const payload: CreateTicketMessagePayload = {
      ticketId: selected.id,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.nombre} ${user.apellido}`.trim(),
      contenido: trimmed,
    };
    setSending(true);
    setError(null);
    try {
      await apiFetch(MESSAGES_API_BASE, `/api/tickets/${selected.id}/messages`, {
        method: 'POST',
        json: payload,
      });
      setMessageBody('');
      await loadDetail(selected.id);
    } catch (err: any) {
      setError(err?.message || 'No pudimos enviar tu mensaje.');
    } finally {
      setSending(false);
    }
  };

  if (!user) return <div style={{ padding: '1rem' }}>Debes iniciar sesion.</div>;

  return (
    <div style={{ maxWidth: 1080, margin: '1rem auto', padding: '0 1rem', display: 'grid', gap: 16 }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Bandeja de mensajes</h1>
      {loading && <div className="cat__empty">Cargando tickets...</div>}
      {error && <Alert type="error" message={error} />}
      {!loading && tickets.length === 0 && !error && <Alert type="success" message="No tienes mensajes en tu bandeja." />}
      {tickets.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(260px, 1fr)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            {tickets.map(t => (
              <TicketCard
                key={t.id}
                ticket={t}
                onSelect={() => loadDetail(t.id)}
              />
            ))}
          </div>
          {selected && (
            <div style={{ display: 'grid', gap: 12 }}>
              <TicketDetail ticket={selected} currentUserId={String(user.id)} />
              <form onSubmit={onSendMessage} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 12, background: '#fff', display: 'grid', gap: 8 }}>
                <label htmlFor="reply" style={{ fontWeight: 600 }}>Responder</label>
                <textarea
                  id="reply"
                  value={messageBody}
                  onChange={e => setMessageBody(e.target.value)}
                  rows={4}
                  placeholder="Escribe tu mensaje..."
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: 10, resize: 'vertical' }}
                  disabled={sending}
                />
                <button type="submit" className="btn-save" disabled={sending || !messageBody.trim()}>
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
