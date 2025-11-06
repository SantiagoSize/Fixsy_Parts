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

