import { uuid } from './uuid';

type Item = { id: string; nombre: string; descripcion: string; precio: number };
type Compra = { idCompra: string; idUsuario: string; fecha: string; items: Item[]; total: number };

const ITEMS_KEY = 'fixsyItems';
const COMPRAS_KEY = 'fixsyCompras';
const AUTH_KEY = 'fixsy_users';

function loadAuth(): { id: string; email: string }[] {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.map((u: any) => ({ id: String(u.id), email: String(u.email || '').toLowerCase() }));
  } catch { return []; }
}

export function seedItemsOnce() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list) && list.length > 0) return;
  } catch {}
  const items: Item[] = [
    { id: uuid(), nombre: 'Filtro FX-100', descripcion: 'Filtro de alta eficiencia', precio: 15990 },
    { id: uuid(), nombre: 'Aceite 5W-30', descripcion: 'Aceite sintético premium', precio: 22990 },
    { id: uuid(), nombre: 'Bujías NGK', descripcion: 'Juego de 4 bujías', precio: 18990 },
    { id: uuid(), nombre: 'Pastillas de freno', descripcion: 'Alto desempeño', precio: 34990 },
    { id: uuid(), nombre: 'Discos de freno', descripcion: 'Par de discos ventilados', precio: 59990 },
    { id: uuid(), nombre: 'Kit correas', descripcion: 'Paquete de correas de accesorios', precio: 44990 },
    { id: uuid(), nombre: 'Amortiguadores', descripcion: 'Par de amortiguadores delanteros', precio: 89990 },
    { id: uuid(), nombre: 'Filtro de aire', descripcion: 'Filtro OEM alta durabilidad', precio: 9990 },
    { id: uuid(), nombre: 'Aceite 10W-40', descripcion: 'Aceite semisintético', precio: 19990 },
  ];
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch {}
}

export function seedPurchasesOnce() {
  try {
    const raw = localStorage.getItem(COMPRAS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list) && list.length > 0) return;
  } catch {}
  const itemsRaw = localStorage.getItem(ITEMS_KEY);
  const items: Item[] = itemsRaw ? JSON.parse(itemsRaw) : [];
  const pick = (n: number) => items.slice(0, Math.max(1, Math.min(items.length, n)));
  const auth = loadAuth();
  const compras: Compra[] = [];
  // Crear algunas compras para los usuarios existentes
  auth.forEach((u, idx) => {
    const pack = pick((idx % 3) + 1);
    const total = pack.reduce((s, it) => s + (it.precio || 0), 0);
    compras.push({ idCompra: uuid(), idUsuario: u.id, fecha: new Date(Date.now() - (idx * 86400000)).toISOString(), items: pack, total });
  });
  try { localStorage.setItem(COMPRAS_KEY, JSON.stringify(compras)); } catch {}
}

export function seedPurchasesForEmails(emails: string[]) {
  try {
    const itemsRaw = localStorage.getItem(ITEMS_KEY);
    const items: Item[] = itemsRaw ? JSON.parse(itemsRaw) : [];
    if (!Array.isArray(items) || items.length === 0) return;

    const comprasRaw = localStorage.getItem(COMPRAS_KEY);
    const compras: Compra[] = comprasRaw ? JSON.parse(comprasRaw) : [];

    const auth = loadAuth();
    const targets = emails.map(e => (e || '').toLowerCase());
    const users = auth.filter(u => targets.includes((u.email || '').toLowerCase()));

    let changed = false;
    users.forEach((u, idx) => {
      const existing = compras.filter(c => String(c.idUsuario) === String(u.id));
      let need = 3 - existing.length;
      let offsetHours = idx * 3600_000;
      const makePack = (start: number, len: number) => {
        const s = start % items.length;
        const end = Math.min(items.length, s + len);
        const pack = items.slice(s, end);
        return pack.length ? pack : [items[0]];
      };
      while (need > 0) {
        const pack = makePack(need + idx, 2 + ((need + idx) % 2));
        const total = pack.reduce((s, it) => s + it.precio, 0);
        compras.push({ idCompra: uuid(), idUsuario: u.id, fecha: new Date(Date.now() - offsetHours).toISOString(), items: pack, total });
        need--;
        offsetHours += 86_400_000 / 2; // medio día entre compras
        changed = true;
      }
    });

    if (changed) localStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
  } catch {}
}
