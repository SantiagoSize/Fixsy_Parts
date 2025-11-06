import React from "react";
import { useAuth } from "../../context/AuthContext";

type Message = {
  id: string;
  conversationId?: string;
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  message: string;
  date: string;
  read: boolean;
  important: boolean;
  archived: boolean;
  deleted: boolean;
  attachments?: string[];
  replies?: Message[];
};

const SUPPORT_TARGETS = ['soporte@fixsy.com','matias@soporte.fixsy.com'];

function inboxKey(email: string) { return `fixsy_inbox_${email.toLowerCase()}`; }
function loadInbox(email: string): Message[] {
  try { const raw = localStorage.getItem(inboxKey(email)); return raw ? JSON.parse(raw) as Message[] : []; } catch { return []; }
}
function saveInbox(email: string, list: Message[]) {
  try { localStorage.setItem(inboxKey(email), JSON.stringify(list)); } catch {}
}

// Tickets helpers
type TicketMsg = { id: string; from: string; to: string; body: string; date: string };
type Ticket = { id: string; ownerEmail: string; subject: string; status: 'Abierto'|'En progreso'|'Cerrado'; createdAt: string; messages: TicketMsg[] };
const TICKETS_PREFIX = 'fixsy_tickets_';
function loadTicketsFor(email: string): Ticket[] { try { const raw = localStorage.getItem(TICKETS_PREFIX + email.toLowerCase()); return raw ? JSON.parse(raw) as Ticket[] : []; } catch { return []; } }
function saveTicketsFor(email: string, list: Ticket[]) { try { localStorage.setItem(TICKETS_PREFIX + email.toLowerCase(), JSON.stringify(list)); } catch {} }

