import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';

export default function Inbox() {
  const { user } = useAuth();
  const { forUser, markRead, send } = useMessages();
  if (!user) return <div style={{ padding: '1rem' }}>Debes iniciar sesión.</div>;
  const messages = forUser(user.email);
  const [body, setBody] = React.useState('');

  return (
    <div style={{ maxWidth: 720, margin: '1rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Bandeja de mensajes</h1>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', background: '#fff', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Contactar a Soporte</div>
        <div style={{ display: 'grid', gap: 8 }}>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Escribe tu mensaje para Soporte" style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { if (!body.trim()) return; send('soporte@soporte.fixsy.com', body.trim()); setBody(''); alert('Mensaje enviado a Soporte'); }} className="btn-primary">Enviar</button>
          </div>
        </div>
      </div>
      {messages.length === 0 ? (
        <p>No tienes mensajes.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {messages.map(m => (
            <div key={m.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>De: {m.from}</strong>
                <small>{new Date(m.date).toLocaleString()}</small>
              </div>
              <p style={{ margin: '8px 0' }}>{m.message}</p>
              {!m.read && (
                <button type="button" onClick={() => markRead(m.id)} style={{ background: '#0064CD', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Marcar como leído</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

