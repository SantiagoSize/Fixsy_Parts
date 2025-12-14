import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessagesContext } from '../messages/MessagesContext'; // Contexto actualizado y nombre de hook corregido
import { toast } from '../hooks/useToast';

// Tipos adaptados al dashboard
type DashboardMessage = {
    id: string;
    sender: string;
    email: string;
    subject: string;
    content: string;
    date: string;
    read: boolean;
    replied?: boolean;
};

export default function SupportDashboard() {
    const { user } = useAuth();
    const { messages: rawMessages, markRead, remove, send, update } = useMessagesContext();

    // Mapeamos los mensajes del contexto al formato que usa el dashboard
    const messages: DashboardMessage[] = React.useMemo(() => {
        return rawMessages.map(m => ({
            id: m.id,
            sender: m.sender,
            email: m.sender, // Asumimos que el sender es el email
            subject: m.subject,
            content: m.body,
            date: m.timestamp,
            read: m.read,
            replied: m.replied,
        }));
    }, [rawMessages]);

    const [selectedMessage, setSelectedMessage] = React.useState<DashboardMessage | null>(null);
    const [replyMode, setReplyMode] = React.useState(false);
    const [replyText, setReplyText] = React.useState('');

    const handleSelect = (msg: DashboardMessage) => {
        setSelectedMessage(msg);
        setReplyMode(false);
        if (!msg.read && markRead) {
            markRead(msg.id, true);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Borrar este mensaje?')) {
            remove(id);
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
            toast('Mensaje eliminado');
        }
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMessage) return;

        // Lógica de respuesta: Enviar nuevo correo y actualizar estado "replied"
        send({
            sender: user?.email || 'soporte@fixsy.cl', // Solución al error de TS
            receiver: selectedMessage.email,
            subject: `Re: ${selectedMessage.subject}`,
            body: replyText,
        });

        // Marcar como respondido en el mensaje original
        update(selectedMessage.id, { replied: true });

        toast('Respuesta enviada correctamente');
        setReplyMode(false);
        setReplyText('');

        // Actualizar visualmente la selección actual (aunque el efecto del contexto lo haría en breve)
        setSelectedMessage(prev => prev ? ({ ...prev, replied: true }) : null);
    };

    return (
        <div className="container-fluid py-4">
            <header className="mb-4">
                <h1 className="h3">Panel de Soporte</h1>
                <p className="text-muted">Gestiona las consultas de los clientes.</p>
            </header>

            <div className="row g-4">
                {/* Lista de Mensajes (Inbox) */}
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">Bandeja de Entrada</h5>
                        </div>
                        <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '600px' }}>
                            {messages.length === 0 ? (
                                <div className="p-4 text-center text-muted">No hay mensajes nuevos.</div>
                            ) : (
                                messages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action ${selectedMessage?.id === msg.id ? 'active' : ''}`}
                                        onClick={() => handleSelect(msg)}
                                    >
                                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                                            <strong className={`text-truncate ${selectedMessage?.id === msg.id ? 'text-white' : 'text-dark'}`} style={{ maxWidth: '70%' }}>
                                                {msg.subject || 'Sin asunto'}
                                            </strong>
                                            <small className={selectedMessage?.id === msg.id ? 'text-white-50' : 'text-muted'}>
                                                {new Date(msg.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p className={`mb-1 text-truncate small ${selectedMessage?.id === msg.id ? 'text-white-50' : 'text-muted'}`}>
                                            {msg.sender}
                                        </p>
                                        {msg.replied && <span className="badge bg-success ms-1">Respondido</span>}
                                        <div className="mt-2 text-end">
                                            <span
                                                className="badge bg-danger rounded-pill cursor-pointer"
                                                style={{ cursor: 'pointer', zIndex: 2 }}
                                                onClick={(e) => handleDelete(msg.id, e)}
                                                title="Borrar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Detalle del Mensaje */}
                <div className="col-md-7 col-lg-8">
                    <div className="card shadow-sm h-100">
                        {selectedMessage ? (
                            <>
                                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{selectedMessage.subject}</h5>
                                    {selectedMessage.replied && <span className="badge bg-success">Respondido</span>}
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-light rounded-circle p-2 me-2 text-primary fw-bold" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
                                                {selectedMessage.sender.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{selectedMessage.sender}</div>
                                                <div className="text-muted small">{selectedMessage.email}</div>
                                            </div>
                                            <div className="ms-auto text-muted small">
                                                {new Date(selectedMessage.date).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-light rounded border">
                                            {selectedMessage.content}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {!replyMode ? (
                                            <button className="btn btn-primary" onClick={() => setReplyMode(true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                                    <path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z" />
                                                </svg>
                                                Responder
                                            </button>
                                        ) : (
                                            <form onSubmit={handleSendReply} className="border-top pt-3">
                                                <label className="form-label fw-bold">Responder a {selectedMessage.sender}:</label>
                                                <textarea
                                                    className="form-control mb-3"
                                                    rows={4}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Escribe tu respuesta aquí..."
                                                    required
                                                ></textarea>
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-success">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                                        </svg>
                                                        Enviar Respuesta
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => setReplyMode(false)}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card-body d-flex flex-column align-items-center justify-content-center text-muted">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="mb-3 opacity-25" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                                </svg>
                                <p>Selecciona un mensaje para leerlo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
