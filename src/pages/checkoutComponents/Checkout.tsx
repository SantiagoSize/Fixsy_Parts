import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Alert from '../../components/Alert';
import { formatPrice } from '../../utils/price';
import './Checkout.css';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, ORDERS_API_BASE, USERS_API_BASE } from '../../utils/api';
import { OrderItemRequestDTO, OrderRequestDTO, OrderResponseDTO } from '../../types/order';
import { useAddresses } from '../../hooks/useAddresses';
import { estimateShipping, ShippingAddress } from '../../utils/shipping';
import { useOrders } from '../../context/OrdersContext';
import { CHILE_REGIONES } from '../../data/chileDpa';

export type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  province: string;
  comuna: string;
  notes: string;
  payment: string;
};

type OrderErrorPayload = {
  order: OrderResponseDTO;
  message: string;
};

const provincesForRegion = (regionName: string) => {
  const region = CHILE_REGIONES.find((item) => item.nombre === regionName);
  return region?.provincias ?? [];
};

const communesForProvince = (regionName: string, provinceName: string) => {
  const region = CHILE_REGIONES.find((item) => item.nombre === regionName);
  const province = region?.provincias.find((item) => item.nombre === provinceName);
  return province?.comunas ?? [];
};

function Checkout(): React.ReactElement | null {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const userMeta = React.useMemo(
    () => (user ? (user as Record<string, any>) : null),
    [user],
  );
  const { addresses } = useAddresses(user?.id ? String(user.id) : 'guest');
  const { addOrder: addOrderToContext } = useOrders();
  const [form, setForm] = React.useState<FormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    province: '',
    comuna: '',
    notes: '',
    payment: 'tarjeta',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const shippingAddress: ShippingAddress | null = form.region && form.province && form.comuna
    ? { region: form.region, provincia: form.province, comuna: form.comuna }
    : null;

  const orderItems: OrderItemRequestDTO[] = React.useMemo(
    () => items.map((item) => ({
      productId: item.productId,
      productName: item.product.nombre,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    [items],
  );

  const subtotal = React.useMemo(() => orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [orderItems]);
  const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const iva = Math.round(subtotal * 0.19);
  const shippingEstimate = shippingAddress ? estimateShipping(shippingAddress, subtotal) : null;
  const shippingCost = shippingEstimate?.price ?? 0;
  const total = subtotal + iva + shippingCost;

  const provinceOptions = React.useMemo(() => provincesForRegion(form.region), [form.region]);
  const communeOptions = React.useMemo(() => communesForProvince(form.region, form.province), [form.region, form.province]);

  const isFormValid = Boolean(
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.region &&
    form.province &&
    form.comuna,
  );

  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  React.useEffect(() => {
    const derivedName = `${userMeta?.nombre ?? userMeta?.nombres ?? ''}`.trim();
    const derivedLast = `${userMeta?.apellido ?? userMeta?.apellidos ?? ''}`.trim();
    const fullName = [derivedName, derivedLast].filter(Boolean).join(' ').trim();
    setForm((prev) => ({
      ...prev,
      name: prev.name || fullName,
      email: prev.email || userMeta?.email || '',
      phone: prev.phone || userMeta?.telefono || userMeta?.phone || '',
    }));
  }, [userMeta]);

  React.useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;
    let isMounted = true;
    fetch(`${USERS_API_BASE}/api/users/${user.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setForm((prev) => ({
          ...prev,
          name: prev.name || `${data.nombre ?? data.nombres ?? ''} ${data.apellido ?? data.apellidos ?? ''}`.trim(),
          email: prev.email || data.email || '',
          phone: prev.phone || data.telefono || data.phone || '',
          address: prev.address || data.direccion || data.address || '',
          region: prev.region || data.region || '',
          province: prev.province || data.provincia || data.province || '',
          comuna: prev.comuna || data.comuna || '',
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  React.useEffect(() => {
    if (form.region || addresses.length === 0) return;
    const first = addresses[0];
    setForm((prev) => ({
      ...prev,
      address: prev.address || `${first.address} ${first.number}`.trim(),
      region: prev.region || first.region,
      province: prev.province || first.province,
      comuna: prev.comuna || first.commune,
    }));
  }, [addresses, form.region]);

  const handleField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'region') {
        next.province = '';
        next.comuna = '';
      } else if (field === 'province') {
        next.comuna = '';
      }
      return next;
    });
    setError(null);
  };

  const buildShippingLabel = () => {
    const parts = [form.address, form.comuna, form.province, form.region].filter(Boolean);
    return parts.join(', ');
  };

  const placeOrder = async () => {
    if (!isFormValid) {
      setError('Completa todos los datos de envío para continuar.');
      return;
    }
    if (items.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    const payload: OrderRequestDTO = {
      userId: isAuthenticated ? String(user?.id ?? '') : null,
      userEmail: form.email.trim(),
      userName: form.name.trim(),
      subtotal,
      iva,
      shippingCost,
      total,
      totalItems,
      shippingAddress: buildShippingLabel(),
      shippingRegion: form.region,
      shippingComuna: form.comuna,
      contactPhone: form.phone.trim(),
      paymentMethod: form.payment,
      notes: form.notes.trim() || undefined,
      items: orderItems,
    };

    setLoading(true);
    setError(null);
    try {
      const order = await apiFetch<OrderResponseDTO>(ORDERS_API_BASE, '/api/orders', {
        method: 'POST',
        json: payload,
      });
      addOrderToContext({
        userEmail: order.userEmail,
        items: order.items.map((it) => ({
          productId: typeof it.productId === 'string' ? Number(it.productId) : it.productId,
          name: it.productName,
          quantity: it.quantity,
          price: it.unitPrice,
        })),
      });
      clearCart();
      navigate('/checkout/success', { state: order });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la orden.';
      const fallbackOrder: OrderResponseDTO = {
        id: `pendiente-${Date.now()}`,
        userEmail: payload.userEmail,
        userName: payload.userName,
        status: 'error',
        subtotal: payload.subtotal,
        iva: payload.iva,
        shippingCost: payload.shippingCost ?? 0,
        total: payload.total ?? 0,
        totalItems: payload.totalItems,
        shippingAddress: payload.shippingAddress,
        shippingRegion: payload.shippingRegion,
        shippingComuna: payload.shippingComuna,
        contactPhone: payload.contactPhone,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes,
        items: payload.items.map((item, index) => ({
          id: `fallback-${item.productId}-${index}`,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      };
      navigate('/checkout/error', { state: { order: fallbackOrder, message } as OrderErrorPayload });
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return null;
  }

  return (
    <section className="checkout">
      <h1 className="checkout-title">Checkout</h1>
      <p className="checkout-items-count">{totalItems} productos en tu pedido</p>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error" message={error} />
        </div>
      )}

      <div className="checkout-summary">
        <h2>Resumen del pedido</h2>
        <div className="checkout-table-wrapper">
          <table className="checkout-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Unitario</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={`${item.productId}-${item.quantity}`}>
                  <td className="checkout-table__name">{item.productName}</td>
                  <td className="checkout-table__qty">{item.quantity}</td>
                  <td className="checkout-table__price">{formatPrice(item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>Subtotal</td>
                <td>{formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={2}>IVA (19%)</td>
                <td>{formatPrice(iva)}</td>
              </tr>
              <tr>
                <td colSpan={2}>Costo de envío</td>
                <td>{shippingEstimate ? (shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)) : 'Por estimar'}</td>
              </tr>
              <tr className="checkout-table__total">
                <td colSpan={2}>Total final</td>
                <td>{formatPrice(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="checkout-table-note" aria-live="polite">
          {shippingEstimate ? (
            <>
              <strong>{shippingEstimate.label}</strong>
              <span>{shippingEstimate.eta}</span>
            </>
          ) : (
            <span>Completa región, provincia y comuna para calcular el envío estimado.</span>
          )}
        </div>
        <div className="checkout-table-responsive">
          {orderItems.map((item) => (
            <div key={`mobile-${item.productId}-${item.quantity}`} className="checkout-item checkout-item--mobile">
              <div>
                <span>{item.productName}</span>
                <span>
                  x{item.quantity} · {formatPrice(item.unitPrice)}
                </span>
              </div>
            </div>
          ))}
          <div className="checkout-item checkout-item--mobile checkout-item--mobile-total">
            <div>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="checkout-form">
        <h2>Datos de envío</h2>
        <div className="co-field">
          <label htmlFor="checkout-name">Nombre completo</label>
          <input
            id="checkout-name"
            className="form-input"
            value={form.name}
            onChange={(e) => handleField('name', e.target.value)}
            placeholder="Nombre y apellido"
            type="text"
          />
        </div>
        <div className="co-field">
          <label htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            className="form-input"
            value={form.email}
            onChange={(e) => handleField('email', e.target.value)}
            placeholder="correo@dominio.com"
            type="email"
          />
        </div>
        <div className="co-field">
          <label htmlFor="checkout-phone">Teléfono</label>
          <input
            id="checkout-phone"
            className="form-input"
            value={form.phone}
            onChange={(e) => handleField('phone', e.target.value)}
            placeholder="+56 9 1234 5678"
            type="tel"
          />
        </div>
        <div className="co-field">
          <label htmlFor="checkout-address">Dirección</label>
          <input
            id="checkout-address"
            className="form-input"
            value={form.address}
            onChange={(e) => handleField('address', e.target.value)}
            placeholder="Calle, número, departamento"
            type="text"
          />
        </div>
        <div className="co-field">
          <label htmlFor="checkout-region">Región</label>
          <select
            id="checkout-region"
            className="form-input"
            value={form.region}
            onChange={(e) => handleField('region', e.target.value)}
          >
            <option value="">Selecciona una región</option>
            {CHILE_REGIONES.map((region) => (
              <option key={region.nombre} value={region.nombre}>{region.nombre}</option>
            ))}
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="checkout-province">Provincia</label>
          <select
            id="checkout-province"
            className="form-input"
            value={form.province}
            onChange={(e) => handleField('province', e.target.value)}
            disabled={!form.region}
          >
            <option value="">Selecciona una provincia</option>
            {provinceOptions.map((province) => (
              <option key={province.nombre} value={province.nombre}>{province.nombre}</option>
            ))}
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="checkout-comuna">Comuna</label>
          <select
            id="checkout-comuna"
            className="form-input"
            value={form.comuna}
            onChange={(e) => handleField('comuna', e.target.value)}
            disabled={!form.province}
          >
            <option value="">Selecciona una comuna</option>
            {communeOptions.map((comuna) => (
              <option key={comuna.nombre} value={comuna.nombre}>{comuna.nombre}</option>
            ))}
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="checkout-notes">Notas adicionales</label>
          <textarea
            id="checkout-notes"
            className="form-input"
            value={form.notes}
            onChange={(e) => handleField('notes', e.target.value)}
            placeholder="¿Hay algo que debamos saber sobre el envío?"
          />
        </div>
        <div className="co-field">
          <label htmlFor="checkout-payment">Método de pago</label>
          <select
            id="checkout-payment"
            className="form-input"
            value={form.payment}
            onChange={(e) => handleField('payment', e.target.value)}
          >
            <option value="tarjeta">Tarjeta de crédito o débito</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="efectivo">Efectivo en sucursal</option>
          </select>
        </div>
        <div className="checkout-actions">
          <button
            type="button"
            className="btn-action"
            onClick={placeOrder}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Procesando orden...' : 'Confirmar compra'}
          </button>
        </div>
      </section>
    </section>
  );
}

export default Checkout;
