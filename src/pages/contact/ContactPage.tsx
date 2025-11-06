import React from 'react';
import './ContactPage.css';
import useMessages from '../../messages/useMessages';

function ContactPage(): React.ReactElement {
  const [sent, setSent] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ nombre: '', correo: '', asunto: '', mensaje: '' });
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const { send } = useMessages();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const attachments = files.map(f => f.name);
      const receiver = 'soporte@fixsy.com';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _s = (send as any) && send({ sender: form.correo, receiver, subject: form.asunto, body: `${form.nombre}\n\n${form.mensaje}`, attachments });
    } catch {}
    // Simulación de envío al sistema interno de soporte (a implementar):
    // Guardamos el mensaje en localStorage como una "bandeja de entrada" local.
    try {
      const key = 'fixsy_support_messages';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const payload = {
        to: 'soporte@fixsy.com',
        nombre: form.nombre,
        correo: form.correo,
        asunto: form.asunto,
        mensaje: form.mensaje,
        archivos: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([...(Array.isArray(prev) ? prev : []), payload]));
    } catch (_) {
      // ignorar errores de almacenamiento local
    }
    // Broadcast a todos los soportes (bandejas por cuenta) y crear ticket
    try {
      const inboxKey = (email: string) => `fixsy_inbox_${email.toLowerCase()}`;
      const loadInbox = (email: string) => { try { const raw = localStorage.getItem(inboxKey(email)); return raw ? JSON.parse(raw) : []; } catch { return []; } };
      const saveInbox = (email: string, list: any[]) => { try { localStorage.setItem(inboxKey(email), JSON.stringify(list)); } catch {} };
      const msg = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        conversationId: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        from: (form.correo||'').toLowerCase(),
        to: 'soporte@fixsy.com',
        subject: form.asunto,
        message: `${form.nombre}\n\n${form.mensaje}`,
        date: new Date().toISOString(),
        read: false, important: false, archived: false, deleted: false,
        attachments: files.map(f=>f.name),
      } as any;
      // enviados del remitente
      const out = loadInbox(form.correo); out.unshift({ ...msg, id: `${msg.id}_s`, read: true }); saveInbox(form.correo, out);
      // broadcast a soportes
      const raw = localStorage.getItem('fixsy_users');
      const auth = raw ? JSON.parse(raw) : [];
      if (Array.isArray(auth)) {
        auth.filter((u:any)=>String(u.role)==='Soporte' && u.email)
            .forEach((u:any)=>{ const ib = loadInbox(u.email); ib.unshift({ ...msg, to: String(u.email).toLowerCase() }); saveInbox(u.email, ib); });
      }
      // crear ticket para el remitente
      const tkey = `fixsy_tickets_${(form.correo||'').toLowerCase()}`;
      const prevT = JSON.parse(localStorage.getItem(tkey) || '[]');
      const t = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, ownerEmail: (form.correo||'').toLowerCase(), subject: form.asunto, status: 'Abierto', createdAt: new Date().toISOString(), messages: [{ id: `${Date.now()}_m`, from: (form.correo||'').toLowerCase(), to: 'soporte@fixsy.com', body: form.mensaje, date: new Date().toISOString() }] };
      localStorage.setItem(tkey, JSON.stringify([...(Array.isArray(prevT)?prevT:[]), t]));
    } catch {}
    // Limpia formulario y archivos después de "enviar"
    setForm({ nombre: '', correo: '', asunto: '', mensaje: '' });
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSent('Mensaje enviado al sistema de soporte técnico (simulado) ✅');
  };

  const onClear = () => {
    setForm({ nombre: '', correo: '', asunto: '', mensaje: '' });
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSent(null);
  };

  return (
    <section className="cp fade-in">
      <h1 className="cp__title">Soporte y Ayuda</h1>
      <p className="cp__subtitle">Estamos para ayudarte — contáctanos</p>
      <p className="cp__phone">Atención directa: +56 9 1234 5678</p>

      <form className="cp__form" onSubmit={onSubmit}>
        {/* Input de archivos oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            setFiles(list);
          }}
        />
        <div className="cp__row">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" value={form.nombre} onChange={onChange} required />
        </div>
        <div className="cp__row">
          <label htmlFor="correo">Mi correo</label>
          <input id="correo" name="correo" type="email" value={form.correo} onChange={onChange} required />
        </div>
        <div className="cp__row">
          <label htmlFor="asunto">Asunto</label>
          <input id="asunto" name="asunto" value={form.asunto} onChange={onChange} required />
        </div>
        <div className="cp__row">
          <label htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" rows={5} value={form.mensaje} onChange={onChange} required />
        </div>
        <div className="cp__actions">
          <button
            type="button"
            className="cp__attach"
            onClick={() => fileInputRef.current?.click()}
          >
            Adjuntar archivo
          </button>
          <div className="cp__spacer" />
          <button type="button" className="cp__clear" onClick={onClear}>Borrar</button>
          <button type="submit" className="cp__send">Enviar</button>
        </div>
        {files.length > 0 && (
          <div className="cp__sent" role="status">
            Archivos seleccionados: {files.map(f => f.name).join(', ')}
          </div>
        )}
        {sent && <div className="cp__sent" role="status">{sent}</div>}
      </form>
    </section>
  );
}

export default ContactPage;
