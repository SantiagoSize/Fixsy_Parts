import React from 'react';

export type CatalogProduct = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
};

type Props = {
  product: CatalogProduct;
  onAdd: (p: CatalogProduct) => void;
  onView: (p: CatalogProduct) => void;
  highlight?: boolean;
};

export function ProductCard({ product, onAdd, onView, highlight }: Props) {
  return (
    <article className={`cat__card ${highlight ? 'cat__card--pulse' : ''}`}>
      <div className="cat__imageWrap">
        {product.imagen ? (
          <img className="cat__image" src={product.imagen} alt={product.nombre} />
        ) : (
          <div className="cat__placeholder">Sin imagen</div>
        )}
      </div>
      <div className="cat__info">
        <h3 className="cat__name">{product.nombre}</h3>
        <p className="cat__desc" title={product.descripcion}>
          {product.descripcion}
        </p>
        <div className="cat__row">
          <span className="cat__price">$ {Number(product.precio || 0).toLocaleString('es-CL')}</span>
          <div className="cat__actions">
            <button className="cat__btn cat__btn--add" onClick={() => onAdd(product)}>
              Anadir al carrito
            </button>
            <button className="cat__btn cat__btn--view" onClick={() => onView(product)}>
              Ver
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
