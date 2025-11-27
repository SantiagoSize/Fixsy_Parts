import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, type Product } from '../../data/products';
import ProductItem from '../../components/ProductItem';

function BestProductsComponent(): React.ReactElement {
  const navigate = useNavigate();
  const [start, setStart] = React.useState(0);
  const [direction, setDirection] = React.useState<'next' | 'prev' | ''>('');
  const [paused, setPaused] = React.useState(false);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>`
    + `<rect width='100%' height='100%' fill='%23f2f1f2'/>`
    + `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='18'>Producto</text>`
    + `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const total = PRODUCTS.length;
  const visible: Product[] = Array.from({ length: Math.min(4, total) }, (_, i) => {
    const idx = (start + i) % total;
    return PRODUCTS[idx];
  });

  const prev = () => {
    setDirection('prev');
    setStart((s) => (s - 1 + total) % total);
  };
  const next = () => {
    setDirection('next');
    setStart((s) => (s + 1) % total);
  };

  // Auto-advance every X seconds when not paused and when hay más de 4
  React.useEffect(() => {
    if (paused || total <= 4) return;
    const AUTO_MS = 4000;
    const id = setInterval(() => {
      setDirection('next');
      setStart((s) => (s + 1) % total);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  return (
    <section className="home-best" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <h2 className="home-best__title">Productos más vistos</h2>

      <button type="button" className="home-best__nav home-best__nav--prev" aria-label="Anterior" onClick={prev}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className="home-best__nav home-best__nav--next" aria-label="Siguiente" onClick={next}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`home-best__grid ${direction ? `animate-${direction}` : ''}`}>
        {visible.map((p: Product) => (
          <ProductItem
            key={p.id}
            product={{ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, images: p.images }}
            onClick={() => navigate(`/product/${p.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default BestProductsComponent;
