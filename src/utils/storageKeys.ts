// Centralized localStorage keys for Fixsy Parts
export const STORAGE_KEYS = {
  authUsers: 'fixsy_users',
  currentUser: 'fixsy_current_user',
  cart: 'fixsy_cart',
  orders: 'fixsy_orders',
  mgmtPurchases: 'fixsyCompras',
  inventory: 'fixsy_inventory',
  messagesSimple: 'fixsy_messages',
  messagesMail: 'fixsyMessages',
  inboxPrefix: 'fixsy_inbox_', // require concatenation with email lowercased
  ticketsPrefix: 'fixsy_tickets_', // dashboard tickets + contacto
  purchases: 'fixsy_orders_history',
  items: 'fixsy_items',
  dashKey: 'fixsy_dash_key',
  mgmtUsers: 'fixsyUsers',
} as const;
