import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages, AppMessage } from '../../context/MessagesContext';
import Alert from '../../components/Alert';

export default function Inbox() {
  const { user } = useAuth();
  const { messagesFor, markRead } = useMessages();

  if (!user) return <div style={{ padding: '1rem' }}>Debes iniciar sesión.</div>;

  const messages = messagesFor(user.email);

  return (
    <div style={{ maxWidth: 720, margin: '1rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Bandeja de mensajes</h1>
      {messages.length === 0 ? (
        <Alert type="success" message="No tienes mensajes en tu bandeja." />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {messages.map((m: AppMessage) => (
            <div key={m.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong>De: {m.sender}</strong>
                <small>{new Date(m.timestamp).toLocaleString()}</small>
              </div>
              <p style={{ margin: '8px 0' }}>{m.body}</p>
              {!m.read && (
                <button
                  type="button"
                  onClick={() => markRead(m.id)}
                  style={{ background: '#0064CD', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                >
                  Marcar como leído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
