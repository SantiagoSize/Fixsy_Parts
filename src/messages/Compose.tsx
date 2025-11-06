import React from 'react';
import useMessages from './useMessages';

type ComposeInitial = { to?: string; cc?: string[] | string; bcc?: string[] | string; subject?: string; body?: string };

export default function Compose({ onClose, initial }: { onClose: () => void; initial?: ComposeInitial }) {
  const { send } = useMessages();
  const [to, setTo] = React.useState(initial?.to || '');
  const [cc, setCc] = React.useState(
    Array.isArray(initial?.cc) ? initial?.cc?.join(', ') : (initial?.cc || '')
  );
  const [bcc, setBcc] = React.useState(
    Array.isArray(initial?.bcc) ? initial?.bcc?.join(', ') : (initial?.bcc || '')
  );
  const [subject, setSubject] = React.useState(initial?.subject || '');
  const [body, setBody] = React.useState(initial?.body || '');
  const [files, setFiles] = React.useState<string[]>([]);
  const [toast, setToast] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const onAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files || []).map(f => f.name);
    setFiles(prev => [...prev, ...names]);
    e.currentTarget.value = '';
  };

  const onSend = () => {
    if (!to.trim() || !subject.trim()) { setToast('⚠️ Completa Para y Asunto'); setTimeout(()=>setToast(''), 2500); return; }
    const email = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
    send({ sender: '', receiver: to.trim(), subject, body, cc: email(cc), bcc: email(bcc), attachments: files });
    setToast('✅ Mensaje enviado con éxito'); setTimeout(()=>setToast(''), 2500);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
      <div className="card" style={{ width: 'min(720px, 92vw)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Redactar mensaje</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          <input placeholder="Para" value={to} onChange={e=>setTo(e.target.value)} style={inp} />
          <input placeholder="CC (separar por coma)" value={cc} onChange={e=>setCc(e.target.value)} style={inp} />
          <input placeholder="CCO (separar por coma)" value={bcc} onChange={e=>setBcc(e.target.value)} style={inp} />
          <input placeholder="Asunto" value={subject} onChange={e=>setSubject(e.target.value)} style={inp} />
          <textarea placeholder="Mensaje" value={body} onChange={e=>setBody(e.target.value)} rows={8} style={{ ...inp, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" multiple onChange={onAttach} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={btn('#6B4DFF')}>Adjuntar</button>
            {files.map((f, i) => (
              <span key={i} style={{ background: '#EEF2FF', border: '1px solid #E5E7EB', color: '#111827', padding: '4px 8px', borderRadius: 999 }}>{f}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={btn('#9CA3AF')}>Cancelar</button>
            <button onClick={onSend} style={btn('#FF7A00')}>Enviar</button>
          </div>
        </div>
        {toast && <div style={{ marginTop: 8, color: '#10B981' }}>{toast}</div>}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', outline: 'none' };
const btn = (bg: string) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' } as React.CSSProperties);
