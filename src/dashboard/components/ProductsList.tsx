import React from "react";

type Product = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
};

const STORAGE_KEY = 'fixsy_inventory';

function loadProducts(): Product[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as Product[] : []; } catch { return []; }
}

function formatCLP(n: number) {
  try { return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }); } catch { return `$${n}`; }
}

export default function ProductsList() {
  const [query, setQuery] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [items, setItems] = React.useState<Product[]>(loadProducts());

  // Reload when component mounts (and when page reloaded on section change)
  React.useEffect(() => { setItems(loadProducts()); }, []);

  // Escuchar cambios en localStorage (desde otras pestañas) y foco de ventana
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(loadProducts());
      }
    };
    const onFocus = () => {
      // refrescar también al volver el foco a la pestaña
      setItems(loadProducts());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const onClear = () => {
    setQuery('');
    setToast('🔄 Filtros limpiados');
    setTimeout(() => setToast(''), 1800);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p =>
      (String(p.id) || '').toLowerCase().includes(q) ||
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    );
  }, [query, items]);

  return (
    <div className="card" style={{ display: 'grid', gap: 14 }}>
      <h2 style={{ margin: 0, textAlign: 'center' }}>📦 Productos disponibles</h2>

      {/* Search bar */}
      <div className="prod-search">
        <div className="prod-search__wrap">
          <input
            className="prod-search__input"
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="prod-search__icon" aria-hidden>
            {/* Lupa SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <button className="prod-search__clear" onClick={onClear}>Limpiar</button>
      </div>

      {/* Empty states */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6B7280' }}>📭 No hay productos cargados en el inventario</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6B7280' }}>❌ No se encontraron productos con ese nombre</div>
      ) : (
        <div className="prod-grid">
          {filtered.map((p) => (
            <div key={p.id} className="prod-card fade-up">
              <div className="prod-card__img">
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'200\'><rect width=\'100%\' height=\'100%\' fill=\'#E5E7EB\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Montserrat, sans-serif\' font-size=\'14\' fill=\'#6B7280\'>Imagen no disponible</text></svg>`);
                    }}
                  />
                ) : (
                  <div className="inv-imgFallback">Imagen no disponible</div>
                )}
              </div>
              <div className="prod-card__body">
                <div className="prod-card__id">#{p.id}</div>
                <div className="prod-card__name">{p.nombre}</div>
                <div className="prod-card__desc" title={p.descripcion}>{p.descripcion}</div>
                <div className="prod-card__meta">
                  <span className="prod-card__price">{formatCLP(Number(p.precio || 0))}</span>
                  <span className="prod-card__stock">Stock: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (<div className="user-toast" role="status" aria-live="polite">{toast}</div>)}
    </div>
  );
}
