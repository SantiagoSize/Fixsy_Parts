import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useMessages, AppMessage } from "../../context/MessagesContext";
import Alert from "../../components/Alert";

type MailboxFilter = 'inbox' | 'sent' | 'important' | 'archived' | 'trash';

const responsiveStyles = `
.inbox-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.inbox-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.inbox-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.inbox-search { padding: 8px 12px; border-radius: 999px; border: 1px solid #E5E7EB; outline: none; min-width: 240px; }
.inbox-msg { border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fff; overflow-x: auto; }
.inbox-msg__grid { display: grid; grid-template-columns: 24px 1fr auto; align-items: center; gap: 10px; }
@media (max-width: 768px) {
  .inbox-header { flex-direction: column; align-items: stretch; }
  .inbox-actions { width: 100%; }
  .inbox-search { width: 100%; min-width: auto; }
  .inbox-msg__grid { grid-template-columns: 1fr; }
}
`;

export default function Inbox() {
  const { user } = useAuth();
  const { messagesFor, unreadCount, markRead, send } = useMessages();
  const email = (user?.email || '').toLowerCase();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<MailboxFilter>('inbox');
  const [viewing, setViewing] = React.useState<AppMessage | null>(null);
  const [query, setQuery] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [compose, setCompose] = React.useState({ to: '', subject: '', body: '' });

  const inboxMessages = React.useMemo(() => {
    try {
      return messagesFor(email);
    } catch (e) {
      setError('No se pudieron cargar los mensajes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [messagesFor, email]);

  const filtered = React.useMemo(() => {
    const base = inboxMessages.filter(m => {
      if (tab === 'trash') return m.deleted;
      if (tab === 'archived') return m.archived && !m.deleted;
      if (tab === 'important') return m.important && !m.archived && !m.deleted;
      if (tab === 'sent') return (m.sender || '').toLowerCase() === email && !m.archived && !m.deleted;
      return (m.receiver || '').toLowerCase() === email && !m.archived && !m.deleted;
    });
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(m =>
      (m.subject || '').toLowerCase().includes(q) ||
      (m.sender || '').toLowerCase().includes(q) ||
      (m.body || '').toLowerCase().includes(q)
    );
  }, [tab, inboxMessages, email, query]);

  const onOpen = (m: AppMessage) => {
    setViewing(m);
    if (!m.read) markRead(m.id, true);
  };

  const onSend = () => {
    if (!compose.to.trim() || !compose.subject.trim()) {
      setToast('Completa Para y Asunto');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    send(compose.to.trim(), compose.body.trim() || compose.subject.trim());
    setToast('Mensaje enviado');
    setTimeout(() => setToast(''), 2000);
    setCompose({ to: '', subject: '', body: '' });
  };

  if (loading) return <div className="card" style={{ padding: 12 }}>Cargando mensajes...</div>;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="inbox-container" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff' }}>
      <style>{responsiveStyles}</style>

      <div className="inbox-header">
        <div className="inbox-tabs">
          {(['inbox','sent','important','archived','trash'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: `1px solid ${tab===t ? '#6B4DFF' : '#E5E7EB'}`,
                background: tab===t ? '#EEF2FF' : '#FFFFFF',
                color: '#111827',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {t === 'inbox' ? 'Entrada' : t === 'sent' ? 'Enviados' : t === 'important' ? 'Importantes' : t === 'archived' ? 'Archivados' : 'Papelera'}
              <span style={{ background: '#1F2937', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>
                {filteredCount(inboxMessages, t, email)}
              </span>
              {t==='inbox' && unreadCount(email) > 0 && (
                <span style={{ background: '#D32F2F', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>{unreadCount(email)}</span>
              )}
            </button>
          ))}
        </div>
        <div className="inbox-actions">
          <input value={query} onChange={e=>setQuery(e.target.value)} className="inbox-search" placeholder="Buscar por asunto o remitente" />
          <button onClick={onSend} style={{ background: '#FF7A00', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Enviar correo</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Alert type="success" message="No hay mensajes en esta sección" />
      ) : filtered.map(m => (
        <div key={m.id} className="msg-card inbox-msg">
          <div className="inbox-msg__grid">
            <div style={{ color: m.important ? '#f59e0b' : '#9ca3af', fontSize: 18 }}>✉</div>
            <div style={{ textAlign: 'left', cursor: 'pointer', minWidth: 0 }} onClick={() => onOpen(m)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ color: m.read ? '#374151' : '#111827' }}>{m.subject || '(sin asunto)'}</strong>
                <span style={{ color: '#6b7280' }}>{m.sender}</span>
              </div>
              <div style={{ color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.body}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.timestamp).toLocaleString()}</span>
              <button onClick={() => markRead(m.id, !m.read)} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>{m.read ? 'No leído' : 'Leído'}</button>
            </div>
          </div>
        </div>
      ))}

      {viewing && (
        <div role="dialog" aria-modal="true" className="user-modal-overlay" onClick={() => setViewing(null)}>
          <div className="user-modal" onClick={e=>e.stopPropagation()}>
            <button className="user-modal__close" onClick={() => setViewing(null)} aria-label="Cerrar">×</button>
            <h3 style={{ marginTop: 0 }}>{viewing.subject}</h3>
            <div style={{ color: '#4b5563', marginTop: 8 }}>
              <div><strong>De:</strong> {viewing.sender}</div>
              <div><strong>Para:</strong> {viewing.receiver}</div>
              {viewing.cc?.length ? (<div><strong>CC:</strong> {viewing.cc.join(', ')}</div>) : null}
              <div><strong>Fecha:</strong> {new Date(viewing.timestamp).toLocaleString()}</div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{viewing.body}</div>
          </div>
        </div>
      )}

      {toast && (<div className="user-toast" role="status" aria-live="polite">{toast}</div>)}
    </div>
  );
}

function filteredCount(list: AppMessage[], tab: MailboxFilter, email: string) {
  if (tab === 'trash') return list.filter(m => m.deleted).length;
  if (tab === 'archived') return list.filter(m => m.archived && !m.deleted).length;
  if (tab === 'important') return list.filter(m => m.important && !m.archived && !m.deleted).length;
  if (tab === 'sent') return list.filter(m => (m.sender || '').toLowerCase() === email && !m.archived && !m.deleted).length;
  return list.filter(m => (m.receiver || '').toLowerCase() === email && !m.archived && !m.deleted).length;
}
