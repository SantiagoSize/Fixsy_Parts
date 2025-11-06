import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useMessages } from '../../context/MessagesContext';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

function Checkout(): React.ReactElement {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { send } = useMessages();

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
      <div style={{ marginTop: 12 }}>
        <button onClick={() => {
          if (!user) return;
          const orderItems = items.map(it => ({ productId: Number(it.product.id), name: it.product.nombre, quantity: it.quantity, price: it.product.precio }));
          addOrder({ userEmail: user.email, items: orderItems });
          try { send(user.email, `Compra completada. Gracias por tu compra por $ ${total.toLocaleString('es-CL')}.`); } catch {}
          clearCart();
          alert('Compra simulada completada. Revisa tu bandeja de mensajes.');
        }}>
          Completar compra (simulado)
        </button>
      </div></section>
  );
}

export default Checkout;

