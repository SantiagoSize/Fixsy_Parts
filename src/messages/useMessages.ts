import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessagesContext, AppMessage } from './MessagesContext';

export type MailboxFilter = 'inbox' | 'sent' | 'important' | 'archived' | 'trash';

function norm(s?: string) { return (s || '').trim().toLowerCase(); }

export default function useMessages() {
  const { user } = useAuth();
  const email = norm(user?.email) || '';
  const role = user?.role || 'Usuario';
  const ctx = useMessagesContext();

  const isSupport = role === 'Soporte' || role === 'Admin';

  const visibleForMe = React.useCallback((list: AppMessage[]) => {
    if (isSupport) return list; // Soporte ve todo
    if (!email) return list.filter(() => false);
    return list.filter(m => norm(m.sender) === email || norm(m.receiver) === email);
  }, [isSupport, email]);

  const byFilter = React.useCallback((type: MailboxFilter): AppMessage[] => {
    let base = visibleForMe(ctx.messages).filter(m => !m.deleted);
    if (type === 'trash') return visibleForMe(ctx.messages).filter(m => m.deleted);
    if (type === 'archived') return base.filter(m => m.archived);
    if (type === 'important') return base.filter(m => m.important && !m.archived);
    if (type === 'sent') return base.filter(m => norm(m.sender) === email && !m.archived);
    // inbox
    return base.filter(m => norm(m.receiver) === email && !m.archived);
  }, [ctx.messages, email, visibleForMe]);

  const unreadCount = React.useCallback(() => byFilter('inbox').filter(m => !m.read).length, [byFilter]);

  const send = ctx.send;
  const archive = ctx.archive;
  const remove = ctx.remove;
  const markRead = ctx.markRead;
  const markImportant = ctx.markImportant;
  const refresh = ctx.refresh;

  return { messages: ctx.messages, byFilter, unreadCount, send, archive, remove, markRead, markImportant, refresh };
}
