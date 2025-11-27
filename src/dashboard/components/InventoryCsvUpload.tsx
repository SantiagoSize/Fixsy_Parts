import React from "react";
import { Alert } from "../../components/Alert";
import { formatPrice, getDisplayPrice } from "../../utils/price";

type ProductRow = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  imagen: string;
  images?: string[];
};

const STORAGE_KEY = 'fixsy_inventory';

function loadInventory(): ProductRow[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as ProductRow[] : []; } catch { return []; }
}
function saveInventory(list: ProductRow[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

const MIN_DIMENSION = 200;

function parseImages(value: string): string[] {
  if (!value) return [];
  return value.split('|').map(v => v.trim()).filter(Boolean);
}

function validateImageDimensions(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
        reject(new Error('small'));
      } else {
        resolve();
      }
    };
    img.onerror = () => reject(new Error('load'));
    img.src = url;
  });
}

function parseCsv(text: string): ProductRow[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  // handle BOM
  const first = lines[0].replace(/^\uFEFF/, '');
  const header = first.split(',').map(h => h.trim().toLowerCase());
  const required = ['id','nombre','descripcion','precio','stock','imagen'];
  const missing = required.filter(h => header.indexOf(h) === -1);
  if (missing.length) {
    throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}`);
  }
  const idx = (k: string) => header.indexOf(k);
  const iId = idx('id');
  const iNombre = idx('nombre');
  const iDesc = idx('descripcion');
  const iPrecio = idx('precio');
  const iStock = idx('stock');
    const iImagen = idx('imagen');
  const out: ProductRow[] = [];
  for (let li = 1; li < lines.length; li++) {
    const row = csvSplit(lines[li]);
    const get = (i: number) => (i >= 0 && i < row.length ? row[i] : '').trim();
    const precioNum = Number(get(iPrecio).replace(/[^0-9.-]/g, '')) || 0;
    const stockNum = Number(get(iStock).replace(/[^0-9.-]/g, '')) || 0;
    const r: ProductRow = {
      id: get(iId) || `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      nombre: get(iNombre),
      descripcion: get(iDesc),
      precio: precioNum,
      stock: stockNum,
      imagen: get(iImagen),
    };
    if (r.nombre) out.push(r);
  }
  return out;
}

