import React from 'react';
import './ProductItem.css';
import { formatPrice, getDisplayPrice } from '../utils/price';
import { getProductImages } from '../utils/productImages';

export type ProductLike = {
  id: string | number;
  nombre: string;
  precio: number;
  precioOferta?: number;
  descripcion?: string;
  imageUrl?: string;
  imagen?: string;
  images?: string[];
  stock?: number;
};
export type CatalogProduct = ProductLike & { descripcion?: string; stock?: number };

type Variant = 'catalog' | 'compact';

type Props = {
  product: ProductLike;
  variant?: Variant;
  actions?: React.ReactNode;
  onClick?: () => void;
};

export default function ProductItem({ product, variant = 'catalog', actions, onClick }: Props) {
  const resolvedImages = React.useMemo(() => getProductImages(product), [product]);
  const placeholderSrc = '/images/placeholder.png';
  const finalImageSrc = resolvedImages[0] || placeholderSrc;
  const hasLoggedProduct = React.useRef(false);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imageEl = event.currentTarget;
    imageEl.onerror = null;
    imageEl.src = placeholderSrc;
  };

  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (hasLoggedProduct.current) return;
    console.log('[dev] ProductItem product', product);
    hasLoggedProduct.current = true;
  }, [product]);

  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('[dev] ProductItem image src', finalImageSrc);
  }, [finalImageSrc]);

  const wrapperClass = `product-card ${variant === 'compact' ? 'product-card--compact' : 'product-card--catalog'} ${onClick ? 'product-card--clickable' : ''}`;
  const imgWrapClass = `product-image-wrap ${variant === 'compact' ? 'product-image-wrap--small' : 'product-image-wrap--regular'}`;

  const displayPrice = getDisplayPrice(product);
  const badgeLabel = displayPrice.hasDiscount ? 'Oferta' : (product as any).isFeatured ? 'Destacado' : null;

  return (
    <article className={wrapperClass} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : -1}>
      <div className={imgWrapClass}>
        <img className="product-image" src={finalImageSrc} alt={product.nombre} onError={handleImageError} />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.nombre}</h3>
        {badgeLabel && <span className="price__badge">{badgeLabel}</span>}
        <div className="product-price">
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
        {actions && <div className="product-actions">{actions}</div>}
      </div>
    </article>
  );
}
