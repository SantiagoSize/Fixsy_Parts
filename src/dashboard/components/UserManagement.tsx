import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

type Role = "Usuario" | "Admin" | "Soporte";
type Status = "Activo" | "Bloqueado" | "Suspendido";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  status: Status;
  foto?: string;
  suspensionHasta?: string;
  historialCompras?: { fecha: string; producto: string; monto: number }[];
  tickets?: { id: string; asunto: string; estado: string; fecha: string }[];
}

const STORAGE_KEY = "fixsyUsers";

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as User[] : [];
  } catch {
    return [];
  }
}

function saveUsers(list: User[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export default function UserManagement() {
  const { user } = useAuth();
  const isSupport = user?.role === 'Soporte';
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [diasSuspension, setDiasSuspension] = useState<number>(0);
  const [toast, setToast] = useState<string>("");
  const [showPurchDetail, setShowPurchDetail] = useState<{ idCompra: string } | null>(null);
  const [showConv, setShowConv] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Carga inicial + sincronización con usuarios de Auth si faltan
    const data = loadUsers();
    const now = new Date();
    let changed = false;
    let updated = data.map((u) => {
      if (u.status === "Suspendido" && u.suspensionHasta) {
        const fechaFin = new Date(u.suspensionHasta);
        if (now > fechaFin) { changed = true; return { ...u, status: "Activo", suspensionHasta: "" }; }
      }
      return u;
    });
    // Sincronizar con registro de Auth (fixsy_users) para asegurar que todos existan
    try {
      const raw = localStorage.getItem('fixsy_users');
      const authList = raw ? JSON.parse(raw) : [];
      if (Array.isArray(authList)) {
        const existingEmails = new Set(updated.map(u => (u.email || '').toLowerCase()));
        const toAdd: User[] = authList
          .filter((a: any) => !existingEmails.has((a?.email || '').toLowerCase()))
          .map((a: any) => ({
            id: a.id || `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
            nombre: a.nombre || '',
            apellido: a.apellido || '',
            email: a.email || '',
            role: (a.role || 'Usuario') as Role,
            status: 'Activo' as Status,
          }));
        if (toAdd.length > 0) {
          updated = [...updated, ...toAdd];
          changed = true;
        }
      }
    } catch {}
    if (changed) saveUsers(updated);
    setUsers(updated);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Soporte solo puede ver usuarios finales
    const base = isSupport ? users.filter(u => u.role === 'Usuario') : users;
    if (!q) return base;
    return base.filter((u) =>
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.apellido || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.id || "").toLowerCase().includes(q)
    );
  }, [users, query, isSupport]);

  const updateUser = (id: string, changes: Partial<User>, toastMsg?: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...changes } : u);
      saveUsers(next);
      const sel = next.find(u => u.id === id) || null;
      setSelected(sel);
      return next;
    });
    if (toastMsg) {
      setToast(toastMsg);
      window.setTimeout(() => setToast(""), 2500);
    }
  };

  const suspenderUsuario = (id: string, dias: number) => {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + (isNaN(dias) ? 0 : dias));
    updateUser(id, { status: "Suspendido", suspensionHasta: fechaFin.toISOString() }, "Usuario suspendido con éxito");
  };

  return (
    <div className="user-panel">
      <h2 style={{ marginTop: 0 }}>Gestión de Usuarios</h2>
      <input
        className="search-bar"
        placeholder="Buscar por nombre, correo o ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>ID</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px 0' }}>No se encontraron usuarios.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-tag ${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td><span className={`status ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td style={{ fontFamily: 'monospace' }}>{u.id}</td>
                  <td><button className="btn-view" onClick={() => { setSelected(u); setDiasSuspension(0); }}>Ver</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal__close" onClick={() => setSelected(null)} aria-label="Cerrar">✖</button>
            <img src={selected.foto || "/default-avatar.png"} alt="foto perfil" className="profile-img" />
            <h3 style={{ marginBottom: 4, textAlign: 'center' }}>{selected.nombre} {selected.apellido}</h3>
            <p style={{ margin: 0 }}><b>Email:</b> {selected.email}</p>
            <p style={{ margin: 0 }}><b>ID:</b> {selected.id}</p>
            <p style={{ margin: 0 }}><b>Rol:</b> {selected.role}</p>
            <p style={{ marginTop: 0 }}><b>Estado:</b> {selected.status}</p>
            {selected.status === "Suspendido" && selected.suspensionHasta && (
              <p><b>Suspensión hasta:</b> {new Date(selected.suspensionHasta).toLocaleDateString()}</p>
            )}

            <div className="actions" style={{ justifyContent: 'center' }}>
              <button onClick={() => updateUser(selected.id, { status: "Bloqueado" }, "Usuario bloqueado con éxito")}>Bloquear</button>
              <div className="suspension" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Días"
                  value={diasSuspension}
                  onChange={(e) => setDiasSuspension(Number(e.target.value))}
                />
                <button onClick={() => suspenderUsuario(selected.id, diasSuspension)}>Suspender</button>
              </div>
              <button onClick={() => updateUser(selected.id, { status: "Activo", suspensionHasta: "" }, "Usuario reactivado con éxito")}>Reactivar</button>
            </div>

            {/* Paneles: Compras (izq) / Correos (der) */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <h4>Historial de Compras</h4>
                <UserPurchasesBox userId={selected.id} onOpenDetail={(idCompra) => setShowPurchDetail({ idCompra })} />
              </div>
              <div>
                <h4>Mensajes</h4>
                <UserMessagesBox email={selected.email} onOpenConversation={(id) => setShowConv({ id })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay interno: detalle de compra */}
      {showPurchDetail && selected && (
        <PurchaseDetailOverlay userId={selected.id} idCompra={showPurchDetail.idCompra} onClose={() => setShowPurchDetail(null)} />
      )}

      {/* Overlay interno: conversación */}
      {showConv && selected && (
        <ConversationOverlay email={selected.email} id={showConv.id} onClose={() => setShowConv(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="user-toast" role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}

// ======== Subcomponentes para Compras y Mensajes ========

function loadCompras(): any[] {
  try { const raw = localStorage.getItem('fixsyCompras'); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}
function loadItems(): any[] {
  try { const raw = localStorage.getItem('fixsyItems'); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}
function inboxKeyFor(email: string) { return `fixsy_inbox_${(email||'').toLowerCase()}`; }
function loadInbox(email: string): any[] { try { const raw = localStorage.getItem(inboxKeyFor(email)); return raw ? JSON.parse(raw) : []; } catch { return []; } }

function UserPurchasesBox({ userId, onOpenDetail }: { userId: string; onOpenDetail: (idCompra: string) => void }) {
  const compras = React.useMemo(() => loadCompras().filter((c: any) => String(c.idUsuario) === String(userId)).sort((a: any, b: any) => (b.fecha||'').localeCompare(a.fecha||'')), [userId]);
  if (!compras.length) return <p>Sin registros.</p>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {compras.map((c: any) => (
        <div key={c.idCompra} className="user-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div><b>ID:</b> <span style={{ fontFamily: 'monospace' }}>{c.idCompra}</span></div>
            <div><b>Fecha:</b> {new Date(c.fecha).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div><b>Total:</b> ${c.total}</div>
            <button className="btn-view" onClick={() => onOpenDetail(c.idCompra)}>Ver detalles</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserMessagesBox({ email, onOpenConversation }: { email: string; onOpenConversation: (id: string) => void }) {
  const list = React.useMemo(() => (loadInbox(email) as any[]).sort((a,b) => (b.date||'').localeCompare(a.date||'')), [email]);
  if (!list.length) return <p>Sin mensajes.</p>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {list.slice(0, 10).map((m: any) => (
        <div key={m.id} className="user-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div><b>Asunto:</b> {m.subject || '(sin asunto)'}</div>
            <div style={{ color: '#6b7280' }}><b>De:</b> {m.from}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ color: '#6b7280' }}>{new Date(m.date).toLocaleString()}</div>
            <button className="btn-view" onClick={() => onOpenConversation(m.id)}>Ver conversación</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PurchaseDetailOverlay({ userId, idCompra, onClose }: { userId: string; idCompra: string; onClose: () => void }) {
  const compra = React.useMemo(() => loadCompras().find((c: any) => String(c.idUsuario) === String(userId) && c.idCompra === idCompra), [userId, idCompra]);
  const items = React.useMemo(() => (compra?.items || []), [compra]);
  const subtotal = items.reduce((s: number, it: any) => s + (it.precio||0), 0);
  const total = compra?.total || subtotal;
  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e)=>e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <h3 style={{ marginTop: 0 }}>Detalle de Compra</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((it: any) => (
            <div key={it.id} className="user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div><b>{it.nombre}</b></div>
                <div style={{ color: '#6b7280' }}>{it.descripcion}</div>
              </div>
              <div>${it.precio}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 12 }}>
          <div><b>Subtotal:</b> ${subtotal}</div>
          <div><b>Total:</b> ${total}</div>
        </div>
      </div>
    </div>
  );
}

function ConversationOverlay({ email, id, onClose }: { email: string; id: string; onClose: () => void }) {
  const [reply, setReply] = React.useState('');
  const list = React.useMemo(() => loadInbox(email), [email]);
  const base = React.useMemo(() => (list as any[]).find((m: any) => m.id === id), [list, id]);
  const msgs = React.useMemo(() => [base, ...((base?.replies)||[])].filter(Boolean), [base]);
  const save = (next: any[]) => { try { localStorage.setItem(inboxKeyFor(email), JSON.stringify(next)); } catch {} };
  const sendReply = () => {
    if (!reply.trim()) return;
    const next = (list as any[]).map((m: any) => m.id === id ? { ...m, replies: [ ...(m.replies||[]), { id: id + '_r_' + Date.now(), from: email, to: m.from, subject: 'Re: ' + (m.subject||''), message: reply, date: new Date().toISOString() } ] } : m);
    save(next);
    setReply('');
  };
  if (!base) return null;
  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e)=>e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <h3 style={{ marginTop: 0 }}>Conversación</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {msgs.map((m: any) => (
            <div key={m.id} className="user-item" style={{ display: 'grid', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><b>{m.subject}</b></div>
                <div style={{ color: '#6b7280' }}>{new Date(m.date).toLocaleString()}</div>
              </div>
              <div style={{ color: '#6b7280' }}><b>De:</b> {m.from} <b>Para:</b> {m.to}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="search-bar" placeholder="Escribe una respuesta" value={reply} onChange={e=>setReply(e.target.value)} />
            <button className="btn-view" onClick={sendReply}>Responder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
