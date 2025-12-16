import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import { formatPrice } from '../../utils/price';
import { OrderResponseDTO } from '../../types/order';
import './Checkout.css';

type LocationState = {
  order?: OrderResponseDTO | null;
  message?: string;
};

function CheckoutError(): React.ReactElement | null {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order, message } = (state as LocationState) ?? {};

  React.useEffect(() => {
    if (!order || !order.items?.length) {
      navigate('/cart', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const subtotalAmount = order.subtotal ?? 0;
  const ivaAmount = order.iva ?? 0;
  const shippingAmount = order.shippingCost ?? 0;
  const shippingDisplay = shippingAmount > 0 ? formatPrice(shippingAmount) : 'Gratis';

  return (
    <section className="checkout">
      <h1>No se pudo realizar el pago. Nro #{order.id}</h1>
      {message && <Alert type="error" message={message} />}
      <div className="checkout-summary">
        <div className="checkout-item">
          <span className="co-name">Cliente</span>
          <span className="co-value">{order.userName || 'Invitado'}</span>
        </div>
        <div className="checkout-item">
          <span className="co-name">Dirección</span>
          <span className="co-value">{order.shippingAddress}</span>
        </div>
        <h2>Productos ({totalItems})</h2>
        <div className="checkout-list">
          {order.items.map((it) => (
            <div key={it.id} className="checkout-item">
              <span className="co-name">{it.productName}</span>
              <span className="co-qty">x{it.quantity}</span>
              <span className="co-price">{formatPrice((it.unitPrice || 0) * (it.quantity || 1))}</span>
            </div>
          ))}
          <div className="checkout-item">
            <span className="co-name">Subtotal</span>
            <span className="co-price">{formatPrice(subtotalAmount)}</span>
          </div>
          <div className="checkout-item">
            <span className="co-name">IVA (19%)</span>
            <span className="co-price">{formatPrice(ivaAmount)}</span>
          </div>
          <div className="checkout-item">
            <span className="co-name">Costo de envío</span>
            <span className="co-price">{shippingDisplay}</span>
          </div>
          <div className="checkout-item checkout-item--total">
            <span className="co-name">Total</span>
            <span className="co-price">{formatPrice(order.total ?? 0)}</span>
          </div>
        </div>
      </div>
      <div className="checkout-actions" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/checkout')}>
          VOLVER A REALIZAR EL PAGO
        </button>
      </div>
    </section>
  );
}

export default CheckoutError;
