import React from "react";
import { useAuth } from "../../context/AuthContext";
import { STORAGE_KEYS } from "../../utils/storageKeys";
import Alert from "../../components/Alert";

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

const responsiveStyles = `
.tickets-wrap { display: grid; gap: 12px; }
.tickets-table { width: 100%; border-collapse: collapse; }
.tickets-table th { background: #F7F7FA; text-align: left; padding: 12px 14px; border-bottom: 1px solid #E5E7EB; }
.tickets-table td { padding: 12px 14px; border-bottom: 1px solid #F1F5F9; }
.tickets-table tbody tr:hover { background: #FAFAFF; }
.tickets-scroll { overflow-x: auto; }
@media (max-width: 768px) {
  .tickets-scroll { overflow-x: auto; }
  .tickets-actions { flex-direction: column; align-items: flex-start; }
}
`;

const TICKETS_PREFIX = STORAGE_KEYS.ticketsPrefix;

function loadTicketsFor(email: string): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_PREFIX + email.toLowerCase());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as Ticket[] : [];
  } catch { return []; }
}

function saveTicketsFor(email: string, list: Ticket[]) {
  try { localStorage.setItem(TICKETS_PREFIX + email.toLowerCase(), JSON.stringify(list)); } catch {}
}

export default function Tickets() {
  const { user } = useAuth();
  const email = (user?.email || '').toLowerCase();
  const isSupport = user?.role === 'Soporte';

  const [allTickets, setAllTickets] = React.useState<Ticket[]>([]);
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState<Ticket | null>(null);
  const [reply, setReply] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    try {
      if (!isSupport) {
        setAllTickets(loadTicketsFor(email));
        setError(null);
        return;
      }
      const list: Ticket[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (key.startsWith(TICKETS_PREFIX)) {
          const chunk = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(chunk)) list.push(...chunk);
        }
      }
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setAllTickets(list);
      setError(null);
    } catch {
      setError('No se pudieron cargar los tickets.');
    } finally {
      setLoading(false);
    }
  }, [email, isSupport]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return allTickets;
    return allTickets.filter(t =>
      (t.subject || '').toLowerCase().includes(q) ||
      (t.ownerEmail || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q)
    );
  }, [allTickets, query]);

  const setStatus = (t: Ticket, status: TicketStatus) => {
    const owner = t.ownerEmail.toLowerCase();
    const list = loadTicketsFor(owner).map(x => x.id === t.id ? { ...x, status } : x);
    saveTicketsFor(owner, list);
    setToast(`Ticket ${status.toLowerCase()}.`);
    setTimeout(() => setToast(''), 2500);
    setView(v => v && v.id === t.id ? { ...v, status } : v);
    load();
  };

  const sendReply = (t: Ticket) => {
    if (!reply.trim()) return;
    const msg: TicketMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      from: email,
      to: t.ownerEmail,
      body: reply,
      date: new Date().toISOString(),
    };
    const owner = t.ownerEmail.toLowerCase();
    const list = loadTicketsFor(owner).map(x => x.id === t.id ? { ...x, messages: [...(x.messages||[]), msg] } : x);
    saveTicketsFor(owner, list);
    setReply('');
    setToast('Respuesta enviada.');
    setTimeout(() => setToast(''), 2500);
    setView(v => v && v.id === t.id ? { ...v, messages: [...(v.messages||[]), msg] } : v);
  };

  return (
    <div className="user-panel tickets-wrap">
      <style>{responsiveStyles}</style>
      <h2 style={{ marginTop: 0 }}>Tickets</h2>
      <input className="search-bar" placeholder="Buscar por ID, asunto o email" value={query} onChange={e=>setQuery(e.target.value)} />

      {loading && <div className="user-table-wrap"><div style={{ padding: 12 }}>Cargando tickets...</div></div>}
      {error && <Alert type="error" message={error} />}

      {!loading && !error && (
        <div className="user-table-wrap tickets-scroll">
          <table className="user-table tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Correo</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px 0' }}>No hay tickets.</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace' }}>{t.id}</td>
                  <td>{t.ownerEmail}</td>
                  <td>{t.subject}</td>
                  <td><span className={`status ${t.status.toLowerCase()}`}>{t.status}</span></td>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn-view" onClick={() => setView(t)}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view && (
        <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={() => setView(null)}>
          <div className="user-modal" onClick={e=>e.stopPropagation()}>
            <button className="user-modal__close" onClick={() => setView(null)} aria-label="Cerrar">×</button>
            <h3 style={{ marginTop: 0 }}>Ticket {view.id}</h3>
            <p style={{ margin: 0 }}><b>Correo:</b> {view.ownerEmail}</p>
            <p style={{ margin: 0 }}><b>Asunto:</b> {view.subject}</p>
            <p><b>Estado:</b> {view.status}</p>
            <div className="tickets-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setStatus(view, 'Abierto')}>Marcar Abierto</button>
              <button onClick={() => setStatus(view, 'En progreso')}>En progreso</button>
              <button onClick={() => setStatus(view, 'Cerrado')}>Cerrar</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <h4>Mensajes</h4>
              {view.messages?.length ? (
                <ul>
                  {view.messages.map(m => (
                    <li key={m.id}>
                      <b>{m.from}</b> → {m.to} — <i>{new Date(m.date).toLocaleString()}</i>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                    </li>
                  ))}
                </ul>
              ) : <p>Sin mensajes.</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <input className="search-bar" placeholder="Escribe una respuesta" value={reply} onChange={e=>setReply(e.target.value)} />
                <button onClick={() => sendReply(view)}>Responder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (<div className="user-toast" role="status" aria-live="polite">{toast}</div>)}
    </div>
  );
}
