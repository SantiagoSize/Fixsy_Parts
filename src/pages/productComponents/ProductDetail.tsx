import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './ProductDetail.css';

type InvItem = { id: string; nombre: string; descripcion: string; precio: number; precioOferta?: number; stock: number; imagen?: string; images?: string[] };

function readInventory(): InvItem[] {
  try {
    const raw = localStorage.getItem('fixsy_inventory');
    const list = raw ? JSON.parse(raw) as InvItem[] : [];
    if (!Array.isArray(list)) return [];
    return list.map((it) => {
      const imgs = Array.isArray(it.images) ? it.images.filter(Boolean) : (it.imagen ? [it.imagen] : []);
      return { ...it, images: imgs, imagen: imgs[0] || it.imagen };
    });
  } catch { return []; }
}

function ProductDetail(): React.ReactElement {
  const { id } = useParams();
  const inv = React.useMemo(() => readInventory(), []);
  const product: InvItem | undefined = id ? inv.find(p => String(p.id) === String(id)) : undefined;
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const displayPrice = product ? getDisplayPrice(product as any) : null;

  const images = React.useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (list.length === 0 && product.imagen) list.push(product.imagen);
    return list;
  }, [product]);

  const [current, setCurrent] = React.useState(0);
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    if (!hasMultiple) return;
    const idTimer = window.setInterval(() => setCurrent((idx) => (idx + 1) % images.length), 4500);
    return () => window.clearInterval(idTimer);
  }, [hasMultiple, images.length]);

  if (!product) {
    return <div className="pd-container">Datos del producto no disponibles.</div>;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'>Imagen</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  // Cantidad disponible considerando lo que ya hay en el carrito
  const inCartQty = items.find(ci => String(ci.product.id) === String(product.id))?.quantity ?? 0;
  const available = Math.max(0, product.stock - inCartQty);

  // Añadir al carrito: mostrar alerta si no hay stock suficiente
  const handleAdd = () => {
    if (available < 1) {
      alert('No hay stock disponible para este producto');
      return;
    }
    addToCart({ id: product.id, nombre: product.nombre, descripcion: product.descripcion, precio: product.precio, stock: product.stock, imagen: product.imagen, images: product.images } as any, 1);
    try { toast('Producto añadido al carrito'); } catch {}
  };

  // Comprar ahora: avanzar siempre, sin alertas
  const handleBuyNow = () => {
    if (available >= 1) {
      addToCart({ id: product.id, nombre: product.nombre, descripcion: product.descripcion, precio: product.precio, stock: product.stock, imagen: product.imagen, images: product.images } as any, 1);
    }
    navigate('/checkout');
  };

  const goPrev = () => setCurrent((idx) => (idx - 1 + images.length) % images.length);
  const goNext = () => setCurrent((idx) => (idx + 1) % images.length);

  const currentSrc = images[current] || placeholderSrc;

  return (
    <section className="pd-container">
      <div className="pd-grid">
        <div className="pd-image">
          <div className="pd-image__wrap">
            <img src={currentSrc} alt={product.nombre} />
            {hasMultiple && (
              <>
                <button className="pd-nav pd-nav--prev" onClick={goPrev} aria-label="Anterior">‹</button>
                <button className="pd-nav pd-nav--next" onClick={goNext} aria-label="Siguiente">›</button>
              </>
            )}
          </div>
        </div>
        <div className="pd-info">
          <h1 className="pd-title">{product.nombre}</h1>
          <p className="pd-desc">{product.descripcion}</p>
          <div className="pd-price">
            {displayPrice?.hasDiscount ? (
              <div className="price price--with-discount">
                <span className="price__original">{formatPrice(displayPrice.original)}</span>
                <span className="price__final">{formatPrice(displayPrice.final)}</span>
                {displayPrice.discountPercentage && (
                  <span className="price__badge">-{displayPrice.discountPercentage}%</span>
                )}
              </div>
            ) : (
              <div className="price">{formatPrice(displayPrice?.final || product.precio)}</div>
            )}
          </div>
          <p className="pd-stock">Stock: {product.stock} unid.</p>
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
