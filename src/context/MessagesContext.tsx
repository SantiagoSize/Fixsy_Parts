import React from 'react';
import { useAuth } from './AuthContext';

export type Message = {
  id: string;
  to: string; // email destino
  from: string; // email origen
  message: string;
  date: string; // ISO
  read: boolean;
};

const MSG_KEY = 'fixsy_messages';

function loadMessages(): Message[] {
  try { const raw = localStorage.getItem(MSG_KEY); return raw ? JSON.parse(raw) as Message[] : []; } catch { return []; }
}
function saveMessages(msgs: Message[]) { localStorage.setItem(MSG_KEY, JSON.stringify(msgs)); }

type Ctx = {
  messages: Message[];
  send: (to: string, body: string) => void;
  forUser: (email: string) => Message[];
  markRead: (id: string) => void;
  unreadCount: (email: string) => number;
};

const MessagesContext = React.createContext<Ctx | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>(loadMessages());

  const persist = React.useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const next = updater(prev);
      saveMessages(next);
      return next;
    });
  }, []);

  const send = React.useCallback((to: string, body: string) => {
    const from = user?.email || 'support@fixsy.local';
    const msg: Message = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      to,
      from,
      message: body,
      date: new Date().toISOString(),
      read: false,
    };
    persist(prev => [msg, ...prev]);
  }, [user?.email, persist]);

  const forUser = React.useCallback((email: string) => {
    return messages.filter(m => m.to.toLowerCase() === email.toLowerCase());
  }, [messages]);

  const markRead = React.useCallback((id: string) => {
    persist(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }, [persist]);

  const unreadCount = React.useCallback((email: string) => {
    return messages.filter(m => m.to.toLowerCase() === email.toLowerCase() && !m.read).length;
  }, [messages]);

  const value: Ctx = React.useMemo(() => ({ messages, send, forUser, markRead, unreadCount }), [messages, send, forUser, markRead, unreadCount]);

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = React.useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages debe usarse dentro de MessagesProvider');
  return ctx;
}

