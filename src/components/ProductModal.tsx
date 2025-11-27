import React from 'react';
import { CatalogProduct } from './ProductItem';
import './ProductItem.css';
import { formatPrice, getDisplayPrice } from '../utils/price';

type Props = {
  product: CatalogProduct;
  onAdd: (p: CatalogProduct) => void;
  onClose: () => void;
};

export function ProductModal({ product, onAdd, onClose }: Props) {
  const images = React.useMemo(() => {
    const list = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (list.length === 0 && product.imagen) list.push(product.imagen);
    return list;
  }, [product.images, product.imagen]);

  const [current, setCurrent] = React.useState(0);
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    if (!hasMultiple) return;
    const id = window.setInterval(() => setCurrent((idx) => (idx + 1) % images.length), 4500);
    return () => window.clearInterval(id);
  }, [hasMultiple, images.length]);

  const goPrev = () => setCurrent((idx) => (idx - 1 + images.length) % images.length);
  const goNext = () => setCurrent((idx) => (idx + 1) % images.length);

  const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='14'>Sin imagen</text></svg>"
  )}`;

  const displayPrice = getDisplayPrice(product);

  return (
    <div className="cat__modal" role="dialog" aria-modal="true">
      <div className="cat__modalCard">
        <div className="cat__modalImage">
          <div className="product-image-wrap product-image-wrap--regular" style={{ height: '400px' }}>
            <img className="product-image" src={images[current] || placeholderSvg} alt={product.nombre} />
            {hasMultiple && (
              <>
                <button className="cat__nav cat__nav--prev" type="button" onClick={goPrev} aria-label="Imagen anterior">‹</button>
                <button className="cat__nav cat__nav--next" type="button" onClick={goNext} aria-label="Imagen siguiente">›</button>
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
            <button className="product-btn product-btn--primary" onClick={() => onAdd(product)}>Añadir al carrito</button>
            <button className="product-btn product-btn--ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
      <button className="cat__modalBackdrop" onClick={onClose} aria-label="Cerrar" />
    </div>
  );
}
