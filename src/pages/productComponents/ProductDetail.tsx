import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import './ProductDetail.css';
import { apiFetch, buildProductImageUrl, PRODUCTS_API_BASE } from '../../utils/api';
import { Product } from '../../types/product';
import { getProductImages, getProductPlaceholder } from '../../utils/productImages';
import placeholderProduct from '../../assets/placeholder-product.png';

function ProductDetail(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [quantity, setQuantity] = React.useState<number>(1);
  const galleryRef = React.useRef<HTMLDivElement | null>(null);

  const images = React.useMemo(() => {
    if (!product) return [];
    const pics = getProductImages(product);
    if (!pics.length && product.imageUrl) return [product.imageUrl];
    return pics;
  }, [product]);

  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Product>(`${PRODUCTS_API_BASE}/api/products/${id}`);
        // ... (rest of normalization logic)
        const basePrice = Number((data as any).precioNormal ?? (data as any).precio ?? 0) || 0;
        const imageUrl = (data as any).imageUrl || (data as any).imagen || '';
        const tags = Array.isArray((data as any).tags)
          ? (data as any).tags
          : typeof (data as any).tags === 'string'
            ? (data as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [];

        const validImages = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
        const finalImages = validImages.length > 0 ? validImages : (imageUrl ? [imageUrl] : []);

        const normalized: Product = {
          ...data,
          id: Number(data.id),
          slug: (data as any).slug || data.nombre?.toLowerCase().replace(/\s+/g, '-') || String(data.id),
          categoria: (data as any).categoria || (data as any).categoriaNombre || 'Repuesto',
          precioNormal: basePrice,
          precio: basePrice,
          precioOferta: (data as any).precioOferta ?? (data as any).offerPrice,
          imageUrl,
          imagen: imageUrl,
          images: finalImages,
          descripcion: data.descripcion ?? data.descripcionCorta,
          descripcionCorta: data.descripcionCorta ?? data.descripcion,
          descripcionLarga: data.descripcionLarga ?? data.descripcion,
          tags,
        };
        setProduct(normalized);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el producto.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  React.useEffect(() => {
    if (!hasMultiple) return;
    const idTimer = window.setInterval(() => setCurrent((idx) => (idx + 1) % images.length), 4500);
    return () => window.clearInterval(idTimer);
  }, [hasMultiple, images.length]);

  React.useEffect(() => {
    if (current >= images.length) setCurrent(0);
  }, [images.length, current]);

  if (loading) return <div className="pd-container">Cargando producto...</div>;
  if (error) return <div className="pd-container">{error}</div>;
  if (!product) return <div className="pd-container">Datos del producto no disponibles.</div>;

  const fallbackPlaceholder = '/images/placeholder.png';
  const placeholderSrc = placeholderProduct || getProductPlaceholder(product.nombre);
  const displayPrice = getDisplayPrice(product as any);
  const inCartQty = items.find(ci => String(ci.productId) === String(product.id))?.quantity ?? 0;
  const available = Math.max(0, (product.stock ?? 0) - inCartQty);
  const isAvailable = (product.isActive !== false) && (product.stock ?? 0) > 0;
  const basePrice = Number((product.precioNormal ?? (product as any).precio ?? 0)) || 0;
  const explicitOfferPrice = (product.precioOferta ?? (product as any).precioOferta ?? (product as any).offerPrice);
  const isOnOffer = (product as any).oferta === true
    || explicitOfferPrice != null
    || (typeof explicitOfferPrice === 'number' && explicitOfferPrice < basePrice);
  const shortDescription = product.descripcionCorta && product.descripcionCorta !== (product.descripcionLarga || product.descripcion) ? product.descripcionCorta : '';

  const handleAdd = () => {
    if (available < 1 || !isAvailable) {
      toast('No hay stock disponible para este producto');
      return;
    }
    const qty = Math.max(1, Math.min(quantity, available || quantity));
    addToCart({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion ?? product.descripcionCorta,
      precio: (product as any).precioNormal ?? (product as any).precio ?? 0,
      precioOferta: product.precioOferta ?? undefined,
      stock: product.stock,
      imagen: product.imageUrl || product.imagen || '',
      imageUrl: product.imageUrl || product.imagen || '',
      images: product.images,
      sku: (product as any).sku,
    }, qty);
    // La notificación del carrito se muestra automáticamente desde CartContext
  };

  const handleBuyNow = () => {
    if (available >= 1 && isAvailable) {
      const qty = Math.max(1, Math.min(quantity, available));
      addToCart({
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion ?? product.descripcionCorta,
        precio: (product as any).precioNormal ?? (product as any).precio ?? 0,
        precioOferta: product.precioOferta ?? undefined,
        stock: product.stock,
        imagen: product.imageUrl || product.imagen || '',
        imageUrl: product.imageUrl || product.imagen || '',
        images: product.images,
        sku: (product as any).sku,
      }, qty);
    }
    navigate('/checkout');
  };

  const goPrev = () => setCurrent((idx) => (idx - 1 + images.length) % images.length);
  const goNext = () => setCurrent((idx) => (idx + 1) % images.length);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  const safeProductImage = buildProductImageUrl(product.imageUrl || product.imagen || '');
  const currentSrc = images[current] || safeProductImage || placeholderSrc;
  const category = (product as any).categoria || (product as any).categoriaNombre || 'Repuesto';
  const rawTags = (product as any).tags;
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
  const specs: { label: string; value?: string | number | null }[] = [
    { label: 'SKU', value: (product as any).sku || (product as any).codigo },
    { label: 'Categoría', value: category },
    { label: 'Marca', value: (product as any).marca },
    { label: 'Stock', value: product.stock },
  ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');
  const highlightList = [
    (product as any).compatibilidad,
    (product as any).tipo,
    (product as any).aplicacion,
  ].filter(Boolean) as string[];

  return (
    <main className="pd-shell">
      <section className="productDetail">
        <div className="productDetail__top">
          <div
            className="productDetail__gallery"
            tabIndex={0}
            ref={galleryRef}
            onKeyDown={handleKeyDown}
            role="region"
            aria-label="Galería de imágenes del producto"
          >
            <div className="pd-image__wrap">
              <img
                src={currentSrc}
                alt={product.nombre}
                className="pd-image__main"
                onError={(e) => {
                  const imgEl = e.currentTarget as HTMLImageElement;
                  imgEl.onerror = null;
                  imgEl.src = fallbackPlaceholder;
                }}
              />
              {hasMultiple && (
                <>
                  <button className="pd-nav pd-nav--prev" onClick={goPrev} aria-label="Anterior">&lt;</button>
                  <button className="pd-nav pd-nav--next" onClick={goNext} aria-label="Siguiente">&gt;</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    className={`pd-thumb ${idx === current ? 'is-active' : ''}`}
                    onClick={() => setCurrent(idx)}
                    aria-label={`Imagen ${idx + 1}`}
                  >
                    <img
                      src={img || placeholderSrc}
                      alt={`${product.nombre} - imagen ${idx + 1}`}
                      onError={(e) => {
                        const imgEl = e.currentTarget as HTMLImageElement;
                        imgEl.onerror = null;
                        imgEl.src = fallbackPlaceholder;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="productDetail__info">
            {isOnOffer && (
              <div className="pd-badges">
                <span className="catalog-chip catalog-chip--tag is-offer">Oferta</span>
              </div>
            )}
            <h1 className="pd-title">{product.nombre}</h1>
            {shortDescription && <p className="pd-short">{shortDescription}</p>}
            {highlightList.length > 0 && (
              <ul className="pd-highlights">
                {highlightList.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            )}
            <p className="pd-desc">
              {product.descripcionLarga || product.descripcion || product.descripcionCorta || 'Sin descripción disponible.'}
            </p>
          </div>

          <aside className="productDetail__buyBox">
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
                <div className="price">{formatPrice(displayPrice?.final || (product as any).precioNormal || 0)}</div>
              )}
            </div>
            <p className="pd-stock">
              {isAvailable ? `Stock: ${product.stock} unid.` : 'No disponible'}
              {available < (product.stock ?? 0) && available >= 0 && isAvailable && ` (disponibles: ${available})`}
            </p>

            <label className="pd-qty">
              <span>Cantidad</span>
              <input
                type="number"
                min={1}
                max={Math.max(1, available)}
                value={quantity}
                onChange={(e) => {
                  const next = Math.max(1, Number(e.target.value) || 1);
                  const capped = available > 0 ? Math.min(next, available) : next;
                  setQuantity(capped);
                }}
              />
            </label>

            <div className="pd-actions">
              <button className="pd-btn add" onClick={handleAdd} disabled={!isAvailable}>Agregar al carrito</button>
              <button className="pd-btn buy" onClick={handleBuyNow} disabled={!isAvailable}>Comprar ahora</button>
              <button className="pd-btn back" type="button" onClick={() => navigate('/catalogo')}>Volver al catálogo</button>
            </div>
            <div className="pd-help">
              <p>🚚 Envíos a todo Chile</p>
              <p>✅ Repuestos verificados por Fixsy Parts</p>
            </div>
          </aside>
        </div>

        <section className="productDetail__bottom">
          <div className="productDetail__description card">
            <h2>Descripción del producto</h2>
            <p>{product.descripcionLarga || product.descripcion || product.descripcionCorta || 'Sin descripción disponible.'}</p>
          </div>

          <div className="productDetail__specs card">
            <h2>Características técnicas</h2>
            {specs.length === 0 ? (
              <p>No hay especificaciones adicionales.</p>
            ) : (
              <dl className="pd-specs">
                {specs.map((spec) => (
                  <React.Fragment key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{String(spec.value)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
          </div>

          <div className="productDetail__tags card">
            <h2>Tags relacionados</h2>
            <div className="pd-tags">
              {tags.length > 0 ? tags.map(tag => (
                <span key={tag} className="pd-tag">#{tag}</span>
              )) : <p>No hay tags asociados.</p>}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProductDetail;
