import React from 'react';
import './ProductItem.css';
import { formatPrice, getDisplayPrice } from '../utils/price';

export type ProductLike = {
  id: string | number;
  nombre: string;
  precio: number;
  precioOferta?: number;
  descripcion?: string;
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
  const images = React.useMemo(() => {
    const list = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (list.length === 0 && product.imagen) list.push(product.imagen);
    return list;
  }, [product.images, product.imagen]);
  const imageSrc = images[0] || '';

  const wrapperClass = `product-card ${variant === 'compact' ? 'product-card--compact' : 'product-card--catalog'} ${onClick ? 'product-card--clickable' : ''}`;
  const imgWrapClass = `product-image-wrap ${variant === 'compact' ? 'product-image-wrap--small' : 'product-image-wrap--regular'}`;

  const placeholderSvg = React.useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='14'>Sin imagen</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  const displayPrice = getDisplayPrice(product);
  const badgeLabel = displayPrice.hasDiscount ? 'Oferta' : (product as any).isFeatured ? 'Destacado' : null;

  return (
    <article className={wrapperClass} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : -1}>
      <div className={imgWrapClass}>
        <img className="product-image" src={imageSrc || placeholderSvg} alt={product.nombre} />
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
