import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartView.css';

export interface CartProduct {
  id: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen?: string;
}

function CartView(): React.ReactElement {
  const { items, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='18'>Producto</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const cartProducts: CartProduct[] = items.map(it => ({
    id: it.product.id,
    nombre: it.product.nombre,
    precio: it.product.precio,
    cantidad: it.quantity,
    stock: it.product.stock,
    imagen: it.product.imagen,
  }));

  const subtotal = cartProducts.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const handleSetCantidad = (p: CartProduct, next: number) => {
    if (Number.isNaN(next)) return;
    if (next < 1) {
      alert('¿Desea eliminar del carrito?');
      return; // no aceptar 0
    }
    if (next > p.stock) {
      alert('Cantidad supera el stock disponible');
      return; // no aceptar más del stock
    }
    updateQuantity(p.id, next);
  };

  const handleMinus = (p: CartProduct) => {
    if (p.cantidad > 1) updateQuantity(p.id, p.cantidad - 1);
    else alert('¿Desea eliminar del carrito?');
  };

  const handlePlus = (p: CartProduct) => {
    if (p.cantidad + 1 > p.stock) {
      alert('Cantidad supera el stock disponible');
      return;
    }
    updateQuantity(p.id, p.cantidad + 1);
  };

  return (
    <section className="cart">
      <h1 className="cart__title">Carrito de Compras</h1>
      <div className="cart__grid">
        <div className="cart__list">
          {cartProducts.length === 0 && (
            <div className="cart__empty">Tu carrito está vacío.</div>
          )}
          {cartProducts.map((p) => (
            <article key={p.id} className="hex-card">
              <img
                className="hex-card__image"
                src={p.imagen || placeholderSrc}
                alt={p.nombre}
              />
              <div className="hex-card__content">
                <div className="hex-card__info">
                  <h3 className="hex-card__name">{p.nombre}</h3>
                  <p className="hex-card__price">$ {p.precio.toLocaleString('es-CL')}</p>
                </div>
                <div className="hex-card__qty">
                  <button className="qty-btn" onClick={() => handleMinus(p)} aria-label="Disminuir">–</button>
                  <input
                    className="qty-input"
                    type="number"
                    min={1}
                    max={p.stock}
                    value={p.cantidad}
                    onChange={(e) => handleSetCantidad(p, Number(e.target.value))}
                  />
                  <button className="qty-btn" onClick={() => handlePlus(p)} aria-label="Aumentar">+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(p.id)}>Eliminar del carrito</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="cart__summary">
          <h2>Resumen del Pedido</h2>
          <div className="summary__row"><span>Envío</span><span>Por estimar</span></div>
          <button className="address-btn" type="button">Agregar dirección de envío</button>
          <div className="summary__row"><span>Subtotal</span><span>$ {subtotal.toLocaleString('es-CL')}</span></div>
          <div className="summary__total"><span>Total</span><span>$ {subtotal.toLocaleString('es-CL')}</span></div>
          <button className="pay-btn" onClick={() => navigate('/checkout')}>Pagar</button>
        </aside>
      </div>

      {/* Para cambiar imágenes: reemplaza `imagen` en src/data/products.ts con rutas como '/images/mi-producto.png' y coloca archivos en public/images. */}
    </section>
  );
}

export default CartView;

