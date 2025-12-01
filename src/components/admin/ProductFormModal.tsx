import React from 'react';
import type { AdminProduct } from '../../pages/admin/AdminProductDashboard';

export type AdminProductInput = Omit<AdminProduct, 'id'>;
export type AdminProductPayload = AdminProductInput & {
  precioNormal: number;
  precioOferta: number;
  slug?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData, payload: AdminProductPayload) => void;
  initialProduct?: AdminProduct;
};

const categories = ['Filtros', 'Frenos', 'Aceites', 'Baterías', 'Suspensión', 'Iluminación', 'Accesorios', 'Eléctrico', 'Otros'];
const tagOptions = ['premium', 'economico', 'oferta', 'nuevo', 'aire', 'freno', 'aceite', 'bateria', 'suspension'];

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialProduct }: Props): React.ReactElement | null {
  const [form, setForm] = React.useState<AdminProductInput>(() => ({
    nombre: initialProduct?.nombre || '',
    descripcion: initialProduct?.descripcion || '',
    precio: initialProduct?.precio || 0,
    stock: initialProduct?.stock || 0,
    descuento: initialProduct?.descuento || 0,
    categoria: initialProduct?.categoria || 'Otros',
    tags: initialProduct?.tags || [],
    imageUrl: initialProduct?.imageUrl,
    sku: initialProduct?.sku || '',
  }));
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        nombre: initialProduct?.nombre || '',
        descripcion: initialProduct?.descripcion || '',
        precio: initialProduct?.precio || 0,
        stock: initialProduct?.stock || 0,
        descuento: initialProduct?.descuento || 0,
        categoria: initialProduct?.categoria || 'Otros',
        tags: initialProduct?.tags || [],
        imageUrl: initialProduct?.imageUrl,
        sku: initialProduct?.sku || '',
      });
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const clampDiscount = (value: number) => Math.min(100, Math.max(0, value));

  const handleChange = (key: keyof AdminProductInput, value: AdminProductInput[typeof key]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTagsChange = (selected: string[]) => {
    handleChange('tags', selected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = form.nombre.trim();
    const makeSlug = (value: string) =>
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const generatedSku = form.sku?.trim() || `${makeSlug(normalizedName) || 'prod'}-${Date.now().toString().slice(-6)}`;
    const slug = makeSlug(normalizedName) || generatedSku;
    const precioNormal = Number(form.precio) || 0;
    const descuento = clampDiscount(Number(form.descuento) || 0);
    const precioOferta = Math.max(0, Math.round(precioNormal * (1 - descuento / 100)));

    const payload: AdminProductPayload = {
      ...form,
      nombre: normalizedName,
      descripcion: form.descripcion.trim(),
      precio: precioNormal,
      precioNormal,
      precioOferta,
      stock: Number(form.stock) || 0,
      descuento,
      categoria: form.categoria || 'Otros',
      tags: Array.isArray(form.tags) ? form.tags.filter(Boolean) : [],
      sku: generatedSku,
      slug,
    };

    const fd = new FormData();
    const file = fileRef.current?.files?.[0];
    if (file) {
      fd.append('file', file);
    }
    fd.append('product', JSON.stringify(payload));
    onSubmit(fd, payload);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-header">
          <div>
            <p className="admin-kicker">Producto</p>
            <h2 className="modal-title">{initialProduct ? 'Editar producto' : 'Crear producto'}</h2>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cerrar</button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>
              <input
                type="text"
                value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Categoría</span>
              <select
                value={form.categoria}
                onChange={e => handleChange('categoria', e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>

          <label className="form-field">
            <span>Precio</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.precio}
              onChange={e => handleChange('precio', Number(e.target.value))}
              required
            />
          </label>

            <label className="form-field">
              <span>Stock</span>
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={e => handleChange('stock', Number(e.target.value))}
                required
              />
            </label>

            <label className="form-field">
              <span>SKU</span>
              <input
                type="text"
                value={form.sku || ''}
                onChange={e => handleChange('sku', e.target.value)}
                placeholder="SKU único (auto-generado si lo dejas vacío)"
              />
            </label>

            <label className="form-field">
              <span>Descuento (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.descuento}
                onChange={e => handleChange('descuento', clampDiscount(Number(e.target.value)))}
              />
            </label>

            <label className="form-field">
              <span>Imagen PNG</span>
              <input
                type="file"
                accept="image/png"
                ref={fileRef}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Descripción</span>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
              placeholder="Detalle técnico o notas de compatibilidad"
            />
          </label>

          <label className="form-field">
            <span>Tags (multi-select)</span>
            <select
              multiple
              value={form.tags}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                handleTagsChange(options);
              }}
            >
              {tagOptions.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <small className="form-hint">Selecciona uno o más tags para mejorar la búsqueda.</small>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary">{initialProduct ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
