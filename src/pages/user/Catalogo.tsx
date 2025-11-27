import React from 'react';
import './Catalogo.css';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import ProductItem, { CatalogProduct } from '../../components/ProductItem';
import { ProductModal } from '../../components/ProductModal';

const INVENTORY_KEY = 'fixsy_inventory';

function readInventory(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    const list = raw ? (JSON.parse(raw) as CatalogProduct[]) : [];
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      const images = Array.isArray(item.images) ? item.images.filter(Boolean) : (item.imagen ? [item.imagen] : []);
      const imagen = images[0] || '';
      return { ...item, images, imagen };
    });
  } catch {
    return [];
  }
}

export default function Catalogo(): React.ReactElement {
  const { addToCart } = useCart();
  const [items, setItems] = React.useState<CatalogProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<CatalogProduct | null>(null);

  React.useEffect(() => {
    const syncInventory = () => { setItems(readInventory()); setLoading(false); };
    syncInventory();
    const onStorage = (e: StorageEvent) => { if (e.key === INVENTORY_KEY) syncInventory(); };
    const onFocus = () => syncInventory();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const onAdd = (p: CatalogProduct) => {
    addToCart(
      { id: p.id as any, nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, imagen: p.imagen, images: p.images } as any,
      1
    );
    try { toast('Producto agregado al carrito'); } catch {}
  };

  const emptyState = !loading && items.length === 0;

  return (
    <section className="cat">
      {loading && <div className="cat__empty">Cargando catálogo...</div>}
      {emptyState && <div className="cat__empty">No hay productos disponibles actualmente.</div>}

      <div className="cat__grid">
        {items.map((p) => (
          <ProductItem
            key={p.id}
            product={p}
            actions={(
              <>
                <button className="product-btn product-btn--primary" onClick={() => onAdd(p)}>Añadir al carrito</button>
                <button className="product-btn product-btn--dark" onClick={() => setView(p)}>Ver</button>
              </>
            )}
          />
        ))}
      </div>

      {view && (
        <ProductModal
          product={view}
          onAdd={onAdd}
          onClose={() => setView(null)}
        />
      )}
    </section>
  );
}

