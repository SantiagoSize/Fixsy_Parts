import React from 'react';
import './Catalogo.css';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import { ProductCard, CatalogProduct } from '../../components/ProductCard';
import { ProductModal } from '../../components/ProductModal';

const INVENTORY_KEY = 'fixsy_inventory';

function readInventory(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    const list = raw ? (JSON.parse(raw) as CatalogProduct[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default function Catalogo(): React.ReactElement {
  const { addToCart } = useCart();
  const [items, setItems] = React.useState<CatalogProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [justAddedId, setJustAddedId] = React.useState<string | null>(null);
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
      { id: p.id as any, nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, imagen: p.imagen } as any,
      1
    );
    setJustAddedId(String(p.id));
    window.setTimeout(() => setJustAddedId(null), 900);
    try { toast('Producto agregado al carrito'); } catch {}
  };

  const emptyState = !loading && items.length === 0;

  return (
    <section className="cat">
      {loading && <div className="cat__empty">Cargando catálogo...</div>}
      {emptyState && <div className="cat__empty">No hay productos disponibles actualmente.</div>}

      <div className="cat__grid">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={onAdd}
            onView={setView}
            highlight={justAddedId === String(p.id)}
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

