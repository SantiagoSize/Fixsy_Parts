import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductItem from '../../components/ProductItem';
import body1 from '../../assets/Body1.png';
import body2 from '../../assets/Body2.png';
import body3 from '../../assets/Body 3.png';

type InvItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  images?: string[];
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
        return { ...it, images: imgs, imagen: imgs[0] || it.imagen };
      });
  } catch { return []; }
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  const take = Math.min(count, copy.length);
  for (let i = 0; i < take; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
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

  if (!items.length) {
    return (
      <section className="mv">
        <h2 className="mv__title">Ofertas destacadas</h2>
        <div className="mv__empty">🛒 No hay productos disponibles en el catálogo.</div>
      </section>
    );
  }

  const sample = pickRandom(items, items.length >= 3 ? 3 : Math.min(3, items.length));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='18'>Imagen</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <section className="mv">
      <h2 className="mv__title">Ofertas destacadas</h2>
      <div className="mv__grid">
        {sample.map((p, idx) => (
          <ProductItem
            key={p.id}
            product={{
              id: p.id,
              nombre: p.nombre,
              precio: p.precio,
              imagen: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.imagen ? p.imagen : [body1, body2, body3][idx % 3]),
              images: p.images
            }}
            onClick={() => navigate(`/product/${encodeURIComponent(String(p.id))}`)}
          />
        ))}
      </div>
    </section>
  );
}

