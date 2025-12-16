import React from 'react';
import { CatalogProduct } from './ProductItem';
import './ProductItem.css';
import { formatPrice, getDisplayPrice } from '../utils/price';
import { getProductImages } from '../utils/productImages';
import placeholderProduct from '../assets/placeholder-product.png';

type Props = {
  product: CatalogProduct;
  onAdd: (p: CatalogProduct) => void;
  onClose: () => void;
};

export function ProductModal({ product, onAdd, onClose }: Props) {
  const images = React.useMemo(() => getProductImages(product), [product]);

  const [current, setCurrent] = React.useState(0);
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    if (!hasMultiple) return;
    const id = window.setInterval(() => setCurrent((idx) => (idx + 1) % images.length), 4500);
    return () => window.clearInterval(id);
  }, [hasMultiple, images.length]);

  const goPrev = () => setCurrent((idx) => (idx - 1 + images.length) % images.length);
  const goNext = () => setCurrent((idx) => (idx + 1) % images.length);

  const fallbackPlaceholder = '/images/placeholder.png';
  const placeholderSrc = placeholderProduct || fallbackPlaceholder;
  const displayedImage = images[current] || placeholderSrc;

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imageEl = event.currentTarget;
    imageEl.onerror = null;
    imageEl.src = fallbackPlaceholder;
  };

  const displayPrice = getDisplayPrice(product);
  const isAvailable = (product.stock ?? 0) > 0 && (product as any).isActive !== false;

  return (
    <div className="cat__modal" role="dialog" aria-modal="true">
      <div className="cat__modalCard">
        <div className="cat__modalImage">
          <div className="product-image-wrap product-image-wrap--regular" style={{ height: '400px' }}>
            <img
              className="product-image"
              src={displayedImage}
              alt={product.nombre}
              onError={handleImageError}
            />
            {hasMultiple && (
              <>
                <button className="cat__nav cat__nav--prev" type="button" onClick={goPrev} aria-label="Imagen anterior">&lt;</button>
                <button className="cat__nav cat__nav--next" type="button" onClick={goNext} aria-label="Imagen siguiente">&gt;</button>
              </>
            )}
          </div>
        </div>
        <div className="cat__modalInfo">
          <h3>{product.nombre}</h3>
          <p>{product.descripcion}</p>
          <div className="cat__modalRow">
            <div className="cat__price">
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
            <span>Stock: {product.stock}</span>
          </div>
          <div className="cat__modalActions">
            <button className="product-btn product-btn--primary" onClick={() => isAvailable && onAdd(product)} disabled={!isAvailable}>
              {isAvailable ? 'Agregar al carrito' : 'Sin stock'}
            </button>
            <button className="product-btn product-btn--ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
      <button className="cat__modalBackdrop" onClick={onClose} aria-label="Cerrar" />
    </div>
  );
}
