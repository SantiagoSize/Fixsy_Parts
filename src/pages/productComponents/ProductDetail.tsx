import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, type Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

function ProductDetail(): React.ReactElement {
  const { id } = useParams();
  const product: Product | undefined = id ? getProductById(Number(id)) : undefined;
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  if (!product) {
    return <div className="pd-container">Producto no encontrado.</div>;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'>Imagen</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  // Cantidad disponible considerando lo que ya hay en el carrito
  const inCartQty = items.find(ci => ci.product.id === product.id)?.quantity ?? 0;
  const available = Math.max(0, product.stock - inCartQty);

  // Añadir al carrito: mostrar alerta si no hay stock suficiente
  const handleAdd = () => {
    if (available < 1) {
      alert('No hay stock disponible para este producto');
      return;
    }
    addToCart(product, 1);
  };

  // Comprar ahora: avanzar siempre, sin alertas
  const handleBuyNow = () => {
    if (available >= 1) {
      addToCart(product, 1);
    }
    navigate('/checkout');
  };

  return (
    <section className="pd-container">
      <div className="pd-grid">
        <div className="pd-image">
          <img src={product.imagen || placeholderSrc} alt={product.nombre} />
        </div>
        <div className="pd-info">
          <h1 className="pd-title">{product.nombre}</h1>
          <p className="pd-desc">{product.descripcion}</p>
          <p className="pd-price">$ {product.precio.toLocaleString('es-CL')}</p>
          <p className="pd-stock">Stock: {product.stock} unid.</p>
          <div className="pd-tags">
            {product.tags.map((t) => (
              <span key={t} className="pd-tag">{t}</span>
            ))}
          </div>
          <div className="pd-actions">
            <button className="pd-btn add" onClick={handleAdd}>Añadir al carrito</button>
            <button className="pd-btn buy" onClick={handleBuyNow}>Comprar ahora</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
