import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAddresses } from '../../hooks/useAddresses';
import { estimateShipping, ShippingAddress } from '../../utils/shipping';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './CartView.css';
import CartItem, { CartItemData } from './CartItem';

// Suposicion: el subtotal del carrito se considera neto (sin IVA). El total se calcula sumando IVA + envio.
function CartView(): React.ReactElement {
  const { items, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addresses } = useAddresses(user?.id || 'guest');

  const cartProducts: CartItemData[] = items.map((it) => ({
    id: it.productId,
    nombre: it.product.nombre,
    precio: it.product.precio,
    precioOferta: (it.product as any).precioOferta,
    cantidad: it.quantity,
    stock: it.product.stock,
    imagen: Array.isArray(it.product.images) && it.product.images[0] ? it.product.images[0] : it.product.imagen,
  }));

  const subtotal = items.reduce((sum, it) => {
    const display = getDisplayPrice({ precio: it.product.precio, precioOferta: (it.product as any).precioOferta });
    const unit = it.unitPrice ?? display.final;
    return sum + unit * it.quantity;
  }, 0);

  const shippingAddress: ShippingAddress | null = addresses[0]
    ? { region: addresses[0].region, provincia: addresses[0].province, comuna: addresses[0].commune }
    : null;
  const shippingEstimate = shippingAddress ? estimateShipping(shippingAddress, subtotal) : null;
  const shippingPrice = shippingEstimate?.price ?? 0;
  const netSubtotal = subtotal;
  const iva = Math.round(netSubtotal * 0.19);
  const total = netSubtotal + iva + shippingPrice;
  const totalItems = cartProducts.reduce((acc, item) => acc + item.cantidad, 0);
  const goAddresses = () => navigate('/profile');

  const handleMinus = (p: CartItemData) => {
    if (p.cantidad > 1) updateQuantity(p.id, p.cantidad - 1);
    else alert('Desea eliminar del carrito?');
  };

  const handlePlus = (p: CartItemData) => {
    if (p.cantidad + 1 > p.stock) {
      alert('Cantidad supera el stock disponible');
      return;
    }
    updateQuantity(p.id, p.cantidad + 1);
  };

  return (
    <section className="cart">
      <h1 className="cart__title">Carrito de Compras</h1>
      <div className="cart-layout">
        <div className="cart__list">
          {cartProducts.length === 0 && (
            <div className="cart__empty">Tu carrito esta vacio.</div>
          )}
          {cartProducts.map((p) => (
            <CartItem
              key={p.id}
              product={p}
              onMinus={() => handleMinus(p)}
              onPlus={() => handlePlus(p)}
              onRemove={() => removeFromCart(p.id)}
            />
          ))}
        </div>
        <aside className="cart__summary">
          <h2>Resumen del Pedido</h2>

          <div className="summary-items">
            <div className="summary-items__title">
              Articulos en el pedido ({totalItems})
            </div>
            <ul className="summary-items__list">
              {cartProducts.map((item) => (
                <li key={item.id} className="summary-items__item">
                  {item.cantidad} x {item.nombre} (ID: {item.id})
                </li>
              ))}
            </ul>
          </div>

          <div className="summary-row">
            <div className="summary-row__label">Subtotal (sin IVA)</div>
            <div className="summary-row__value">{formatPrice(netSubtotal)}</div>
          </div>

          <div className="summary-row">
            <div className="summary-row__label">IVA (19%)</div>
            <div className="summary-row__value">{formatPrice(iva)}</div>
          </div>

          <div className="summary-row">
            <div className="summary-row__label">Envio estimado</div>
            <div className="summary-row__value">
              <div>{shippingEstimate ? (shippingPrice === 0 ? 'Gratis' : formatPrice(shippingPrice)) : 'Por estimar'}</div>
              {shippingEstimate && (
                <div className="shipping-extra">
                  Chilexpress (estimado) - {shippingEstimate.label} - {shippingEstimate.eta}
                </div>
              )}
            </div>
          </div>
          {!shippingEstimate && <button className="address-btn" type="button" onClick={goAddresses}>Agregar direccion de envio</button>}

          <div className="summary-row summary-row--total">
            <div className="summary-row__label">Total</div>
            <div className="summary-row__value">{formatPrice(total)}</div>
          </div>

          <button className="pay-btn" onClick={() => navigate('/checkout')}>Pagar</button>
        </aside>
      </div>
    </section>
  );
}

export default CartView;
