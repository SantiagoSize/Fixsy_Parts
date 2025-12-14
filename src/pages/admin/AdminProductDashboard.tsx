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

  return (
    <section className="container-fluid py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestión de productos</h1>
          <p className="text-muted small">Administra catálogo, precios, stock y etiquetas.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ maxWidth: 250 }}
          />
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>+ Nuevo
          </button>
        </div>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: '40%' }}>Producto</th>
                  <th scope="col">Precio Base</th>
                  <th scope="col">Descuento</th>
                  <th scope="col">Precio Final</th>
                  <th scope="col">Stock</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map(product => {
                    const finalPrice = Math.max(0, Math.round(product.precio * (1 - product.descuento / 100)));
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{product.nombre}</span>
                            <div className="d-flex gap-2 mt-1 align-items-center">
                              <span className="badge bg-light text-secondary border">ID: {product.id}</span>
                              <span className="badge bg-info bg-opacity-10 text-info">{product.categoria}</span>
                              {product.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="badge bg-secondary bg-opacity-10 text-secondary border">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>{formatCurrency(product.precio)}</td>
                        <td>
                          {product.descuento > 0 ? <span className="text-success fw-bold">-{product.descuento}%</span> : <span className="text-muted">-</span>}
                        </td>
                        <td className="fw-semibold">{formatCurrency(finalPrice)}</td>
                        <td>
                          <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            type="button"
                            onClick={() => openEdit(product)}
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      {loading ? 'Cargando productos...' : 'No se encontraron productos.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
