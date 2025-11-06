import React from 'react';
import { AppMessage } from './MessagesContext';

export default function MessageList({ items, onOpen, onToggleStar }: { items: AppMessage[]; onOpen: (m: AppMessage) => void; onToggleStar: (m: AppMessage) => void; }) {
  return (
    <div>
      {items.map(m => (
        <button key={m.id} onClick={() => onOpen(m)} style={{ width: '100%', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span onClick={(e) => { e.stopPropagation(); onToggleStar(m); }} aria-label={m.important ? 'Quitar importante' : 'Marcar importante'} style={{ color: m.important ? '#f59e0b' : '#9ca3af' }}>★</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <strong style={{ color: m.read ? '#374151' : '#111827' }}>{m.subject || '(sin asunto)'}</strong>
              <span style={{ color: '#6b7280' }}>{m.sender}</span>
            </div>
            <div style={{ color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.body}</div>
          </div>
          <span style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.timestamp).toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

