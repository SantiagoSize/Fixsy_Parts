import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';

export default function PurchaseHistory() {
  const { user } = useAuth();
  const { orders, ordersFor } = useOrders();
  if (!user) return <div style={{ padding: '1rem' }}>Debes iniciar sesión.</div>;

  const list = (user.role === 'Admin' || user.role === 'Support') ? orders : ordersFor(user.email);

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Historial de compras</h1>
      {list.length === 0 ? (
        <p>No hay compras registradas.</p>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {list.map(o => (
            <div key={o.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F2F1F2', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Fecha:</strong> {new Date(o.date).toLocaleString()}
                </div>
                <div>
                  <strong>Cliente:</strong> {o.userEmail}
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                {o.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span>{it.name} x{it.quantity}</span>
                    <span>${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <button type="button" style={{ background: '#0064CD', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Ver comprobante</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

