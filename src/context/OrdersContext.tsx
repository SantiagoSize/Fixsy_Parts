import React from 'react';

export type OrderItem = { productId: number; name: string; quantity: number; price: number };
export type Order = { id: string; userEmail: string; date: string; items: OrderItem[] };

const ORDERS_KEY = 'fixsy_orders';

function loadOrders(): Order[] { try { const raw = localStorage.getItem(ORDERS_KEY); return raw ? JSON.parse(raw) as Order[] : []; } catch { return []; } }
function saveOrders(orders: Order[]) { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }

type Ctx = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  ordersFor: (email: string) => Order[];
};

const OrdersContext = React.createContext<Ctx | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<Order[]>(loadOrders());

  const addOrder = React.useCallback((order: Omit<Order, 'id' | 'date'>) => {
    const full: Order = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, date: new Date().toISOString(), ...order };
    setOrders(prev => { const next = [full, ...prev]; saveOrders(next); return next; });
  }, []);

  const ordersFor = React.useCallback((email: string) => orders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase()), [orders]);

  const value: Ctx = React.useMemo(() => ({ orders, addOrder, ordersFor }), [orders, addOrder, ordersFor]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders debe usarse dentro de OrdersProvider');
  return ctx;
}

