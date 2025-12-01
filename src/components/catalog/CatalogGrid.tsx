import React from 'react';
import CatalogProductCard, { CatalogCardProduct, CatalogCardVariant } from './CatalogProductCard';

type Props = {
  products: CatalogCardProduct[];
  loading?: boolean;
  emptyMessage?: string;
  onAdd: (product: CatalogCardProduct) => void;
  onView?: (product: CatalogCardProduct) => void;
  viewMode?: 'grid' | 'list';
};

export default function CatalogGrid({ products, loading, emptyMessage, onAdd, onView, viewMode = 'grid' }: Props) {
  if (!loading && products.length === 0) {
    return <div className="catalog-empty">{emptyMessage || 'No se encontraron productos con estos filtros.'}</div>;
  }

  const variant: CatalogCardVariant = viewMode === 'list' ? 'list' : 'grid';
  const gridClass = `catalog-grid ${viewMode === 'list' ? 'catalog-grid--list' : ''}`;

  return (
    <div className={gridClass}>
      {products.map(product => (
        <CatalogProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onView={onView}
          variant={variant}
        />
      ))}
    </div>
  );
}
