import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Alert from '../../components/Alert';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './Checkout.css';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, MESSAGES_API_BASE, ORDERS_API_BASE } from '../../utils/api';
import { OrderRequestDTO, OrderResponseDTO } from '../../types/order';

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
  const [ticketWarning, setTicketWarning] = React.useState<string | null>(null);

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
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  React.useEffect(() => {
    setForm(prev => ({
      ...prev,
      name: user ? `${user.nombre} ${user.apellido}`.trim() : prev.name,
      email: user?.email || prev.email,
    }));
  }, [user?.nombre, user?.apellido, user?.email]);

  const buildOrderPayload = (): OrderRequestDTO => {
    const userName = form.name || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Invitado';
    const userEmail = form.email || user?.email || '';
    const itemsDto = cartItems.map(it => ({
      productId: it.id,
      productName: it.nombre,
      productSku: it.sku,
      quantity: it.cantidad,
      unitPrice: it.unitPrice,
    }));
    return {
      userId: user?.id || null,
      userEmail,
      userName,
      subtotal,
      shippingCost,
      total,
      shippingAddress: form.address,
      shippingRegion: form.region,
      shippingComuna: form.comuna,
      contactPhone: form.phone,
      paymentMethod: form.payment,
      notes: form.notes,
      items: itemsDto,
    };
  };

  const buildReceiptMessage = (created: OrderResponseDTO) => {
    const lines = created.items.map(it => `- ${it.quantity} x ${it.productName} (${formatPrice(it.unitPrice)} c/u) = ${formatPrice(it.subtotal)}`).join('\n');
    const safeTotal = created.total ?? (created.subtotal + (created.shippingCost || 0));
    const totalLine = `Subtotal: ${formatPrice(created.subtotal)}\nEnvio: ${formatPrice(created.shippingCost || 0)}\nTotal: ${formatPrice(safeTotal)}`;
    return `Gracias por tu compra #${created.id}\n\nDetalle:\n${lines}\n\n${totalLine}\n\nMetodo de pago: ${created.paymentMethod}${created.paymentReference ? `\nReferencia: ${created.paymentReference}` : ''}`;
  };

  const createReceiptTicket = async (created: OrderResponseDTO) => {
    try {
      await apiFetch(MESSAGES_API_BASE, '/api/tickets', {
        method: 'POST',
        json: {
          userId: created.userId ?? null,
          userEmail: created.userEmail,
          userName: created.userName,
          asunto: `Boleta de compra #${created.id}`,
          categoria: 'Boleta',
          prioridad: 'Media',
          orderId: created.id,
          mensajeInicial: buildReceiptMessage(created),
        },
      });
      return true;
    } catch (err: any) {
      setTicketWarning(err?.message || 'Tu boleta no se pudo guardar en la bandeja, intenta mas tarde.');
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTicketWarning(null);
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
      const created = await apiFetch<OrderResponseDTO>(ORDERS_API_BASE, '/api/orders', {
        method: 'POST',
        json: payload,
      });
      setOrder(created);
      setSuccess('Compra realizada con exito. Tu boleta esta disponible en la bandeja de entrada.');
      clearCart();
      createReceiptTicket(created);
    } catch (err: any) {
      setError(err?.message || 'No pudimos crear tu orden. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <section className="checkout">
        <h1>Compra confirmada</h1>
        <div className="checkout-list">
          <div className="checkout-item">
            <span className="co-name">Orden</span>
            <span className="co-qty">#{order.id}</span>
            <span className="co-price">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</span>
          </div>
          {order.items.map((it) => (
            <div key={it.id} className="checkout-item">
              <span className="co-name">{it.productName}</span>
              <span className="co-qty">x{it.quantity}</span>
              <span className="co-price">{formatPrice(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <p>Estado: <strong>{order.status}</strong></p>
        <p>Envio a: {order.shippingAddress} ({order.shippingComuna}, {order.shippingRegion})</p>
        {(() => {
          const orderTotal = order.total ?? (order.subtotal + (order.shippingCost || 0));
          return (
          <div className="checkout-list">
            <div className="checkout-item"><span className="co-name">Subtotal</span><span className="co-price">{formatPrice(order.subtotal)}</span></div>
            <div className="checkout-item"><span className="co-name">Envio</span><span className="co-price">{formatPrice(order.shippingCost || 0)}</span></div>
            <div className="checkout-item"><span className="co-name">Total</span><span className="co-price">{formatPrice(orderTotal)}</span></div>
          </div>
          );
        })()}
        {ticketWarning && <Alert type="error" message={ticketWarning} />}
        {success && <Alert type="success" message={success} />}
        <div className="checkout-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>Ir a inicio</button>
          <button type="button" className="btn-save" onClick={() => navigate('/inbox')}>Ver boleta en bandeja</button>
          <button type="button" className="btn-save" onClick={() => navigate('/history')}>Ver historial de ordenes</button>
        </div>
      </section>
    );
  }

  const totalItems = cartItems.reduce((sum, it) => sum + it.cantidad, 0);

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      <p>Items en carrito: {totalItems}</p>
      <div className="checkout-list">
        {cartItems.map((it) => (
          <div key={it.id} className="checkout-item">
            <span className="co-name">{it.nombre}</span>
            <span className="co-qty">x{it.cantidad}</span>
            <span className="co-price">{formatPrice(it.unitPrice * it.cantidad)}</span>
          </div>
        ))}
      </div>
      <p>Total estimado: {formatPrice(subtotal)}</p>

      <form className="checkout-form" onSubmit={onSubmit}>
        <div className="co-field">
          <label htmlFor="name">Nombre completo</label>
          <input id="name" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="email">Email</label>
          <input id="email" className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="phone">Telefono</label>
          <input id="phone" className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="address">Direccion</label>
          <input id="address" className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="region">Region</label>
          <input id="region" className="form-input" value={form.region} onChange={e => handleChange('region', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="comuna">Comuna</label>
          <input id="comuna" className="form-input" value={form.comuna} onChange={e => handleChange('comuna', e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="payment">Metodo de pago</label>
          <select id="payment" className="form-input" value={form.payment} onChange={e => handleChange('payment', e.target.value)}>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="notes">Notas</label>
          <textarea id="notes" className="form-input" value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
        </div>
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <button type="submit" className="btn-primary form-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </section>
  );
}

export default Checkout;
