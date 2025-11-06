import React from 'react';
import { AppMessage } from './MessagesContext';

export default function MessageView({ message, onClose, onReply, onForward }: { message: AppMessage | null; onClose: () => void; onReply?: (m: AppMessage) => void; onForward?: (m: AppMessage) => void }) {
  if (!message) return null;
  const m = message;
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 900, width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{m.subject}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {onReply && <button onClick={() => onReply(m)} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Responder</button>}
            {onForward && <button onClick={() => onForward(m)} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Reenviar</button>}
            <button onClick={onClose} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
        <div style={{ color: '#4b5563', marginBottom: 8 }}>
          <div><strong>De:</strong> {m.sender}</div>
          <div><strong>Para:</strong> {m.receiver}</div>
          {m.cc && m.cc.length > 0 && <div><strong>CC:</strong> {m.cc.join(', ')}</div>}
          {m.bcc && m.bcc.length > 0 && <div><strong>CCO:</strong> {m.bcc.join(', ')}</div>}
          <div><strong>Fecha:</strong> {new Date(m.timestamp).toLocaleString()}</div>
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
        {!!(m.attachments && m.attachments.length) && (
          <div style={{ marginTop: 12 }}>
            <strong>Adjuntos:</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {m.attachments!.map((a, i) => (
                <span key={i} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '4px 8px', borderRadius: 999 }}>{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
