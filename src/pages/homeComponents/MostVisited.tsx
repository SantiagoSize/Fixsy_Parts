import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getDisplayPrice } from '../../utils/price';
import { buildProductImageUrl } from '../../utils/api';

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


export default function MostVisited(): React.ReactElement {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<InvItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch real products from Backend to find Offers
    const fetchOffers = async () => {
      try {
        const { PRODUCTS_API_BASE, apiFetch } = await import('../../utils/api');
        const data = await apiFetch<any[]>(PRODUCTS_API_BASE, '/api/products');
        if (Array.isArray(data)) {
          // Map backend product to InvItem format
          const mapped = data.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || p.descripcionCorta || '',
            precio: p.precioNormal || p.precio || 0,
            precioOferta: p.precioOferta || p.offerPrice || null,
            stock: p.stock || 0,
            imagen: p.imageUrl || p.imagen,
            images: p.images || []
          }));
          setItems(mapped);
        }
      } catch (e) {
        console.error("Error fetching offers:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
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
        // Prioritize manually flagged offers or just high discounts
        // We can add logic to pin specific items if needed
        return b.discount - a.discount;
      })
      .slice(0, 4);
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
          <p className="mv__subtitle">Los 4 productos con mayor descuento en todo el catálogo.</p>
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
                src={buildProductImageUrl((Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.imagen || '')) || placeholderSrc}
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
