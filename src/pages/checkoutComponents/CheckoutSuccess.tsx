import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatPrice } from '../../utils/price';
import { OrderResponseDTO } from '../../types/order';
import './Checkout.css';

function CheckoutSuccess(): React.ReactElement | null {
  const { state } = useLocation();
  const order = state as OrderResponseDTO | undefined;

  // Si no hay orden, mostrar página de éxito genérica
  if (!order) {
    return (
      <section className="checkout checkout-success-page">
        <div className="success-header">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="success-title">¡Gracias por tu compra!</h1>
          <p className="success-message">
            Tu pedido ha sido procesado exitosamente. Revisa tu correo para más detalles.
          </p>
        </div>
        <div className="success-actions">
          <Link to="/history" className="btn-action success-btn-primary">
            Ver historial de compras
          </Link>
          <Link to="/catalogo" className="btn-action success-btn-secondary">
            Seguir comprando
          </Link>
        </div>
        <div className="success-thanks">
          <span className="success-heart">❤️</span>
          <p>¡Gracias por confiar en nosotros!</p>
        </div>
      </section>
    );
  }

  const items = order.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const subtotalAmount = order.subtotal ?? 0;
  const ivaAmount = order.iva ?? 0;
  const shippingAmount = order.shippingCost ?? 0;
  const shippingDisplay = shippingAmount > 0 ? formatPrice(shippingAmount) : 'Gratis';

  return (
    <section className="checkout checkout-success-page">
      {/* Header de éxito */}
      <div className="success-header">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="success-title">¡Pedido Confirmado!</h1>
        <p className="success-order-number">Orden #{order.id}</p>
        <p className="success-message">
          Gracias por tu compra en <strong>Fixsy Parts</strong>. Tu pedido ha sido recibido y está siendo procesado.
        </p>
      </div>

      {/* Resumen del pedido */}
      <div className="checkout-summary success-summary">
        <div className="success-info-row">
          <div className="success-info-item">
            <span className="success-info-label">Cliente</span>
            <span className="success-info-value">{order.userName || 'Invitado'}</span>
          </div>
          <div className="success-info-item">
            <span className="success-info-label">Email</span>
            <span className="success-info-value">{order.userEmail}</span>
          </div>
        </div>
        <div className="success-info-row">
          <div className="success-info-item full-width">
            <span className="success-info-label">Dirección de envío</span>
            <span className="success-info-value">{order.shippingAddress}</span>
          </div>
        </div>

        <h2 className="success-products-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Productos ({totalItems})
        </h2>

        <div className="success-products-list">
          {items.map((it) => (
            <div key={it.id} className="success-product-item">
              <div className="success-product-info">
                <span className="success-product-name">{it.productName}</span>
                <span className="success-product-qty">Cantidad: {it.quantity}</span>
              </div>
              <span className="success-product-price">{formatPrice((it.unitPrice || 0) * (it.quantity || 1))}</span>
            </div>
          ))}
        </div>

        <div className="success-totals">
          <div className="success-total-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalAmount)}</span>
          </div>
          <div className="success-total-row">
            <span>IVA (19%)</span>
            <span>{formatPrice(ivaAmount)}</span>
          </div>
          <div className="success-total-row">
            <span>Envío</span>
            <span>{shippingDisplay}</span>
          </div>
          <div className="success-total-row success-total-final">
            <span>Total</span>
            <span>{formatPrice(order.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Mensaje adicional */}
      <div className="success-next-steps">
        <h3>¿Qué sigue?</h3>
        <ul>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Recibirás un email de confirmación en <strong>{order.userEmail}</strong>
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Te notificaremos cuando tu pedido sea despachado
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            Podrás hacer seguimiento de tu envío desde el historial
          </li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="success-actions">
        <Link to="/history" className="btn-action success-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Ver historial de compras
        </Link>
        <Link to="/catalogo" className="btn-action success-btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Seguir comprando
        </Link>
        <button type="button" className="btn-action success-btn-outline" onClick={() => window.print()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Imprimir comprobante
        </button>
      </div>

      {/* Gracias */}
      <div className="success-thanks">
        <span className="success-heart">❤️</span>
        <p>¡Gracias por confiar en nosotros!</p>
      </div>
    </section>
  );
}

export default CheckoutSuccess;
