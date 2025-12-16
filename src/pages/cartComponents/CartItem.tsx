import React from 'react';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import { getProductImages } from '../../utils/productImages';

export type CartItemData = {
  id: string | number;
  nombre: string;
  precio: number;
  precioOferta?: number;
  cantidad: number;
  stock: number;
  imagen?: string;
};

type Props = {
  product: CartItemData;
  onMinus: () => void;
  onPlus: () => void;
  onRemove: () => void;
};

function CartItem({ product, onMinus, onPlus, onRemove }: Props): React.ReactElement {
  const resolvedImages = React.useMemo(() => getProductImages(product), [product]);
  const placeholderSrc = '/images/placeholder.png';
  const imgSrc = resolvedImages[0] || product.imagen || placeholderSrc;
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imageEl = event.currentTarget;
    imageEl.onerror = null;
    imageEl.src = placeholderSrc;
  };
  const displayPrice = getDisplayPrice(product);

  return (
    <div className="cart-item">
      <div className="cart-item__main">
        <div className="cart-item__image-wrapper">
          <img src={imgSrc} alt={product.nombre} onError={handleImageError} />
        </div>
        <div className="cart-item__info">
          <h3 className="cart-item__name">{product.nombre}</h3>
          <div className="cart-item__price">
            {displayPrice.hasDiscount ? (
              <div className="price price--with-discount">
                <span className="price__original">{formatPrice(displayPrice.original)}</span>
                <span className="price__final">{formatPrice(displayPrice.final)}</span>
                {displayPrice.discountPercentage && (
                  <span className="price__badge">-{displayPrice.discountPercentage}%</span>
                )}
              </div>
            ) : (
              <div className="price">{formatPrice(displayPrice.final)}</div>
            )}
          </div>
        </div>
      </div>
      <div className="cart-item__actions">
        <div className="cart-item__quantity">
          <button className="qty-btn" onClick={onMinus} aria-label="Disminuir cantidad">-</button>
          <input
            className="qty-input"
            type="text"
            inputMode="numeric"
            min={1}
            max={product.stock}
            value={product.cantidad}
            readOnly
            aria-readonly="true"
          />
          <button className="qty-btn" onClick={onPlus} aria-label="Aumentar cantidad">+</button>
        </div>
        <button className="cart-item__remove" onClick={onRemove}>Eliminar del carrito</button>
      </div>
    </div>
  );
}

export default CartItem;
