import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAddresses } from '../../hooks/useAddresses';
import { estimateShipping, ShippingAddress } from '../../utils/shipping';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './CartView.css';
import CartItem, { CartItemData } from './CartItem';
import { CHILE_REGIONES } from '../../data/chileDpa';

const REGION_NAMES = CHILE_REGIONES.map((region) => region.nombre);

function provincesFor(regionName: string): string[] {
  const region = CHILE_REGIONES.find((regionItem) => regionItem.nombre === regionName);
  return region ? region.provincias.map((province) => province.nombre) : [];
}

function communesFor(regionName: string, provinceName: string): string[] {
  const region = CHILE_REGIONES.find((regionItem) => regionItem.nombre === regionName);
  const province = region?.provincias.find((provinceItem) => provinceItem.nombre === provinceName);
  return province ? province.comunas.map((comuna) => comuna.nombre) : [];
}

// Suposicion: el subtotal del carrito se considera neto (sin IVA). El total se calcula sumando IVA + envio.
function CartView(): React.ReactElement {
  const { items, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addresses } = useAddresses(user?.id || 'guest');

  const cartProducts: CartItemData[] = items.map((it) => ({
    id: it.productId,
    nombre: it.product.nombre,
    precio: (it.product as any).precioNormal ?? it.product.precio ?? 0,
    precioOferta: (it.product as any).precioOferta,
    cantidad: it.quantity,
    stock: it.product.stock ?? 0,
    imagen: Array.isArray(it.product.images) && it.product.images[0] ? it.product.images[0] : (it.product as any).imageUrl || it.product.imagen,
  }));

  const subtotal = items.reduce((sum, it) => {
    const display = getDisplayPrice({
      precioNormal: (it.product as any).precioNormal ?? it.product.precio ?? 0,
      precioOferta: (it.product as any).precioOferta,
    });
    const unit = it.unitPrice ?? display.final;
    return sum + unit * it.quantity;
  }, 0);

  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [guestAddress, setGuestAddress] = React.useState<ShippingAddress | null>(null);
  const [guestSurveyOpen, setGuestSurveyOpen] = React.useState(false);
  const [guestForm, setGuestForm] = React.useState({
    region: '',
    province: '',
    commune: '',
  });
  const [guestError, setGuestError] = React.useState<string | null>(null);

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
  const mapToShippingAddress = (addr: typeof addresses[number]): ShippingAddress => ({
    region: addr.region,
    provincia: addr.province,
    comuna: addr.commune,
  });

  React.useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }
    setSelectedAddressId((prev) => {
      if (prev && addresses.some((addr) => addr.id === prev)) {
        return prev;
      }
      return addresses[0].id;
    });
  }, [addresses]);

  React.useEffect(() => {
    if (user) {
      setGuestSurveyOpen(false);
      setGuestError(null);
    }
  }, [user]);

  const closeGuestSurvey = () => {
    setGuestSurveyOpen(false);
    setGuestError(null);
  };

  const shippingAddress: ShippingAddress | null = user
    ? (selectedAddress ? mapToShippingAddress(selectedAddress) : null)
    : guestAddress;
  const shippingEstimate = shippingAddress ? estimateShipping(shippingAddress, subtotal) : null;
  const shippingPrice = shippingEstimate?.price ?? 0;
  const netSubtotal = subtotal;
  const iva = Math.round(netSubtotal * 0.19);
  const total = netSubtotal + iva + shippingPrice;
  const totalItems = cartProducts.reduce((acc, item) => acc + item.cantidad, 0);
  const goAddresses = () => navigate('/profile');

  const provs = provincesFor(guestForm.region);
  const comms = communesFor(guestForm.region, guestForm.province);

  const handleGuestFormChange = (field: keyof typeof guestForm, value: string) => {
    setGuestForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'region') {
        next.province = '';
        next.commune = '';
      } else if (field === 'province') {
        next.commune = '';
      }
      return next;
    });
    setGuestError(null);
  };

  const handleGuestSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.region.trim() || !guestForm.province.trim() || !guestForm.commune.trim()) {
      setGuestError('Completa región, provincia y comuna para calcular el envío.');
      return;
    }
    setGuestAddress({
      region: guestForm.region.trim(),
      provincia: guestForm.province.trim(),
      comuna: guestForm.commune.trim(),
    });
    closeGuestSurvey();
  };

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
                <div className="shipping-extra shipping-extra--center">
                  <span>{shippingEstimate.label}</span>
                  <span>{shippingEstimate.eta}</span>
                </div>
              )}
            </div>
          </div>
          {!shippingEstimate && (
            user
              ? <button className="address-btn" type="button" onClick={goAddresses}>Agregar dirección de envío</button>
              : <button className="address-btn" type="button" onClick={() => setGuestSurveyOpen(true)}>Completar dirección</button>
          )}

          {!user && guestAddress && (
            <div className="summary-row summary-row--note">
              <div className="summary-row__label">Invitado</div>
              <div className="summary-row__value">
                {`${guestAddress.region} · ${guestAddress.comuna}`}
                <button className="address-btn" type="button" onClick={() => setGuestSurveyOpen(true)}>
                  Cambiar dirección
                </button>
              </div>
            </div>
          )}

          {user && addresses.length > 0 && (
            <div className="address-selection">
              <h3>Dirección de envío</h3>
              <div className="address-selection__list">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`address-selection__option ${selectedAddressId === addr.id ? 'is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping-address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div>
                      <strong>{addr.alias || 'Sin alias'}</strong>
                      <p>{addr.address} {addr.number}</p>
                      <p>{addr.region} · {addr.province} · {addr.commune}</p>
                      {addr.comment && <p className="address-selection__note">{addr.comment}</p>}
                    </div>
                  </label>
                ))}
              </div>
              <button className="address-btn" type="button" onClick={goAddresses}>Gestionar direcciones</button>
            </div>
          )}

          <div className="summary-row summary-row--total">
            <div className="summary-row__label">Total</div>
            <div className="summary-row__value">{formatPrice(total)}</div>
          </div>

          <button
            className={`checkout-btn ${items.length > 0 ? 'active' : 'disabled'}`}
            disabled={items.length === 0}
            onClick={() => {
              if (items.length === 0) return;
              navigate('/checkout');
            }}
            type="button"
          >
            Pagar
          </button>
        </aside>
      </div>

      {guestSurveyOpen && !user && (
        <div className="guest-survey" role="dialog" aria-modal="true">
          <div className="guest-survey__backdrop" onClick={closeGuestSurvey} />
          <div className="guest-survey__panel">
            <div className="guest-survey__header">
              <div>
                <h3>Estimamos tu envío</h3>
                <p className="guest-survey__subtext">Selecciona región, provincia y comuna para calcular el costo estimado.</p>
              </div>
            </div>
            <form onSubmit={handleGuestSurveySubmit} className="guest-survey__form">
              <label>
                Región
                <select
                  value={guestForm.region}
                  onChange={(e) => handleGuestFormChange('region', e.target.value)}
                >
                  <option value="">Seleccione región</option>
                  {REGION_NAMES.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label>
                Provincia
                <select
                  value={guestForm.province}
                  onChange={(e) => handleGuestFormChange('province', e.target.value)}
                  disabled={!guestForm.region}
                >
                  <option value="">Seleccione provincia</option>
                  {provs.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </label>
              <label>
                Comuna
                <select
                  value={guestForm.commune}
                  onChange={(e) => handleGuestFormChange('commune', e.target.value)}
                  disabled={!guestForm.province}
                >
                  <option value="">Seleccione comuna</option>
                  {comms.map((comuna) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
              </label>
              {guestError && <p className="guest-survey__error">{guestError}</p>}
              <div className="guest-survey__actions">
                <button className="pay-btn pay-btn--back" type="button" onClick={closeGuestSurvey}>Volver</button>
                <button className="pay-btn" type="submit">Guardar y continuar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartView;
