import React from 'react';
import { useCart } from '../../context/CartContext';
import Alert from '../../components/Alert';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './Checkout.css';

function Checkout(): React.ReactElement {
  const { items, clearCart } = useCart();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [payment, setPayment] = React.useState('tarjeta');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const total = items.reduce((sum, it) => {
    const display = getDisplayPrice(it.product as any);
    return sum + display.final * it.quantity;
  }, 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!items.length) { setError('Tu carrito está vacío.'); return; }
    if (!name || !email || !address) { setError('Completa todos los campos.'); return; }
    if (!/.+@.+\..+/.test(email)) { setError('Ingresa un email válido.'); return; }
    setLoading(true);
    setTimeout(() => {
      setSuccess('Compra registrada (demo). Revisa tu correo para el comprobante.');
      clearCart();
      setLoading(false);
    }, 500);
  };

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      <p>Items en carrito: {items.length}</p>
      <div className="checkout-list">
        {items.map((it) => (
          <div key={it.product.id} className="checkout-item">
            <span className="co-name">{it.product.nombre}</span>
            <span className="co-qty">x{it.quantity}</span>
            <span className="co-price">{formatPrice(getDisplayPrice(it.product as any).final * it.quantity)}</span>
          </div>
        ))}
      </div>
      <p>Total estimado: {formatPrice(total)}</p>

      <form className="checkout-form" onSubmit={onSubmit}>
        <div className="co-field">
          <label htmlFor="name">Nombre completo</label>
          <input id="name" className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="email">Email</label>
          <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="address">Dirección</label>
          <input id="address" className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className="co-field">
          <label htmlFor="payment">Método de pago</label>
          <select id="payment" className="form-input" value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <button type="submit" className="btn-primary form-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </section>
  );
}

export default Checkout;
