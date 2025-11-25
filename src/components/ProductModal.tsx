import React from 'react';
import { CatalogProduct } from './ProductCard';

type Props = {
  product: CatalogProduct;
  onAdd: (p: CatalogProduct) => void;
  onClose: () => void;
};

export function ProductModal({ product, onAdd, onClose }: Props) {
  return (
    <div className="cat__modal" role="dialog" aria-modal="true">
      <div className="cat__modalCard">
        <div className="cat__modalImage">
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} />
          ) : (
            <div className="cat__placeholder" style={{ maxHeight: 420 }}>Sin imagen</div>
          )}
        </div>
        <div className="cat__modalInfo">
          <h3>{product.nombre}</h3>
          <p>{product.descripcion}</p>
          <div className="cat__modalRow">
            <span className="cat__price">$ {Number(product.precio || 0).toLocaleString('es-CL')}</span>
            <span>Stock: {product.stock}</span>
          </div>
          <div className="cat__modalActions">
            <button className="cat__btn cat__btn--add" onClick={() => onAdd(product)}>Anadir al carrito</button>
            <button className="cat__btn cat__btn--view" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
      <button className="cat__modalBackdrop" onClick={onClose} aria-label="Cerrar" />
    </div>
  );
}
