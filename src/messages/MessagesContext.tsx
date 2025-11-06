import React from 'react';
import { useAuth } from '../context/AuthContext';

export type AppMessage = {
  id: string;
  sender: string;
  receiver: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  read: boolean;
  important: boolean;
  archived: boolean;
  deleted: boolean;
  timestamp: string; // ISO
};

const STORAGE_KEY = 'fixsyMessages';

function loadAll(): AppMessage[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as AppMessage[] : []; } catch { return []; }
}
function saveAll(list: AppMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

type Ctx = {
  messages: AppMessage[];
  send: (m: Omit<AppMessage, 'id' | 'read' | 'archived' | 'deleted' | 'important' | 'timestamp'> & Partial<Pick<AppMessage,'attachments'|'cc'|'bcc'>>) => AppMessage;
  update: (id: string, patch: Partial<AppMessage>) => void;
  remove: (id: string) => void; // move to trash
  archive: (id: string, v?: boolean) => void;
  markRead: (id: string, v?: boolean) => void;
  markImportant: (id: string, v?: boolean) => void;
  refresh: () => void; // reload from localStorage (simulated realtime)
};

export const MessagesContext = React.createContext<Ctx | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<AppMessage[]>(loadAll());

  const persist = React.useCallback((updater: (prev: AppMessage[]) => AppMessage[]) => {
    setMessages(prev => {
      const next = updater(prev);
      saveAll(next);
      return next;
    });
  }, []);

  const send: Ctx['send'] = React.useCallback((m) => {
    const sender = m.sender || user?.email || 'usuario@fixsy.local';
    const draft: AppMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      sender,
      receiver: m.receiver,
      cc: (m.cc || []).filter(Boolean),
      bcc: (m.bcc || []).filter(Boolean),
      subject: m.subject || '(sin asunto)',
      body: m.body || '',
      attachments: m.attachments || [],
      read: sender === user?.email, // si yo envío, se marca leído
      important: false,
      archived: false,
      deleted: false,
      timestamp: new Date().toISOString(),
    };
    persist(prev => [draft, ...prev]);
    return draft;
  }, [persist, user?.email]);

  const update: Ctx['update'] = React.useCallback((id, patch) => {
    persist(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }, [persist]);

  const remove: Ctx['remove'] = React.useCallback((id) => {
    update(id, { deleted: true });
  }, [update]);

  const archive: Ctx['archive'] = React.useCallback((id, v = true) => update(id, { archived: v }), [update]);
  const markRead: Ctx['markRead'] = React.useCallback((id, v = true) => update(id, { read: v }), [update]);
  const markImportant: Ctx['markImportant'] = React.useCallback((id, v = true) => update(id, { important: v }), [update]);

  const refresh = React.useCallback(() => setMessages(loadAll()), []);

  // Simular recepción en tiempo real leyendo localStorage cada 30s
  React.useEffect(() => {
    const t = setInterval(() => setMessages(loadAll()), 30000);
    return () => clearInterval(t);
  }, []);

  const value = React.useMemo(() => ({ messages, send, update, remove, archive, markRead, markImportant, refresh }), [messages, send, update, remove, archive, markRead, markImportant, refresh]);
  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessagesContext() {
  const ctx = React.useContext(MessagesContext);
  if (!ctx) throw new Error('useMessagesContext debe usarse dentro de MessagesProvider');
  return ctx;
}

// Seed inicial para pruebas: agrega 3 mensajes si no hay ninguno
// (no interfiere si ya existen mensajes en localStorage)
export function __seedFixsyMessagesOnce() {
  const existing = loadAll();
  if (existing.length > 0) return;
  const now = Date.now();
  const seed: AppMessage[] = [
    {
      id: `${now - 30000}_seed1`,
      sender: 'cliente1@mail.com',
      receiver: 'soporte@fixsy.com',
      subject: 'Consulta por stock FX-100',
      body: 'Hola, ¿tienen stock del producto FX-100? Gracias.',
      read: false,
      important: false,
      archived: false,
      deleted: false,
      timestamp: new Date(now - 30000).toISOString(),
    },
    {
      id: `${now - 20000}_seed2`,
      sender: 'cliente2@mail.com',
      receiver: 'soporte@fixsy.com',
      subject: 'Problema con la compra',
      body: 'Mi orden no aparece en el historial. ¿Me pueden ayudar?',
      read: false,
      important: true,
      archived: false,
      deleted: false,
      timestamp: new Date(now - 20000).toISOString(),
    },
    {
      id: `${now - 10000}_seed3`,
      sender: 'cliente3@mail.com',
      receiver: 'soporte@fixsy.com',
      subject: 'Solicitud de boleta',
      body: 'Necesito la boleta de la compra A-002. Saludos.',
      read: true,
      important: false,
      archived: false,
      deleted: false,
      timestamp: new Date(now - 10000).toISOString(),
    },
  ];
  saveAll(seed);
}
