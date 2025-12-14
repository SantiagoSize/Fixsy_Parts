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
  const [validated, setValidated] = React.useState(false);
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
      setValidated(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (formEl.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Logic extraction
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
    setValidated(true); // Optional visual confirmation
  };

  // Bootstrap Modal Simulation with dark overlay
  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initialProduct ? 'Editar Producto' : 'Nuevo Producto'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form id="productForm" className={`row g-3 needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit}>

              <div className="col-md-12">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                  required
                />
                <div className="invalid-feedback">El nombre es obligatorio.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={e => handleChange('categoria', e.target.value)}
                  required
                >
                  <option value="" disabled>Selecciona...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="invalid-feedback">Selecciona una categoría.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sku || ''}
                  onChange={e => handleChange('sku', e.target.value)}
                  placeholder="Dejar vacío para auto-generar"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Precio ($)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={form.precio}
                  onChange={e => handleChange('precio', Number(e.target.value))}
                  required
                />
                <div className="invalid-feedback">El precio no puede ser negativo.</div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={form.stock}
                  onChange={e => handleChange('stock', Number(e.target.value))}
                  required
                />
                <div className="invalid-feedback">El stock es obligatorio.</div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Descuento (%)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="100"
                  value={form.descuento}
                  onChange={e => handleChange('descuento', clampDiscount(Number(e.target.value)))}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Imagen (PNG/JPG)</label>
                {/* Si ya hay imagen URL, podrías mostrarla aquí, pero por simplicidad solo input file */}
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  ref={fileRef}
                />
                <div className="form-text">Si no subes una imagen, se mantendrá la actual (si existe).</div>
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={e => handleChange('descripcion', e.target.value)}
                  required
                ></textarea>
                <div className="invalid-feedback">La descripción es obligatoria.</div>
              </div>

              <div className="col-12">
                <label className="form-label">Tags</label>
                <select
                  className="form-select"
                  multiple
                  size={3}
                  value={form.tags}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    handleTagsChange(options);
                  }}
                >
                  {tagOptions.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
                <div className="form-text">Mantén presionado Ctrl (o Cmd) para seleccionar múltiples.</div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" form="productForm" className="btn btn-primary">
              {initialProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
