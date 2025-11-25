import React from 'react';
import { MessagesProvider as MailMessagesProvider, useMessagesContext, AppMessage } from '../messages/MessagesContext';

type WrapperCtx = {
  messages: AppMessage[];
  send: (to: string, body: string) => void;
  unreadCount: (email: string) => number;
  markRead: (id: string, v?: boolean) => void;
  forUser: (email: string) => AppMessage[];
};

const WrapperContext = React.createContext<WrapperCtx | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  return (
    <MailMessagesProvider>
      <MessagesAdapter>{children}</MessagesAdapter>
    </MailMessagesProvider>
  );
}

function MessagesAdapter({ children }: { children: React.ReactNode }) {
  const { messages, send: sendMail, unreadCount, markRead } = useMessagesContext();

  const send = React.useCallback((to: string, body: string) => {
    sendMail({ receiver: to, sender: '', subject: '(sin asunto)', body });
  }, [sendMail]);

  const forUser = React.useCallback((email: string) => {
    const low = (email || '').toLowerCase();
    return messages.filter(m => (m.receiver || '').toLowerCase() === low && !m.deleted);
  }, [messages]);

  const value = React.useMemo<WrapperCtx>(() => ({
    messages,
    send,
    unreadCount,
    markRead,
    forUser,
  }), [messages, send, unreadCount, markRead, forUser]);

  return <WrapperContext.Provider value={value}>{children}</WrapperContext.Provider>;
}

export function useMessages() {
  const ctx = React.useContext(WrapperContext);
  if (!ctx) throw new Error('useMessages debe usarse dentro de MessagesProvider');
  return ctx;
}
