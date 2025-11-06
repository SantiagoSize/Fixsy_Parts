import { PRODUCTS } from '../data/products';

export type InventoryItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  visitas?: number;
};

// Carga básica del inventario desde localStorage
export function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem('fixsy_inventory');
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
    localStorage.setItem('fixsy_inventory', JSON.stringify(out));
  } catch {}
}

// Semilla de inventario por defecto (una sola vez)
export function seedInventoryOnce() {
  try {
    const existing = loadInventory();
    if (Array.isArray(existing) && existing.length > 0) return;
  } catch {}

  try {
    const defaults = Array.isArray(PRODUCTS) ? PRODUCTS : [];

    const mapped: InventoryItem[] = defaults.map((p: any) => ({
      id: String(p.id ?? ''),
      nombre: String(p.nombre ?? ''),
      descripcion: String(p.descripcion ?? ''),
      precio: Number(p.precio ?? 0),
      stock: Number(p.stock ?? 0),
      imagen: String(p.imagen ?? ''),
    })).filter(it => it.nombre);

    if (mapped.length > 0) {
      localStorage.setItem('fixsy_inventory', JSON.stringify(mapped));
    }
  } catch {
    // Ignorar errores de semilla para no bloquear la app
  }
}
