import React from 'react';
import ProductFormModal, { AdminProductPayload } from '../../components/admin/ProductFormModal';
import { apiFetch, PRODUCTS_API_BASE } from '../../utils/api';
import { Product } from '../../types/product';

export type AdminProduct = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  descuento: number;
  categoria: string;
  tags: string[];
  imageUrl?: string;
  sku?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

export default function AdminProductDashboard(): React.ReactElement {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminProduct | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  const mapApiProduct = React.useCallback((p: Product): AdminProduct => {
    const precioNormal = Number((p as any).precioNormal ?? p.precio ?? 0) || 0;
    const precioOfertaRaw = Number((p as any).precioOferta ?? (p as any).offerPrice ?? 0) || 0;
    const precioFinal = precioOfertaRaw > 0 && precioOfertaRaw < precioNormal ? precioOfertaRaw : precioNormal;
    const descuento = precioNormal > 0 ? Math.max(0, Math.min(100, Math.round((1 - precioFinal / precioNormal) * 100))) : 0;
    const tags = Array.isArray((p as any).tags)
      ? (p as any).tags.filter(Boolean)
      : typeof (p as any).tags === 'string'
        ? (p as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
    return {
      id: Number((p as any).id) || 0,
      nombre: p.nombre,
      descripcion: (p as any).descripcion ?? p.descripcionCorta ?? '',
      precio: precioNormal,
      stock: Number((p as any).stock ?? 0),
      descuento,
      categoria: (p as any).categoria ?? (p as any).categoriaNombre ?? 'Otros',
      tags,
      imageUrl: (p as any).imageUrl ?? (p as any).imagen ?? '',
      sku: (p as any).sku ?? '',
    };
  }, []);

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Product[]>(PRODUCTS_API_BASE, '/api/products');
      const mapped = (Array.isArray(data) ? data : []).map(mapApiProduct);
      setProducts(mapped);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el listado de productos.');
    } finally {
      setLoading(false);
    }
  }, [mapApiProduct]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.');
    if (!ok) return;
    setSaving(true);
    try {
      await apiFetch(PRODUCTS_API_BASE, `/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (formData: FormData, payload: AdminProductPayload) => {
    setSaving(true);
    setError(null);
    const precioOferta = payload.precioOferta ?? Math.max(0, Math.round(payload.precio * (1 - (payload.descuento || 0) / 100)));
    const backendProduct = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      categoria: payload.categoria,
      tags: payload.tags,
      precioNormal: payload.precio,
      precioOferta,
      stock: payload.stock,
      imageUrl: payload.imageUrl,
      sku: payload.sku,
      slug: payload.slug,
    };

    const file = formData.get('file') as File | null;
    const hasFile = !!file && (file as any).size > 0;
    const method = editing ? 'PUT' : 'POST';
    const path = editing ? `/api/products/${editing.id}` : '/api/products';

    try {
      let res: Product;
      if (hasFile) {
        const fd = new FormData();
        formData.forEach((value, key) => fd.append(key, value));
        fd.set('product', JSON.stringify({ ...backendProduct, id: editing?.id }));
        // Compatibilidad: algunos backends esperan el archivo bajo "image"
        if (!fd.has('image') && file) fd.append('image', file);
        res = await apiFetch<Product>(PRODUCTS_API_BASE, path, { method, body: fd });
      } else {
        // Sin archivo: manda JSON para evitar 415 Unsupported Media Type en endpoints que consumen application/json
        res = await apiFetch<Product>(PRODUCTS_API_BASE, path, {
          method,
          json: { ...backendProduct, id: editing?.id },
        });
      }
      const mapped = mapApiProduct(res as Product);
      setProducts(prev => {
        if (editing) return prev.map(p => (p.id === editing.id ? mapped : p));
        return [...prev, mapped];
      });
      setModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.nombre.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q)
    );
  }, [products, query]);

  const rows = filtered.map(product => {
    const finalPrice = Math.max(0, Math.round(product.precio * (1 - product.descuento / 100)));
    return (
      <tr key={product.id}>
        <td>
          <div className="admin-product__row">
            <div className="admin-product__name">{product.nombre}</div>
            <div className="admin-pill admin-pill--ghost">ID: {product.id}</div>
          </div>
          <div className="admin-product__meta">
            <span className="admin-pill">{product.categoria}</span>
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="admin-pill admin-pill--ghost">#{tag}</span>
            ))}
          </div>
        </td>
        <td>{formatCurrency(product.precio)}</td>
        <td>{product.descuento}%</td>
        <td>{formatCurrency(finalPrice)}</td>
        <td>{product.stock}</td>
        <td>
          <div className="admin-actions">
            <button className="btn btn--ghost" type="button" onClick={() => openEdit(product)}>Editar</button>
            <button className="btn btn--danger" type="button" onClick={() => handleDelete(product.id)}>Eliminar</button>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <section className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Dashboard · Productos</p>
          <h1 className="admin-title">Gestión de productos</h1>
          <p className="admin-subtitle">Administra catálogo, precios, stock y etiquetas desde un solo lugar.</p>
        </div>
        <div className="admin-header__actions">
          <input
            type="text"
            className="search-bar"
            placeholder="Buscar por nombre o ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <button className="btn btn--primary" type="button" onClick={openCreate}>Crear Producto</button>
        </div>
      </header>

      {error && <div className="user-toast" role="alert" style={{ position: 'static' }}>{error}</div>}

      <div className="admin-card">
        <div className="admin-card__body">
          {loading ? (
            <div className="admin-table__empty">Cargando productos...</div>
          ) : (
            <div className="admin-table__wrap">
              <table className="admin-table" role="grid">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio Original</th>
                    <th>Descuento (%)</th>
                    <th>Precio Final</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? rows : (
                    <tr>
                      <td colSpan={6} className="admin-table__empty">Sin productos cargados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        initialProduct={editing || undefined}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
