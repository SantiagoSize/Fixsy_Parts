import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';

export default function UserInboxPreview(): React.ReactElement | null {
  const { user } = useAuth();
  const { messages, forUser } = useMessages();
  const [list, setList] = React.useState(() => user ? forUser(user.email) : []);

  React.useEffect(() => {
    if (!user) return;
    setList(forUser(user.email));
  }, [messages, user, forUser]);

  if (!user) return null;

  return (
    <section className="mv" style={{ marginTop: 12 }}>
      <h2 className="mv__title">Tu Bandeja</h2>
      {list.length === 0 ? (
        <div className="mv__empty">Sin mensajes por ahora.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {list.slice(0, 4).map(m => (
            <article key={m.id} className="mv__card" style={{ padding: 8, display: 'grid', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#2C2A2B' }}>{m.from}</strong>
                <small style={{ color: '#6B7280' }}>{new Date(m.date).toLocaleString()}</small>
              </div>
              <div style={{ color: '#2C2A2B' }}>{m.message}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

