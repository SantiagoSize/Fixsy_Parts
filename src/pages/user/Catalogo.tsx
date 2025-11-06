import React from 'react';
import './Catalogo.css';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';

type InvItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
};

function readInventory(): InvItem[] {
  try {
    const raw = localStorage.getItem('fixsy_inventory');
    const list = raw ? (JSON.parse(raw) as InvItem[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default function Catalogo(): React.ReactElement {
  const { addToCart } = useCart();
  const [items, setItems] = React.useState<InvItem[]>(readInventory());
  const [justAddedId, setJustAddedId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<InvItem | null>(null);
  const [query, setQuery] = React.useState<string>('');
  const [filtered, setFiltered] = React.useState<InvItem[]>(items);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fixsy_inventory') setItems(readInventory());
    };
    const onFocus = () => setItems(readInventory());
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Filtrado dinÃ¡mico por tÃ©rmino de bÃºsqueda
  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered(items); return; }
    setFiltered(
      items.filter(p =>
        String(p.id).toLowerCase().includes(q) ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  const onAdd = (p: InvItem) => {
    addToCart(
      { id: p.id as any, nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, imagen: p.imagen } as any,
      1
    );
    setJustAddedId(String(p.id));
    window.setTimeout(() => setJustAddedId(null), 1000);
    try {
      toast('Producto añadido al carrito');
    } catch {}
  };

  return (
    <section className="cat">
      <div className="cat__bar">
        <div className="cat__search">
          <span className="cat__icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            className="cat__input"
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="cat__clear" onClick={() => setQuery('')}>Limpiar</button>
      </div>
      {!items.length && <div className="cat__empty">ðŸ›’ No hay productos disponibles actualmente.</div>}

      <div className="cat__grid">
        {filtered.map((p) => (
          <article key={p.id} className={`cat__card ${justAddedId === String(p.id) ? 'cat__card--pulse' : ''}`}>
            <div className="cat__imageWrap">
              {p.imagen ? (
                <img className="cat__image" src={p.imagen} alt={p.nombre} />
              ) : (
                <div className="cat__placeholder">Sin imagen</div>
              )}
            </div>
            <div className="cat__info">
              <h3 className="cat__name">{p.nombre}</h3>
              <p className="cat__desc" title={p.descripcion}>
                {p.descripcion}
              </p>
              <div className="cat__row">
                <span className="cat__price">$ {Number(p.precio || 0).toLocaleString('es-CL')}</span>
                <div className="cat__actions">
                  <button className="cat__btn cat__btn--add" onClick={() => onAdd(p)}>
                    Añadir al carrito
                  </button>
                  <button className="cat__btn cat__btn--view" onClick={() => setView(p)}>
                    Ver
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {view && (
        <div className="cat__modal" role="dialog" aria-modal="true">
          <div className="cat__modalCard">
            <div className="cat__modalImage">
              {view.imagen ? (
                <img src={view.imagen} alt={view.nombre} />
              ) : (
                <div className="cat__placeholder" style={{ maxHeight: 420 }}>Sin imagen</div>
              )}
            </div>
            <div className="cat__modalInfo">
              <h3>{view.nombre}</h3>
              <p>{view.descripcion}</p>
              <div className="cat__modalRow">
                <span className="cat__price">$ {Number(view.precio || 0).toLocaleString('es-CL')}</span>
                <span>Stock: {view.stock}</span>
              </div>
              <div className="cat__modalActions">
                <button className="cat__btn cat__btn--add" onClick={() => onAdd(view)}>Añadir al carrito</button>
                <button className="cat__btn cat__btn--view" onClick={() => setView(null)}>Cerrar</button>
              </div>
            </div>
          </div>
          <button className="cat__modalBackdrop" onClick={() => setView(null)} aria-label="Cerrar" />
        </div>
      )}
    </section>
  );
}

