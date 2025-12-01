import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Alert from '../../components/Alert';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './Checkout.css';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, ORDERS_API_BASE, USERS_API_BASE } from '../../utils/api';
import { OrderRequestDTO, OrderResponseDTO } from '../../types/order';
import { useAddresses } from '../../hooks/useAddresses';
import { estimateShipping, ShippingAddress } from '../../utils/shipping';
import { useOrders } from '../../context/OrdersContext';
import { STORAGE_KEYS } from '../../utils/storageKeys';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  comuna: string;
  payment: string;
  notes: string;
};

function Checkout(): React.ReactElement {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses } = useAddresses(user?.id || 'guest');
  const { addOrder: addOrderToContext } = useOrders();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    name: user ? `${user.nombre} ${user.apellido}`.trim() : '',
    email: user?.email || '',
    phone: '',
    address: '',
    region: '',
    comuna: '',
    payment: 'tarjeta',
    notes: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [order, setOrder] = React.useState<OrderResponseDTO | null>(null);

  // Cargar perfil del usuario para obtener teléfono
  React.useEffect(() => {
    if (!user?.id) return;
    setLoadingProfile(true);
    fetch(`${USERS_API_BASE}/api/users/${user.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUserProfile(data);
          setForm(prev => ({
            ...prev,
            phone: data.telefono || data.phone || prev.phone,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [user?.id]);

  // Autocompletar con primera dirección si existe
  React.useEffect(() => {
    if (addresses.length > 0 && !form.address) {
      const firstAddr = addresses[0];
      setForm(prev => ({
        ...prev,
        address: `${firstAddr.address} ${firstAddr.number}`.trim(),
        region: firstAddr.region || prev.region,
        comuna: firstAddr.commune || prev.comuna,
        phone: firstAddr.phone || prev.phone || userProfile?.telefono || userProfile?.phone || prev.phone,
      }));
    }
  }, [addresses, userProfile]);

  // Autocompletar nombre y email cuando cambia el usuario
  React.useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: `${user.nombre} ${user.apellido}`.trim() || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user?.nombre, user?.apellido, user?.email]);

  const cartItems = items.map((it) => ({
    id: it.productId,
    nombre: it.product.nombre,
    precio: it.product.precio,
    precioOferta: (it.product as any).precioOferta,
    sku: it.product.sku,
    cantidad: it.quantity,
    unitPrice: it.unitPrice ?? getDisplayPrice({ precio: it.product.precio, precioOferta: (it.product as any).precioOferta }).final,
  }));

  const subtotal = cartItems.reduce((sum, it) => sum + it.unitPrice * it.cantidad, 0);
  const iva = Math.round(subtotal * 0.19);
  
  // Calcular shipping
  const shippingAddress: ShippingAddress | null = form.region && form.comuna ? {
    region: form.region,
    comuna: form.comuna,
  } : null;
  const shippingEstimate = shippingAddress ? estimateShipping(shippingAddress, subtotal) : null;
  const shippingCost = shippingEstimate?.price ?? 0;
  const total = subtotal + iva + shippingCost;
  const totalItems = cartItems.reduce((sum, it) => sum + it.cantidad, 0);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const buildOrderPayload = (): OrderRequestDTO => {
    const userName = form.name || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Invitado';
    const userEmail = form.email || user?.email || '';
    const itemsDto = cartItems.map(it => ({
      productId: it.id,
      productName: it.nombre,
      productSku: it.sku || undefined,
      quantity: it.cantidad,
      unitPrice: it.unitPrice,
    }));
    return {
      userId: user?.id || null,
      userEmail,
      userName,
      status: 'PENDIENTE', // Estado inicial de la orden
      subtotal,
      iva,
      shippingCost,
      total,
      totalItems,
      shippingAddress: form.address,
      shippingRegion: form.region,
      shippingComuna: form.comuna,
      contactPhone: form.phone,
      paymentMethod: form.payment,
      notes: form.notes || undefined,
      items: itemsDto,
    };
  };


  // Función para crear orden local como fallback
  const createLocalOrder = (payload: OrderRequestDTO): OrderResponseDTO => {
    const orderId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    
    const localOrder: OrderResponseDTO = {
      id: orderId,
      userId: payload.userId,
      userEmail: payload.userEmail,
      userName: payload.userName,
      status: payload.status || 'PENDIENTE',
      subtotal: payload.subtotal,
      iva: payload.iva,
      shippingCost: payload.shippingCost || 0,
      total: payload.total || (payload.subtotal + (payload.iva || 0) + (payload.shippingCost || 0)),
      totalItems: payload.totalItems,
      shippingAddress: payload.shippingAddress,
      shippingRegion: payload.shippingRegion,
      shippingComuna: payload.shippingComuna,
      contactPhone: payload.contactPhone,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference,
      notes: payload.notes,
      createdAt: now,
      items: payload.items.map((it, idx) => ({
        id: idx + 1,
        productId: it.productId,
        productName: it.productName,
        productSku: it.productSku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        subtotal: it.unitPrice * it.quantity,
      })),
    };

    // Guardar en localStorage como fallback
    try {
      const key = `${STORAGE_KEYS.orders}_api`;
      const existing = localStorage.getItem(key);
      const orders: OrderResponseDTO[] = existing ? JSON.parse(existing) : [];
      orders.unshift(localOrder);
      localStorage.setItem(key, JSON.stringify(orders));
    } catch (e) {
      console.warn('No se pudo guardar orden en localStorage:', e);
    }

    // También agregar al contexto antiguo para compatibilidad
    addOrderToContext({
      userEmail: payload.userEmail,
      items: payload.items.map(it => ({
        productId: Number(it.productId) || 0,
        name: it.productName,
        quantity: it.quantity,
        price: it.unitPrice,
      })),
    });

    return localOrder;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!items.length) { setError('Tu carrito esta vacio.'); return; }
    if (!form.name || !form.email || !form.address || !form.region || !form.comuna || !form.phone) {
      setError('Completa todos los campos requeridos.');
      return;
    }
    if (!/.+@.+\..+/.test(form.email)) { setError('Ingresa un email valido.'); return; }
    if (!user?.id) { navigate('/login'); return; }
    setLoading(true);
    try {
      const payload = buildOrderPayload();
      console.log('Enviando orden:', payload);
      
      // Intentar primero con el microservicio
      const result = await apiFetch<OrderResponseDTO>(ORDERS_API_BASE, '/api/orders', {
        method: 'POST',
        json: payload,
        asResult: true,
      });

      let created: OrderResponseDTO;

      if (!result.ok) {
        console.warn('Microservicio no disponible, usando fallback local:', result.error);
        
        // Si el microservicio no está disponible, usar fallback local
        if (result.status === undefined || result.status === 0) {
          console.log('Creando orden local como fallback...');
          created = createLocalOrder(payload);
          setSuccess('Compra realizada con exito (guardada localmente). El microservicio no está disponible, pero tu orden se guardó correctamente.');
        } else {
          const errorMsg = result.error || `Error ${result.status || 'desconocido'}: No se pudo crear la orden.`;
          setError(errorMsg);
          return;
        }
      } else {
        created = result.data;
        console.log('Orden creada en microservicio:', created);
        setSuccess('Compra realizada con exito. Tu orden ha sido registrada correctamente.');
      }
      
      setOrder(created);
      clearCart();
    } catch (err: any) {
      console.error('Error inesperado:', err);
      const errorMessage = err?.message || 'No pudimos crear tu orden. Intenta nuevamente.';
      
      // Si es un error de red, intentar fallback local
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        console.log('Error de red detectado, usando fallback local...');
        try {
          const payload = buildOrderPayload();
          const created = createLocalOrder(payload);
          setOrder(created);
          setSuccess('Compra realizada con exito (guardada localmente). El microservicio no está disponible, pero tu orden se guardó correctamente.');
          clearCart();
        } catch (fallbackErr: any) {
          setError(`No se pudo conectar con el servidor ni guardar localmente. Verifica que el microservicio de órdenes esté corriendo en ${ORDERS_API_BASE}`);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    const orderIva = order.iva ?? Math.round(order.subtotal * 0.19);
    const orderShipping = order.shippingCost || 0;
    const orderTotal = order.total ?? (order.subtotal + orderIva + orderShipping);
    const orderTotalItems = order.totalItems ?? order.items.reduce((sum, it) => sum + it.quantity, 0);

    return (
      <section className="checkout">
        <h1>Compra confirmada</h1>
        <div className="checkout-receipt">
          <div className="checkout-receipt__header">
            <h2>Recibo de Compra</h2>
            <div className="checkout-receipt__order-number">
              <strong>Orden #{order.id}</strong>
            </div>
            <p className="checkout-receipt__date">
              {order.createdAt ? new Date(order.createdAt).toLocaleString('es-CL') : new Date().toLocaleString('es-CL')}
            </p>
          </div>

          <div className="checkout-receipt__section">
            <h3>Detalle de ítems</h3>
            <div className="checkout-list">
              {order.items.map((it) => (
                <div key={it.id} className="checkout-item">
                  <div className="checkout-item__info">
                    <span className="co-name">{it.productName}</span>
                    <span className="co-qty">Cantidad: {it.quantity}</span>
                    <span className="co-price">Precio unitario: {formatPrice(it.unitPrice)}</span>
                  </div>
                  <div className="checkout-item__subtotal">
                    <span className="co-price">{formatPrice(it.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-receipt__section">
            <h3>Resumen de totales</h3>
            <div className="checkout-list">
              <div className="checkout-item">
                <span className="co-name">Subtotal</span>
                <span className="co-price">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="checkout-item">
                <span className="co-name">IVA (19%)</span>
                <span className="co-price">{formatPrice(orderIva)}</span>
              </div>
              <div className="checkout-item">
                <span className="co-name">Costo de envío</span>
                <span className="co-price">{orderShipping === 0 ? 'Gratis' : formatPrice(orderShipping)}</span>
              </div>
              <div className="checkout-item">
                <span className="co-name">Total de ítems</span>
                <span className="co-price">{orderTotalItems}</span>
              </div>
              <div className="checkout-item checkout-item--total">
                <span className="co-name">Total final</span>
                <span className="co-price">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>

          <div className="checkout-receipt__section">
            <h3>Información de envío</h3>
            <p><strong>Dirección:</strong> {order.shippingAddress}</p>
            <p><strong>Comuna:</strong> {order.shippingComuna}</p>
            <p><strong>Región:</strong> {order.shippingRegion}</p>
            <p><strong>Teléfono de contacto:</strong> {order.contactPhone}</p>
          </div>

          <div className="checkout-receipt__section">
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Método de pago:</strong> {order.paymentMethod}</p>
          </div>
        </div>

        {success && <Alert type="success" message={success} />}
        <div className="checkout-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>Ir a inicio</button>
          <button type="button" className="btn-save" onClick={() => navigate('/history')}>Ver historial de ordenes</button>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      <p>Items en carrito: {totalItems}</p>
      
      <div className="checkout-summary">
        <h2>Resumen del pedido</h2>
        <div className="checkout-list">
          {cartItems.map((it) => (
            <div key={it.id} className="checkout-item">
              <span className="co-name">{it.nombre}</span>
              <span className="co-qty">x{it.cantidad}</span>
              <span className="co-price">{formatPrice(it.unitPrice * it.cantidad)}</span>
            </div>
          ))}
        </div>
        <div className="checkout-totals">
          <div className="checkout-item">
            <span className="co-name">Subtotal</span>
            <span className="co-price">{formatPrice(subtotal)}</span>
          </div>
          <div className="checkout-item">
            <span className="co-name">IVA (19%)</span>
            <span className="co-price">{formatPrice(iva)}</span>
          </div>
          <div className="checkout-item">
            <span className="co-name">Costo de envío</span>
            <span className="co-price">
              {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
              {shippingEstimate && shippingCost === 0 && (
                <span style={{ display: 'block', fontSize: '0.85em', color: '#666' }}>
                  {shippingEstimate.label}
                </span>
              )}
            </span>
          </div>
          <div className="checkout-item checkout-item--total">
            <span className="co-name">Total final</span>
            <span className="co-price">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <form className="checkout-form" onSubmit={onSubmit}>
        <h2>Datos de envío</h2>
        <div className="co-field">
          <label htmlFor="name">Nombre completo *</label>
          <input id="name" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="email">Email *</label>
          <input id="email" className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="phone">Teléfono *</label>
          <input id="phone" className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="address">Dirección *</label>
          <input id="address" className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="region">Región *</label>
          <input id="region" className="form-input" value={form.region} onChange={e => handleChange('region', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="comuna">Comuna *</label>
          <input id="comuna" className="form-input" value={form.comuna} onChange={e => handleChange('comuna', e.target.value)} required />
        </div>
        <div className="co-field">
          <label htmlFor="payment">Método de pago *</label>
          <select id="payment" className="form-input" value={form.payment} onChange={e => handleChange('payment', e.target.value)} required>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="notes">Notas adicionales</label>
          <textarea id="notes" className="form-input" value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
        </div>
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <button type="submit" className="btn-primary form-button" disabled={loading || loadingProfile}>
          {loading ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </section>
  );
}

export default Checkout;
