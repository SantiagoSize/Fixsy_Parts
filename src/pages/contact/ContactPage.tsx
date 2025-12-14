import React from 'react';
import './ContactPage.css';
import { useMessages } from '../../context/MessagesContext';
import Alert from '../../components/Alert';
import { STORAGE_KEYS } from '../../utils/storageKeys';

function ContactPage(): React.ReactElement {
    const [sent, setSent] = React.useState<string | null>(null);
    const [form, setForm] = React.useState({ nombre: '', correo: '', asunto: '', mensaje: '' });
    const [files, setFiles] = React.useState<File[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const { send } = useMessages();

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSent(null);
        setLoading(true);
        try {
            if (!form.nombre || !form.correo || !form.asunto || !form.mensaje) {
                setError('Completa todos los campos');
                setLoading(false);
                return;
            }
            if (!/.+@.+\..+/.test(form.correo)) {
                setError('Correo inválido');
                setLoading(false);
                return;
            }
            const receiver = 'soporte@fixsy.com';
            send(receiver, `${form.nombre}\n\n${form.mensaje}`);
            const supportKey = STORAGE_KEYS.inboxPrefix + 'soporte@fixsy.com';
            const loadInbox = (email: string) => { try { const raw = localStorage.getItem(email); return raw ? JSON.parse(raw) : []; } catch { return []; } };
            const saveInbox = (key: string, list: any[]) => { try { localStorage.setItem(key, JSON.stringify(list)); } catch { } };
            const msg = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                from: form.correo.toLowerCase(),
                to: receiver,
                subject: form.asunto,
                message: `${form.nombre}\n\n${form.mensaje}`,
                date: new Date().toISOString(),
                read: false,
                important: false,
                archived: false,
                deleted: false,
                attachments: files.map(f => f.name),
            };
            const out = loadInbox(form.correo);
            out.unshift({ ...msg, id: `${msg.id}_s`, read: true });
            saveInbox(STORAGE_KEYS.inboxPrefix + form.correo.toLowerCase(), out);
            const ib = loadInbox(supportKey);
            ib.unshift(msg);
            saveInbox(supportKey, ib);
            const ticketKey = `${STORAGE_KEYS.ticketsPrefix}${form.correo.toLowerCase()}`;
            const prevT = JSON.parse(localStorage.getItem(ticketKey) || '[]');
            const t = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ownerEmail: form.correo.toLowerCase(), subject: form.asunto, status: 'Abierto', createdAt: new Date().toISOString(), messages: [{ id: `${Date.now()}_m`, from: form.correo.toLowerCase(), to: receiver, body: form.mensaje, date: new Date().toISOString() }] };
            localStorage.setItem(ticketKey, JSON.stringify([...(Array.isArray(prevT) ? prevT : []), t]));
            setForm({ nombre: '', correo: '', asunto: '', mensaje: '' });
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSent('Mensaje enviado al sistema de soporte técnico (simulado).');
        } catch {
            setError('No se pudo enviar el mensaje. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const onClear = () => {
        setForm({ nombre: '', correo: '', asunto: '', mensaje: '' });
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSent(null);
        setError(null);
    };

    return (
        <section className="cp fade-in">
            <h1 className="cp__title">Soporte y Ayuda</h1>
            <p className="cp__subtitle">Estamos para ayudarte — contáctanos</p>
            <p className="cp__phone">Atención directa: +56 9 1234 5678</p>

            <form className="cp__form" onSubmit={onSubmit}>
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
                    <input id="nombre" name="nombre" className="form-input" value={form.nombre} onChange={onChange} required />
                </div>
                <div className="cp__row">
                    <label htmlFor="correo">Mi correo</label>
                    <input id="correo" name="correo" className="form-input" type="email" value={form.correo} onChange={onChange} required />
                </div>
                <div className="cp__row">
                    <label htmlFor="asunto">Asunto</label>
                    <input id="asunto" name="asunto" className="form-input" value={form.asunto} onChange={onChange} required />
                </div>
                <div className="cp__row">
                    <label htmlFor="mensaje">Mensaje</label>
                    <textarea id="mensaje" name="mensaje" className="form-input" rows={5} value={form.mensaje} onChange={onChange} required />
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
                    <button type="submit" className="cp__send form-button" disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
                </div>
                {files.length > 0 && (
                    <div className="cp__sent" role="status">
                        Archivos seleccionados: {files.map(f => f.name).join(', ')}
                    </div>
                )}
                {error && <Alert type="error" message={error} />}
                {sent && <Alert type="success" message={sent} />}
            </form>
        </section>
    );
}

export default ContactPage;
