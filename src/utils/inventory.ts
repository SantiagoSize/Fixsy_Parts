import { STORAGE_KEYS } from './storageKeys';

export type InventoryItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  visitas?: number;
};

export function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.inventory);
    const list = raw ? JSON.parse(raw) as InventoryItem[] : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export function incrementVisit(id: string) {
  try {
    const list = loadInventory();
    const idx = list.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    const cur = list[idx];
    const next = { ...cur, visitas: (cur.visitas || 0) + 1 };
    const out = [...list];
    out[idx] = next;
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(out));
  } catch {}
}

// Semilla desde CSV de assets (solo si el inventario está vacío)
export async function seedInventoryFromCsvOnce(): Promise<void> {
  try {
    const existing = loadInventory();
    if (Array.isArray(existing) && existing.length > 0) return;
  } catch {}
  try {
    const url = new URL('../assets/inventario_fixsy_pixabay.csv', import.meta.url).toString();
    const res = await fetch(url);
    if (!res.ok) return;
    const text = await res.text();
    const items = parseCsvToInventory(text);
    if (items.length) localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(items));
  } catch {}
}

function parseCsvToInventory(text: string): InventoryItem[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const first = lines[0].replace(/^\uFEFF/, '');
  const header = first.split(',').map(h => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const iId = idx('id');
  const iNombre = idx('nombre');
  const iDesc = idx('descripcion');
  const iPrecio = idx('precio');
  const iStock = idx('stock');
  const iImagen = idx('imagen');
  const out: InventoryItem[] = [];
  for (let li = 1; li < lines.length; li++) {
    const row = csvSplit(lines[li]);
    const get = (i: number) => (i >= 0 && i < row.length ? row[i] : '').trim();
    const precioNum = Number(get(iPrecio).replace(/[^0-9.-]/g, '')) || 0;
    const stockNum = Number(get(iStock).replace(/[^0-9.-]/g, '')) || 0;
    const it: InventoryItem = {
      id: get(iId) || `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      nombre: get(iNombre),
      descripcion: get(iDesc),
      precio: precioNum,
      stock: stockNum,
      imagen: get(iImagen),
    } as InventoryItem;
    if (it.nombre) out.push(it);
  }
  return out;
}

function csvSplit(line: string): string[] {
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { res.push(cur); cur = ''; }
    else { cur += ch; }
  }
  res.push(cur);
  return res;
}

// Actualiza imágenes del inventario existente con las del CSV (no borra datos)
export async function patchInventoryImagesFromCsv(): Promise<void> {
  try {
    const url = new URL('../assets/inventario_fixsy_pixabay.csv', import.meta.url).toString();
    const res = await fetch(url);
    if (!res.ok) return;
    const text = await res.text();
    const csvItems = parseCsvToInventory(text);
    if (!csvItems.length) return;
    const byId = new Map<string, string>();
    const byName = new Map<string, string>();
    csvItems.forEach(it => {
      if (it.id) byId.set(String(it.id), it.imagen);
      if (it.nombre) byName.set(it.nombre.toLowerCase(), it.imagen);
    });
    const current = loadInventory();
    let changed = false;
    const updated = current.map(it => {
      const hasValid = it.imagen && String(it.imagen).trim().length > 0;
      const candidate = byId.get(String(it.id)) || byName.get((it.nombre || '').toLowerCase()) || '';
      if (!hasValid && candidate) {
        changed = true;
        return { ...it, imagen: candidate };
      }
      return it;
    });
    if (changed) localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(updated));
  } catch {}
}


// Sobrescribe las imágenes existentes con las del CSV cuando coinciden por id o nombre
export async function overwriteInventoryImagesFromCsv(): Promise<void> {
  try {
    const url = new URL('../assets/inventario_fixsy_pixabay.csv', import.meta.url).toString();
    const res = await fetch(url);
    if (!res.ok) return;
    const text = await res.text();
    const csvItems = parseCsvToInventory(text);
    if (!csvItems.length) return;
    const byId = new Map<string, string>();
    const byName = new Map<string, string>();
    csvItems.forEach(it => {
      if (it.id) byId.set(String(it.id), it.imagen);
      if (it.nombre) byName.set(it.nombre.toLowerCase(), it.imagen);
    });
    const current = loadInventory();
    let changed = false;
    const updated = current.map(it => {
      const candidate = byId.get(String(it.id)) || byName.get((it.nombre || '').toLowerCase()) || '';
      if (candidate && candidate !== it.imagen) {
        changed = true;
        return { ...it, imagen: candidate };
      }
      return it;
    });
    if (changed) localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(updated));
  } catch {}
}
