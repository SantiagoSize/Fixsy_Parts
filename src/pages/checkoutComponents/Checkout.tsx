import React from 'react';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

function Checkout(): React.ReactElement {
  const { items } = useCart();

  const total = items.reduce((sum, it) => sum + it.product.precio * it.quantity, 0);

  return (
    <section className="checkout">
      <h1>Checkout (en construcción)</h1>
      <p>Items en carrito: {items.length}</p>
      <div className="checkout-list">
        {items.map((it) => (
          <div key={it.product.id} className="checkout-item">
            <span className="co-name">{it.product.nombre}</span>
            <span className="co-qty">x{it.quantity}</span>
            <span className="co-price">$ {(it.product.precio * it.quantity).toLocaleString('es-CL')}</span>
          </div>
        ))}
      </div>
      <p>Total estimado: $ {total.toLocaleString('es-CL')}</p>
      <div className="checkout-placeholder">Aquí irá el flujo de pago.</div>
    </section>
  );
}

export default Checkout;
