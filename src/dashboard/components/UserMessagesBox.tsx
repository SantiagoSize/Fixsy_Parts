import React from "react";
import { STORAGE_KEYS } from "../../utils/storageKeys";

type Props = { email: string; onOpenConversation: (id: string) => void };

const inboxKeyFor = (email: string) => `${STORAGE_KEYS.inboxPrefix}${(email || '').toLowerCase()}`;

function loadInbox(email: string) {
  try { const raw = localStorage.getItem(inboxKeyFor(email)); return raw ? JSON.parse(raw) as any[] : []; } catch { return []; }
}

export function UserMessagesBox({ email, onOpenConversation }: Props) {
  const list = React.useMemo(() => (loadInbox(email) as any[]).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [email]);
  if (!list.length) return <p>Sin mensajes.</p>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {list.slice(0, 10).map((m: any) => (
        <div key={m.id} className="user-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div><b>Asunto:</b> {m.subject || '(sin asunto)'}</div>
            <div style={{ color: '#6b7280' }}><b>De:</b> {m.from}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ color: '#6b7280' }}>{new Date(m.date).toLocaleString()}</div>
            <button className="btn-view" onClick={() => onOpenConversation(m.id)}>Ver conversacion</button>
          </div>
        </div>
      ))}
    </div>
  );
}
