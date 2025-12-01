import React from 'react';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import { CatalogProduct } from '../ProductItem';

export type CatalogCardVariant = 'grid' | 'list';

export type CatalogCardProduct = CatalogProduct & {
  categoria?: string;
  tags?: string[];
  isOffer?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
};

type Props = {
  product: CatalogCardProduct;
  onAdd: (product: CatalogCardProduct) => void;
  onView?: (product: CatalogCardProduct) => void;
  variant?: CatalogCardVariant;
};

function buildPlaceholder(nombre: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='260'><rect width='100%' height='100%' rx='18' ry='18' fill='%232a2a2a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23898ca0' font-size='14'>${nombre || 'Producto'}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function CatalogProductCard({ product, onAdd, onView, variant = 'grid' }: Props) {
  const images = React.useMemo(() => {
    const list = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (list.length === 0 && product.imagen) list.push(product.imagen);
    return list;
  }, [product.images, product.imagen]);

  const imageSrc = images[0] || buildPlaceholder(product.nombre);
  const displayPrice = getDisplayPrice(product as any);
  const hasOffer = Boolean(product.isOffer || displayPrice.hasDiscount);
  const isAvailable = (product.isActive ?? true) && (product.stock ?? 0) > 0;
  const tagList = Array.isArray(product.tags) ? product.tags : [];
  const isList = variant === 'list';
  const isGrid = variant === 'grid';
  const discountPct = displayPrice.discountPercentage ?? (
    displayPrice.hasDiscount && displayPrice.original > 0
      ? Math.round((1 - displayPrice.final / displayPrice.original) * 100)
      : undefined
  );

  const handleAdd = () => {
    if (!isAvailable) return;
    onAdd(product);
  };

  const cardClass = `catalog-card ${isList ? 'catalog-card--list' : 'catalog-card--grid'}`;

  return (
    <article className={cardClass}>
      <div className="catalog-card__imageWrap">
        {hasOffer && <span className="catalog-card__badge">Oferta</span>}
        <img src={imageSrc} alt={product.nombre} className="catalog-card__image" />
      </div>

      <div className="catalog-card__content">
        <h3 className="catalog-card__title">{product.nombre}</h3>

        {isGrid ? (
          <div className="catalog-card__priceBlock">
            <div className="catalog-card__row catalog-card__row--top">
              <div className="catalog-card__cell">
                <span className="catalog-card__priceFinal">{formatPrice(displayPrice.final)}</span>
                {displayPrice.hasDiscount && typeof discountPct === 'number' && (
                  <span className="catalog-card__badgePct">-{discountPct}%</span>
                )}
              </div>
              <div className="catalog-card__cell catalog-card__cell--right">
                <span className="catalog-card__id">ID: {product.id}</span>
              </div>
            </div>
            <div className="catalog-card__row catalog-card__row--bottom">
              <div className="catalog-card__cell">
                <span className="catalog-card__priceOriginal">
                  {displayPrice.hasDiscount ? formatPrice(displayPrice.original) : formatPrice(displayPrice.final)}
                </span>
              </div>
              <div className="catalog-card__cell catalog-card__cell--right">
                <span className="catalog-card__stock catalog-card__stock--grid">
                  Stock: {isAvailable ? product.stock ?? 0 : 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="catalog-card__header">
              <span className="catalog-chip catalog-chip--category">{product.categoria || 'Categoría'}</span>
            </div>
            {product.descripcion && <p className="catalog-card__desc">{product.descripcion}</p>}
            <div className="catalog-card__priceRow">
              {displayPrice.hasDiscount && (
                <>
                  <span className="catalog-card__priceOriginal">{formatPrice(displayPrice.original)}</span>
                  {typeof discountPct === 'number' && <span className="catalog-card__badgePct">-{discountPct}%</span>}
                </>
              )}
              <span className="catalog-card__priceFinal">{formatPrice(displayPrice.final)}</span>
            </div>
            <p className="catalog-card__stock">
              {isAvailable ? `Stock: ${product.stock ?? 0}` : 'Sin stock'}
            </p>
            {isList && tagList.length > 0 && (
              <div className="catalog-card__tags">
                {tagList.slice(0, 2).map(tag => (
                  <span key={tag} className="catalog-chip catalog-chip--tag">#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isList && (
        <aside className="catalog-card__aside">
          <div className="catalog-card__priceRow catalog-card__priceRow--aside">
            {displayPrice.hasDiscount && (
              <>
                <span className="catalog-card__priceOriginal">{formatPrice(displayPrice.original)}</span>
                {typeof discountPct === 'number' && <span className="catalog-card__badgePct">-{discountPct}%</span>}
              </>
            )}
            <span className="catalog-card__priceFinal">{formatPrice(displayPrice.final)}</span>
          </div>
          <p className="catalog-card__stock catalog-card__stock--aside">
            {isAvailable ? `Stock: ${product.stock ?? 0}` : 'Sin stock'}
          </p>
          <div className="catalog-card__actions">
            <button
              type="button"
              className="catalog-card__button catalog-card__button--primary"
              onClick={handleAdd}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Agregar al carrito' : 'Sin stock'}
            </button>
            {onView && (
              <button
                type="button"
                className="catalog-card__button catalog-card__button--green"
                onClick={() => onView(product)}
              >
                Ver detalle
              </button>
            )}
          </div>
        </aside>
      )}

      {isGrid && (
        <div className="catalog-card__actions catalog-card__actions--grid">
          <button
            type="button"
            className="catalog-card__button catalog-card__button--primary"
            onClick={handleAdd}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Agregar al carrito' : 'Sin stock'}
          </button>
          {onView && (
            <button
              type="button"
              className="catalog-card__button catalog-card__button--green"
              onClick={() => onView(product)}
            >
              Ver detalle
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default CatalogProductCard;
