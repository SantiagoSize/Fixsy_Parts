import React from "react";
import { STORAGE_KEYS } from "../../utils/storageKeys";

type Ticket = { id: string; ownerEmail: string; subject: string; status: string; createdAt: string };

function loadUsersCount() {
  try { const raw = localStorage.getItem(STORAGE_KEYS.authUsers); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.length : 0; } catch { return 0; }
}
function loadCustomersCount() {
  try { const raw = localStorage.getItem(STORAGE_KEYS.authUsers); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.filter((u:any)=>String(u.role)==='Usuario').length : 0; } catch { return 0; }
}
function loadInventoryCount() {
  try { const raw = localStorage.getItem(STORAGE_KEYS.inventory); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.length : 0; } catch { return 0; }
}
function loadTicketsAll(): Ticket[] {
  const out: Ticket[] = [];
  try {
    for (let i=0;i<localStorage.length;i++) {
      const k = localStorage.key(i) || '';
      if (k.startsWith(STORAGE_KEYS.ticketsPrefix)) {
        const arr = JSON.parse(localStorage.getItem(k) || '[]');
        if (Array.isArray(arr)) out.push(...arr);
      }
    }
  } catch {}
  return out;
}

function monthBuckets(tickets: Ticket[], monthsBack = 6) {
  const now = new Date();
  const labels: string[] = [];
  const data: number[] = [];
  for (let m = monthsBack - 1; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    labels.push(key);
    const cnt = tickets.filter(t => {
      const cd = new Date(t.createdAt||'');
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    data.push(cnt);
  }
  return { labels, data };
}

export default function DashboardWidgets() {
  const [users, setUsers] = React.useState(0);
  const [customers, setCustomers] = React.useState(0);
  const [inventory, setInventory] = React.useState(0);
  const [chart, setChart] = React.useState<{labels:string[];data:number[]}>({ labels: [], data: []});

  const refresh = React.useCallback(() => {
    setUsers(loadUsersCount());
    setCustomers(loadCustomersCount());
    setInventory(loadInventoryCount());
    const t = loadTicketsAll();
    setChart(monthBuckets(t, 6));
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);
  React.useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onStorage); };
  }, [refresh]);

  const max = Math.max(1, ...chart.data);

  return (
    <div className="dw-grid">
      {/* KPI cards */}
      <div className="dw-card">
        <div className="dw-card__title">Usuarios creados</div>
        <div className="dw-card__value">{users}</div>
      </div>
      <div className="dw-card">
        <div className="dw-card__title">Clientes</div>
        <div className="dw-card__value">{customers}</div>
      </div>
      <div className="dw-card">
        <div className="dw-card__title">Productos en inventario</div>
        <div className="dw-card__value">{inventory}</div>
      </div>

      {/* Bar chart */}
      <div className="dw-card dw-card--span">
        <div className="dw-card__title" style={{ marginBottom: 8 }}>Tickets por mes (últimos 6)</div>
        <div className="dw-chart">
          {chart.labels.map((lab, i) => {
            const v = chart.data[i] || 0;
            const h = (v / max) * 100;
            return (
              <div key={lab} className="dw-bar">
                <div className="dw-bar__value">{v}</div>
                <div className="dw-bar__inner" style={{ height: `${Math.max(6, h)}%` }} title={`${lab}: ${v}`} />
                <div className="dw-bar__label">{lab.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