export default function Inbox() {
  const { user } = useAuth();
  const email = (user?.email || '').toLowerCase();

  const [items, setItems] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewing, setViewing] = React.useState<Message | null>(null);
  const [showCompose, setShowCompose] = React.useState(false);
  const [to, setTo] = React.useState('');
  const [cc, setCc] = React.useState('');
  const [bcc, setBcc] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [tab, setTab] = React.useState<'inbox'|'sent'|'important'|'archived'|'trash'>('inbox');
  const [query, setQuery] = React.useState('');
  const [toast, setToast] = React.useState('');

  const refresh = React.useCallback(() => {
    setItems(loadInbox(email).sort((a,b) => (b.date||'').localeCompare(a.date||'')));
  }, [email]);

  React.useEffect(() => { refresh(); setLoading(false); }, [refresh]);
  React.useEffect(() => { const t = setInterval(refresh, 10000); return () => clearInterval(t); }, [refresh]);

  const counters = React.useMemo(() => {
    const inbox = items.filter(m => !m.deleted && !m.archived && m.to.toLowerCase() === email);
    const sent = items.filter(m => !m.deleted && !m.archived && m.from.toLowerCase() === email);
    const important = items.filter(m => m.important && !m.archived && !m.deleted);
    const archived = items.filter(m => m.archived && !m.deleted);
    const trash = items.filter(m => m.deleted);
    const unread = inbox.filter(m => !m.read).length;
    return { inbox: inbox.length, sent: sent.length, important: important.length, archived: archived.length, trash: trash.length, unread };
  }, [items, email]);

  const visible = React.useMemo(() => {
    let base: Message[] = [];
    if (tab === 'inbox') base = items.filter(m => !m.deleted && !m.archived && m.to.toLowerCase() === email);
    else if (tab === 'sent') base = items.filter(m => !m.deleted && !m.archived && m.from.toLowerCase() === email);
    else if (tab === 'important') base = items.filter(m => m.important && !m.archived && !m.deleted);
    else if (tab === 'archived') base = items.filter(m => m.archived && !m.deleted);
    else base = items.filter(m => m.deleted);
    const q = query.toLowerCase();
    if (!q) return base;
    return base.filter(m => (m.subject||'').toLowerCase().includes(q) || (m.from||'').toLowerCase().includes(q));
  }, [tab, items, email, query]);

  const update = (id: string, patch: Partial<Message>) => {
    const next = loadInbox(email).map(m => m.id === id ? { ...m, ...patch } : m);
    saveInbox(email, next);
    setItems(next.sort((a,b) => (b.date||'').localeCompare(a.date||'')));
  };

  const emptyTrash = () => {
    const kept = loadInbox(email).filter(m => !m.deleted);
    saveInbox(email, kept);
    setItems(kept.sort((a,b) => (b.date||'').localeCompare(a.date||'')));
    setToast('Papelera vaciada');
    setTimeout(() => setToast(''), 2000);
  };
  const confirmEmptyTrash = () => {
    const ok = window.confirm('¿Vaciar la papelera? Esta acción no se puede deshacer.');
    if (ok) emptyTrash();
  };

  const onOpen = (m: Message) => { setViewing(m); if (!m.read) update(m.id, { read: true }); };

  const appendToInbox = (owner: string, msg: Message) => {
    const list = loadInbox(owner);
    list.unshift(msg);
    saveInbox(owner, list);
  };

  const maybeCreateTicket = (owner: string, subject: string, from: string, toAddr: string, text: string) => {
    const isSupportTarget = SUPPORT_TARGETS.includes(toAddr.toLowerCase()) || /soporte\.fixsy\.com$/i.test(toAddr);
    if (!isSupportTarget) return;
    const bucket = loadTicketsFor(owner);
    const t: Ticket = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      ownerEmail: owner,
      subject,
      status: 'Abierto',
      createdAt: new Date().toISOString(),
      messages: [{ id: `${Date.now()}m`, from, to: toAddr, body: text, date: new Date().toISOString() }]
    };
    bucket.unshift(t);
    saveTicketsFor(owner, bucket);
  };

  const send = () => {
    if (!to.trim() || !subject.trim()) return;
    const now = new Date().toISOString();
    const conversationId = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const ccList = cc.split(',').map(s=>s.trim()).filter(Boolean);
    const bccList = bcc.split(',').map(s=>s.trim()).filter(Boolean);
    const base: Message = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, conversationId, from: email, to: to.trim().toLowerCase(), cc: ccList, bcc: bccList, subject: subject.trim(), message: body, date: now, read: true, important: false, archived: false, deleted: false };

    // Agregar a enviados del remitente
    appendToInbox(email, base);

    // Entregar a destinatario principal
    const rx: Message = { ...base, id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, read: false };
    appendToInbox(base.to, rx);

    // Entregar a CC
    ccList.forEach(addr => { const msg = { ...base, id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, to: addr.toLowerCase(), read: false }; appendToInbox(addr, msg as Message); });
    // Entregar a BCC
    bccList.forEach(addr => { const msg = { ...base, id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, to: addr.toLowerCase(), read: false }; appendToInbox(addr, msg as Message); });

    // Crear ticket si corresponde (del lado del remitente/usuario)
    maybeCreateTicket(email, base.subject, base.from, base.to, base.message);

    setShowCompose(false); setTo(''); setCc(''); setBcc(''); setSubject(''); setBody('');
    setToast('Mensaje enviado correctamente.');
    setTimeout(() => setToast(''), 2500);
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando mensajes...</p>;

  return (
    <div className="inbox-container" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['inbox','sent','important','archived','trash'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 12px', borderRadius: 999, border: `1px solid ${tab===t ? '#6B4DFF' : '#E5E7EB'}`, background: tab===t ? '#EEF2FF' : '#FFFFFF', color: '#111827', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {t === 'inbox' ? 'Entrada' : t === 'sent' ? 'Enviados' : t === 'important' ? 'Importantes' : t === 'archived' ? 'Archivados' : 'Papelera'}
              <span style={{ background: '#1F2937', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>
                {t==='inbox'?counters.inbox:t==='sent'?counters.sent:t==='important'?counters.important:t==='archived'?counters.archived:counters.trash}
              </span>
              {t==='inbox' && counters.unread > 0 && (
                <span style={{ background: '#D32F2F', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>{counters.unread}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por asunto o remitente" style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #E5E7EB', outline: 'none', minWidth: 240 }} />
          <button onClick={() => setShowCompose(true)} style={{ background: '#FF7A00', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Enviar correo</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>No hay mensajes en esta sección</div>
      ) : visible.map(m => (
        <div key={m.id} className="msg-card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: m.read ? '#fff' : '#f3f3f3' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 10 }}>
            <button aria-label={m.important ? 'Quitar importante' : 'Marcar importante'} onClick={() => update(m.id, { important: !m.important })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: m.important ? '#f59e0b' : '#9ca3af', fontSize: 18 }}>★</button>
            <div style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpen(m)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ color: m.read ? '#374151' : '#111827' }}>{m.subject || '(sin asunto)'}</strong>
                <span style={{ color: '#6b7280' }}>{m.from}</span>
              </div>
              <div style={{ color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.date).toLocaleString()}</span>
              <button onClick={() => update(m.id, { archived: !m.archived })} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>{m.archived ? 'Desarchivar' : 'Archivar'}</button>
              <button onClick={() => update(m.id, { deleted: !m.deleted })} style={{ background: m.deleted ? '#3B82F6' : '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>{m.deleted ? 'Restaurar' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      ))}

      {tab === 'trash' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={confirmEmptyTrash} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Vaciar papelera</button>
        </div>
      )}

      {viewing && (
        <div role="dialog" aria-modal="true" className="user-modal-overlay" onClick={() => setViewing(null)}>
          <div className="user-modal" onClick={e=>e.stopPropagation()}>
            <button className="user-modal__close" onClick={() => setViewing(null)} aria-label="Cerrar">✖</button>
            <h3 style={{ marginTop: 0 }}>{viewing.subject}</h3>
            <div style={{ color: '#4b5563', marginTop: 8 }}>
              <div><strong>De:</strong> {viewing.from}</div>
              <div><strong>Para:</strong> {viewing.to}</div>
              {viewing.cc?.length ? (<div><strong>CC:</strong> {viewing.cc.join(', ')}</div>) : null}
              <div><strong>Fecha:</strong> {new Date(viewing.date).toLocaleString()}</div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{viewing.message}</div>
          </div>
        </div>
      )}

      {showCompose && (
        <div role="dialog" aria-modal="true" className="user-modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="user-modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Redactar mensaje</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <input placeholder="Para" value={to} onChange={e=>setTo(e.target.value)} className="search-bar" />
              <input placeholder="CC (separar con comas)" value={cc} onChange={e=>setCc(e.target.value)} className="search-bar" />
              <input placeholder="CCO (separar con comas)" value={bcc} onChange={e=>setBcc(e.target.value)} className="search-bar" />
              <input placeholder="Asunto" value={subject} onChange={e=>setSubject(e.target.value)} className="search-bar" />
              <textarea placeholder="Mensaje" value={body} onChange={e=>setBody(e.target.value)} rows={8} className="search-bar" style={{ resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCompose(false)} style={{ background: '#9CA3AF', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={send} style={{ background: '#FF7A00', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (<div className="user-toast" role="status" aria-live="polite">{toast}</div>)}
    </div>
  );
}