// Simple CSV splitter handling quotes and commas
function csvSplit(line: string): string[] {
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      res.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

export default function InventoryCsvUpload() {
  const [file, setFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState('');
  const [parsedCount, setParsedCount] = React.useState(0);
  const [items, setItems] = React.useState<ProductRow[]>(loadInventory());
  const [preview, setPreview] = React.useState<ProductRow | null>(null);
  const [toast, setToast] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [alertMessage, setAlertMessage] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setFileName(f ? f.name : '');
    setParsedCount(0);
  };

  const onUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result || '');
        const rows = parseCsv(text);
        // validar filas
        const rowErrors: string[] = [];
        rows.forEach((r, i) => {
          const line = i + 2; // considerando encabezado en línea 1
          if (!r.id) rowErrors.push(`Línea ${line}: id vacío`);
          if (!r.nombre) rowErrors.push(`Línea ${line}: nombre vacío`);
          if (!r.descripcion) rowErrors.push(`Línea ${line}: descripción vacía`);
          if (!(Number.isFinite(r.precio) && r.precio >= 0)) rowErrors.push(`Línea ${line}: precio inválido (${r.precio})`);
          if (!Number.isInteger(r.stock) || r.stock < 0) rowErrors.push(`Línea ${line}: stock inválido (${r.stock})`);
          const urls = parseImages(r.imagen);
          if (!urls.length) rowErrors.push(`Línea ${line}: imagen (URL) vacía`);
          urls.forEach(u => { try { new URL(u); } catch { rowErrors.push(`Línea ${line}: URL de imagen inválida`); } });
        });
        if (rows.length === 0) rowErrors.push('El archivo no contiene filas de productos.');
        if (rowErrors.length) {
          setErrors(rowErrors);
          setAlertMessage(rowErrors[0] || '');
          setParsedCount(0);
          setToast('Corrige el CSV antes de subir.');
          setTimeout(() => setToast(''), 2500);
          return; // no guardar
        }

        // Validar dimensiones mínimas
        const dimensionErrors: string[] = [];
        await Promise.all(rows.map(async (r, idx) => {
          const urls = parseImages(r.imagen);
          for (const url of urls) {
            try {
              await validateImageDimensions(url);
            } catch {
              dimensionErrors.push(`Línea ${idx + 2}: La imagen es demasiado pequeña. Debe tener al menos 200x200 píxeles.`);
              break;
            }
          }
        }));
        if (dimensionErrors.length) {
          setErrors(dimensionErrors);
          setAlertMessage('La imagen es demasiado pequeña. Debe tener al menos 200x200 píxeles.');
          setParsedCount(0);
          setToast('Corrige las imágenes (200x200 px mínimo).');
          setTimeout(() => setToast(''), 2500);
          return;
        }

        setErrors([]);
        setAlertMessage('');
        setParsedCount(rows.length);
        const merged = rows.map(r => {
          const imgs = parseImages(r.imagen);
          return { ...r, images: imgs, imagen: imgs[0] || '' };
        });
        setItems(merged);
        saveInventory(merged);
        setToast('✅ Productos cargados con éxito');
        setTimeout(() => setToast(''), 2000);
      } catch (err: any) {
        const msg = (err && err.message) ? String(err.message) : "Error al procesar el CSV. Verifica columnas (id,nombre,descripcion,precio,stock,imagen) y formato.";
        setErrors([msg]);
        setAlertMessage(msg);
        setToast('Error al procesar el CSV (verifica columnas y formato)');
        setTimeout(() => setToast(''), 2000);
      }
    };
    reader.readAsText(file);
  };

  const onClear = () => {
    setItems([]);
    saveInventory([]);
    setParsedCount(0);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>Cargar archivo de productos (CSV)</h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Sube un archivo .csv con las columnas: id, nombre, descripcion, precio, stock, imagen.<br/>
          Cada fila representa un producto. Las imágenes deben ser enlaces (URLs válidas).
        </p>
        {alertMessage && <Alert type="error" message={alertMessage} />}
        <div className="inv-actions">
          <input ref={fileRef} type="file" accept=".csv" onChange={onPick} style={{ display: 'none' }} />
          <button className="btn-inv btn-secondary" onClick={() => fileRef.current?.click()}>Seleccionar archivo</button>
          <button className="btn-inv btn-primary" onClick={onUpload} disabled={!file}>Subir productos</button>
          <button className="btn-inv btn-danger" onClick={onClear}>Borrar Inventario</button>
          <button className="btn-inv btn-secondary" onClick={downloadTemplate}>Descargar plantilla CSV</button>
        </div>
        {fileName && (
          <div style={{ color: '#374151' }}>Archivo: <b>{fileName}</b>{parsedCount ? ` · ${parsedCount} ítems` : ''}</div>
        )}
        {errors.length > 0 && (
          <div className="inv-errors" role="alert" aria-live="assertive">
            <div className="inv-errors__title">Se encontraron errores en el CSV</div>
            <ul className="inv-errors__list">
              {errors.slice(0, 8).map((e, i) => (<li key={i}>{e}</li>))}
              {errors.length > 8 && (<li>…y {errors.length - 8} más</li>)}
            </ul>
          </div>
        )}
        
      </div>

      {/* Grid */}
      {items.length > 0 && (
        <div className="inv-grid">
          {items.map(p => {
            const displayPrice = getDisplayPrice(p as any);
            return (
              <div key={p.id} className="inv-card" onClick={() => setPreview(p)}>
                <div className="inv-imgWrap">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'200\'><rect width=\'100%\' height=\'100%\' fill=\'#E5E7EB\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Montserrat, sans-serif\' font-size=\'14\' fill=\'#6B7280\'>Imagen no disponible</text></svg>`); }} />
                  ) : (
                    <div className="inv-imgFallback">Imagen no disponible</div>
                  )}
                </div>
                <div className="inv-body">
                  <div className="inv-name">{p.nombre}</div>
                  <div className="inv-desc">{p.descripcion}</div>
                  <div className="inv-meta">
                    <span className="inv-price">
                      {displayPrice.hasDiscount ? (
                        <span className="price price--with-discount">
                          <span className="price__original">{formatPrice(displayPrice.original)}</span>
                          <span className="price__final">{formatPrice(displayPrice.final)}</span>
                          {displayPrice.discountPercentage && (
                            <span className="price__badge">-{displayPrice.discountPercentage}%</span>
                          )}
                        </span>
                      ) : (
                        <span className="price">{formatPrice(displayPrice.final)}</span>
                      )}
                    </span>
                    <span className="inv-stock">Stock: {p.stock}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal preview */}
      {preview && (() => {
        const previewDisplay = getDisplayPrice(preview as any);
        return (
          <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={() => setPreview(null)}>
            <div className="user-modal" onClick={(e)=>e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{preview.nombre}</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="inv-imgWrap" style={{ maxHeight: 360 }}>
                  {preview.imagen ? (
                    <img src={preview.imagen} alt={preview.nombre} onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'640\' height=\'360\'><rect width=\'100%\' height=\'100%\' fill=\'#E5E7EB\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Montserrat, sans-serif\' font-size=\'16\' fill=\'#6B7280\'>Imagen no disponible</text></svg>`); }} />
                  ) : (
                    <div className="inv-imgFallback">Imagen no disponible</div>
                  )}
                </div>
                <div>{preview.descripcion}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="inv-price">
                    {previewDisplay.hasDiscount ? (
                      <span className="price price--with-discount">
                        <span className="price__original">{formatPrice(previewDisplay.original)}</span>
                        <span className="price__final">{formatPrice(previewDisplay.final)}</span>
                        {previewDisplay.discountPercentage && (
                          <span className="price__badge">-{previewDisplay.discountPercentage}%</span>
                        )}
                      </span>
                    ) : (
                      <span className="price">{formatPrice(previewDisplay.final)}</span>
                    )}
                  </span>
                  <span className="inv-stock">Stock: {preview.stock}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-view" onClick={() => setPreview(null)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (<div className="user-toast" role="status" aria-live="polite">{toast}</div>)}
    </div>
  );
}

function downloadTemplate() {
  const header = 'id,nombre,descripcion,precio,stock,imagen\n';
  const sample = [
    ['P-001','Filtro FX-100','Filtro de alta eficiencia', '7990','25','https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=640'],
    ['P-002','Aceite 5W-30','Aceite sintético premium', '12990','40','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640'],
    ['P-003','Pastillas de freno','Alto desempeño', '19990','15','https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=640']
  ];
  const rows = sample.map(r => r.map(cell => /[",\n]/.test(cell) ? '"' + cell.replace(/"/g,'""') + '"' : cell).join(',')).join('\n');
  const csv = header + rows + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_inventario_fixsy.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
