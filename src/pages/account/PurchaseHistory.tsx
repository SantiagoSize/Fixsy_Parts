import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, ORDERS_API_BASE } from '../../utils/api';
import { OrderResponseDTO } from '../../types/order';
import { formatPrice } from '../../utils/price';
import { STORAGE_KEYS } from '../../utils/storageKeys';

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<OrderResponseDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Función para cargar órdenes desde localStorage
  const loadLocalOrders = (): OrderResponseDTO[] => {
    try {
      const key = `${STORAGE_KEYS.orders}_api`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const allOrders: OrderResponseDTO[] = JSON.parse(raw);
      // Filtrar por usuario
      return allOrders.filter(o => 
        String(o.userId) === String(user?.id) || 
        (o.userEmail && o.userEmail.toLowerCase() === user?.email.toLowerCase())
      );
    } catch {
      return [];
    }
  };

  React.useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Intentar primero con endpoint específico del usuario
        let result = await apiFetch<OrderResponseDTO[]>(ORDERS_API_BASE, `/api/orders/user/${user.id}`, {
          method: 'GET',
          asResult: true,
        });

        // Si no funciona, intentar con email
        if (!result.ok) {
          result = await apiFetch<OrderResponseDTO[]>(ORDERS_API_BASE, `/api/orders/user/${user.email}`, {
            method: 'GET',
            asResult: true,
          });
        }

        // Si aún no funciona, obtener todas y filtrar
        if (!result.ok) {
          const allResult = await apiFetch<OrderResponseDTO[]>(ORDERS_API_BASE, '/api/orders', {
            method: 'GET',
            asResult: true,
          });
          
          if (allResult.ok) {
            const userOrders = allResult.data.filter(o => 
              String(o.userId) === String(user.id) || 
              (o.userEmail && o.userEmail.toLowerCase() === user.email.toLowerCase())
            );
            const sorted = userOrders.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            setOrders(sorted);
          } else {
            // Si no hay conexión, usar fallback local
            if (allResult.status === undefined || allResult.status === 0) {
              console.log('Microservicio no disponible, cargando órdenes locales...');
              const localOrders = loadLocalOrders();
              const sorted = localOrders.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
              setOrders(sorted);
              if (sorted.length === 0) {
                setError(`No se pudo conectar con el servidor de órdenes y no hay órdenes locales. Verifica que el microservicio esté corriendo en ${ORDERS_API_BASE}`);
              } else {
                setError(null); // Hay órdenes locales, no mostrar error
              }
            } else {
              setError(allResult.error || 'No se pudieron cargar las órdenes.');
            }
          }
        } else {
          // Ordenar por fecha más reciente primero
          const sorted = result.data.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setOrders(sorted);
        }
      } catch (err: any) {
        console.error('Error al cargar órdenes:', err);
        const errorMsg = err?.message || 'Error al cargar el historial de compras.';
        
        // Si es error de red, intentar cargar órdenes locales
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          console.log('Error de red detectado, cargando órdenes locales...');
          const localOrders = loadLocalOrders();
          const sorted = localOrders.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setOrders(sorted);
          if (sorted.length === 0) {
            setError(`No se pudo conectar con el servidor y no hay órdenes locales. Verifica que el microservicio de órdenes esté corriendo en ${ORDERS_API_BASE}`);
          } else {
            setError(null); // Hay órdenes locales, no mostrar error
          }
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.id, user?.email]);

  if (!user) {
    return <div style={{ padding: '1rem' }}>Debes iniciar sesión.</div>;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '1rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Historial de compras</h1>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '1rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Historial de compras</h1>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Historial de compras</h1>
      {orders.length === 0 ? (
        <p>No hay compras registradas.</p>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {orders.map(order => {
            const orderIva = order.iva ?? Math.round(order.subtotal * 0.19);
            const orderShipping = order.shippingCost || 0;
            const orderTotal = order.total ?? (order.subtotal + orderIva + orderShipping);
            const orderTotalItems = order.totalItems ?? order.items.reduce((sum, it) => sum + it.quantity, 0);

            return (
              <div key={order.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #F2F1F2', background: '#F9FAFB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '1.1em' }}>Orden #{order.id}</strong>
                      <div style={{ marginTop: '4px', color: '#6B7280', fontSize: '0.9em' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('es-CL') : 'Fecha no disponible'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#0064CD' }}>
                        {formatPrice(orderTotal)}
                      </div>
                      <div style={{ marginTop: '4px', color: '#6B7280', fontSize: '0.85em' }}>
                        {orderTotalItems} {orderTotalItems === 1 ? 'ítem' : 'ítems'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: order.status === 'CONFIRMADA' || order.status === 'PENDIENTE' ? '#D1FAE5' : '#FEE2E2',
                      color: order.status === 'CONFIRMADA' || order.status === 'PENDIENTE' ? '#065F46' : '#991B1B',
                      fontSize: '0.85em',
                      fontWeight: 600
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1em', fontWeight: 600 }}>Productos:</h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '8px 0', 
                        borderBottom: idx < order.items.length - 1 ? '1px dashed #E5E7EB' : 'none'
                      }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{it.productName}</span>
                          <span style={{ color: '#6B7280', marginLeft: '8px' }}>x{it.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 600 }}>{formatPrice(it.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#6B7280' }}>Subtotal:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#6B7280' }}>IVA (19%):</span>
                      <span>{formatPrice(orderIva)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#6B7280' }}>Envío:</span>
                      <span>{orderShipping === 0 ? 'Gratis' : formatPrice(orderShipping)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', fontWeight: 700, fontSize: '1.1em' }}>
                      <span>Total:</span>
                      <span style={{ color: '#0064CD' }}>{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', fontSize: '0.9em', color: '#6B7280' }}>
                    <div><strong>Dirección de envío:</strong> {order.shippingAddress}</div>
                    <div>{order.shippingComuna}, {order.shippingRegion}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
