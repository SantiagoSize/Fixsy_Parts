import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import Alert from '../../components/Alert';

export default function ComposeMessage() {
  const { user } = useAuth();
  const { send } = useMessages();
  const [to, setTo] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!user) return <div style={{ padding: '1rem' }}>Debes iniciar sesión.</div>;
  if (user.role !== 'Soporte') return <div style={{ padding: '1rem' }}>No tienes permisos para enviar mensajes.</div>;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null); setErr(null);
    if (!to || !/.+@.+\..+/.test(to)) { setErr('Email destino inválido'); return; }
    if (!msg.trim()) { setErr('Escribe un mensaje'); return; }
    setLoading(true);
    send(to, msg.trim());
    setOk('Mensaje enviado');
    setTo(''); setMsg('');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 640, margin: '1rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Enviar mensaje</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <div>
          <label>Para (email)</label>
          <input className="form-input" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div>
          <label>Mensaje</label>
          <textarea className="form-input" value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ resize: 'vertical' }} />
        </div>
        {err && <Alert type="error" message={err} />}
        {ok && <Alert type="success" message={ok} />}
        <button className="btn-primary form-button" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
