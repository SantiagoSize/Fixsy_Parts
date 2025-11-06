import React from 'react';
import useMessages, { MailboxFilter } from './useMessages';
import MessageList from './MessageList';
import MessageView from './MessageView';
import Compose from './Compose';

export default function Inbox() {
  const { byFilter, unreadCount, markImportant, markRead, archive, remove, refresh } = useMessages();
  const [section, setSection] = React.useState<MailboxFilter>('inbox');
  const [open, setOpen] = React.useState<string | null>(null);
  const [showCompose, setShowCompose] = React.useState(false);

  const items = byFilter(section).sort((a,b)=> b.timestamp.localeCompare(a.timestamp));
  const current = items.find(m => m.id === open) || null;

  React.useEffect(() => {
    const t = setInterval(() => refresh(), 30000);
    return () => clearInterval(t);
  }, [refresh]);

  const counters = {
    inbox: byFilter('inbox').length,
    sent: byFilter('sent').length,
    important: byFilter('important').length,
    archived: byFilter('archived').length,
    trash: byFilter('trash').length,
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={tab(section==='inbox')} onClick={() => setSection('inbox')}>Entrada {unreadCount() ? <span style={pill('#D32F2F')}>{unreadCount()}</span> : null}</button>
          <button style={tab(section==='sent')} onClick={() => setSection('sent')}>Enviados <span style={pill()}>{counters.sent}</span></button>
          <button style={tab(section==='important')} onClick={() => setSection('important')}>Importantes <span style={pill()}>{counters.important}</span></button>
          <button style={tab(section==='archived')} onClick={() => setSection('archived')}>Archivados <span style={pill()}>{counters.archived}</span></button>
          <button style={tab(section==='trash')} onClick={() => setSection('trash')}>Papelera <span style={pill()}>{counters.trash}</span></button>
        </div>
        <button onClick={() => setShowCompose(true)} style={primaryBtn}>Redactar</button>
      </div>

      <MessageList
        items={items}
        onOpen={(m) => { setOpen(m.id); if (!m.read) markRead(m.id, true); }}
        onToggleStar={(m) => markImportant(m.id, !m.important)}
      />

      {!!open && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => archive(open!, true)} style={action('#10B981')}>Archivar</button>
          <button onClick={() => remove(open!)} style={action('#EF4444')}>Eliminar</button>
        </div>
      )}

      {current && <MessageView message={current} onClose={() => setOpen(null)} />}
      {showCompose && <Compose onClose={() => setShowCompose(false)} />}
    </div>
  );
}

const tab = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px', borderRadius: 999, border: `1px solid ${active ? '#6B4DFF' : '#E5E7EB'}`, background: active ? '#EEF2FF' : '#FFFFFF', color: '#111827', cursor: 'pointer'
});
const pill = (bg = '#1F2937'): React.CSSProperties => ({ background: bg, color: '#fff', borderRadius: 999, padding: '2px 6px', marginLeft: 6, fontSize: 12 });
const primaryBtn: React.CSSProperties = { background: '#6B4DFF', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' };
const action = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' });
