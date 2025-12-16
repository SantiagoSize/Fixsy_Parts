import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CartNotification.css';

export type CartNotificationData = {
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
};

type CartNotificationProps = {
  visible: boolean;
  data: CartNotificationData | null;
  onClose: () => void;
};

export default function CartNotification({ visible, data, onClose }: CartNotificationProps) {
  const navigate = useNavigate();
  const placeholderSrc = '/images/placeholder.png';

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!data) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className={`cart-notification ${visible ? 'cart-notification--visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="cart-notification__content">
        {/* Ícono de éxito animado */}
        <div className="cart-notification__icon-wrap">
          <svg className="cart-notification__check" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="cart-notification__check-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="cart-notification__check-mark" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        {/* Info del producto */}
        <div className="cart-notification__info">
          <p className="cart-notification__title">¡Agregado al carrito!</p>
          <div className="cart-notification__product">
            {data.productImage && (
            <img 
              src={data.productImage} 
              alt={data.productName}
              className="cart-notification__product-img"
              onError={(e) => {
                const imgEl = e.currentTarget as HTMLImageElement;
                imgEl.onerror = null;
                imgEl.src = placeholderSrc;
              }}
            />
            )}
            <div className="cart-notification__product-details">
              <span className="cart-notification__product-name">{data.productName}</span>
              <span className="cart-notification__product-meta">
                {data.quantity > 1 ? `${data.quantity} unidades` : '1 unidad'} • {formatPrice(data.price * data.quantity)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="cart-notification__actions">
          <button 
            type="button" 
            className="cart-notification__btn cart-notification__btn--primary"
            onClick={handleViewCart}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Ver carrito
          </button>
          <button 
            type="button" 
            className="cart-notification__btn cart-notification__btn--ghost"
            onClick={onClose}
          >
            Seguir comprando
          </button>
        </div>

        {/* Botón cerrar */}
        <button 
          type="button" 
          className="cart-notification__close"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Barra de progreso */}
        <div className="cart-notification__progress">
          <div className={`cart-notification__progress-bar ${visible ? 'cart-notification__progress-bar--active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}
