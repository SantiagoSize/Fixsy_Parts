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

  const onAdd = (p: InvItem) => {
    addToCart(
      { id: p.id as any, nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, imagen: p.imagen } as any,
      1
    );
    setJustAddedId(String(p.id));
    window.setTimeout(() => setJustAddedId(null), 1000);
    try {
      toast('✅ Producto añadido al carrito');
    } catch {}
  };

  return (
    <section className="cat">
      {!items.length && <div className="cat__empty">🛒 No hay productos disponibles actualmente.</div>}

      <div className="cat__grid">
        {items.map((p) => (
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

