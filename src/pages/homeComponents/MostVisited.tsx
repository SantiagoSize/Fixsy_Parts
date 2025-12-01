import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getDisplayPrice } from '../../utils/price';

type InvItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number | null;
  stock: number;
  imagen?: string;
  images?: string[];
};

type OfferItem = InvItem & {
  discount: number;
  savings: number;
  originalPrice: number;
  finalPrice: number;
};

function readInventory(): InvItem[] {
  try {
    const raw = localStorage.getItem('fixsy_inventory');
    const list = raw ? JSON.parse(raw) as InvItem[] : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter(it => it && typeof it.id !== 'undefined')
      .map(it => {
        const imgs = Array.isArray(it.images) ? it.images.filter(Boolean) : (it.imagen ? [it.imagen] : []);
        const basePrice = Number((it as any).precio ?? 0) || 0;
        const offerPrice = Number((it as any).precioOferta ?? (it as any).offerPrice ?? NaN);
        return {
          ...it,
          precio: basePrice,
          precioOferta: Number.isFinite(offerPrice) ? offerPrice : undefined,
          images: imgs,
          imagen: imgs[0] || it.imagen,
        };
      });
  } catch { return []; }
}

export default function MostVisited(): React.ReactElement {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<InvItem[]>(readInventory());

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === 'fixsy_inventory') setItems(readInventory()); };
    const onFocus = () => setItems(readInventory());
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const offers = React.useMemo<OfferItem[]>(() => {
    return items
      .map(item => {
        const price = getDisplayPrice(item as any);
        if (!price.hasDiscount) return null;
        const discount = price.discountPercentage ?? Math.round((1 - (price.final / price.original)) * 100);
        const savings = Math.max(0, price.original - price.final);
        return {
          ...item,
          discount,
          savings,
          originalPrice: price.original,
          finalPrice: price.final,
        };
      })
      .filter((item): item is OfferItem => Boolean(item && item.discount > 0))
      .sort((a, b) => {
        if (b.discount !== a.discount) return b.discount - a.discount;
        if (b.savings !== a.savings) return b.savings - a.savings;
        return String(a.nombre || '').localeCompare(String(b.nombre || ''));
      })
      .slice(0, 6);
  }, [items]);

  if (!offers.length) {
    return (
      <section className="mv">
        <h2 className="mv__title">Ofertas destacadas</h2>
        <div className="mv__empty">😕 No hay productos con rebaja activa en el catálogo.</div>
      </section>
    );
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='18'>Imagen</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <section className="mv mv--offers">
      <div className="mv__header">
        <div>
          <p className="section-kicker">Top rebajas</p>
          <h2 className="mv__title">Ofertas destacadas</h2>
          <p className="mv__subtitle">Los 6 productos con mayor descuento en todo el catálogo.</p>
        </div>
        <button
          type="button"
          className="mv__cta"
          onClick={() => navigate('/catalogo?filtro=ofertas')}
        >
          Ver catálogo
        </button>
      </div>

      <div className="mv__grid mv__grid--offers">
        {offers.map((p, idx) => (
          <article
            key={p.id}
            className="offer-card"
            onClick={() => navigate(`/product/${encodeURIComponent(String(p.id))}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/product/${encodeURIComponent(String(p.id))}`);
              }
            }}
          >
            <div className="offer-card__badge">-{p.discount}%</div>
            <div className="offer-card__imageWrap">
              <img
                className="offer-card__image"
                src={(Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.imagen || placeholderSrc)}
                alt={p.nombre}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderSrc; }}
              />
            </div>
            <div className="offer-card__body">
              <div className="offer-card__top">
                <span className="offer-card__pill">#{idx + 1} en ahorro</span>
                <span className="offer-card__stock">Stock: {p.stock ?? 0}</span>
              </div>
              <h3 className="offer-card__name">{p.nombre}</h3>
              <p className="offer-card__desc">{p.descripcion}</p>
              <div className="offer-card__prices">
                <span className="offer-card__original">{formatPrice(p.originalPrice)}</span>
                <span className="offer-card__final">{formatPrice(p.finalPrice)}</span>
                <span className="offer-card__savings">Ahorras {formatPrice(p.savings)}</span>
              </div>
              <button
                type="button"
                className="offer-card__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${encodeURIComponent(String(p.id))}`);
                }}
              >
                Ver detalle
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
