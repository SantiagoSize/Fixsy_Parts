import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/auth";
import { STORAGE_KEYS } from "../../utils/storageKeys";
import { MgmtUser, UserStatus, InboxMessage, UserPurchase } from "../../types/user";
import { USERS_API_BASE, apiFetch, parseErrorMessage } from "../../utils/api";
import { UserTable } from "./user/UserTable";
import { UserDetailModal } from "./user/UserDetailModal";
import { UserMessagesBox } from "./user/UserMessagesBox";
import { UserPurchasesBox } from "./user/UserPurchasesBox";
import { formatPrice, getDisplayPrice } from "../../utils/price";

const COMPRAS_KEY = STORAGE_KEYS.mgmtPurchases;
const inboxKeyFor = (email: string) => `${STORAGE_KEYS.inboxPrefix}${(email || '').toLowerCase()}`;

const mapRoleSafe = (value: any, roleId?: any): Role => {
  const id = Number(roleId);
  if (id === 2) return 'Admin';
  if (id === 3) return 'Soporte';
  const v = String(value || '').toLowerCase();
  if (v.includes('admin')) return 'Admin';
  if (v.includes('soporte') || v.includes('support')) return 'Soporte';
  return 'Usuario';
};

function loadCompras(): UserPurchase[] {
  try { const raw = localStorage.getItem(COMPRAS_KEY); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}

function loadInbox(email: string): InboxMessage[] {
  try { const raw = localStorage.getItem(inboxKeyFor(email)); return raw ? JSON.parse(raw) as InboxMessage[] : []; } catch { return []; }
}

function PurchaseDetailOverlay({ userId, idCompra, onClose }: { userId: string; idCompra: string; onClose: () => void }) {
  const compra = React.useMemo(() => loadCompras().find((c: any) => String((c as any).idUsuario) === String(userId) && (c as any).idCompra === idCompra), [userId, idCompra]);
  const items = React.useMemo(() => (compra as any)?.items || [], [compra]);
  const subtotal = items.reduce((s: number, it: any) => s + (getDisplayPrice(it || { precio: 0 }).final || 0), 0);
  const total = (compra as any)?.total || subtotal;
  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <h3 style={{ marginTop: 0 }}>Detalle de Compra</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((it: any) => (
            <div key={it.id || it.nombre} className="user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div><b>{it.nombre}</b></div>
                <div style={{ color: '#6b7280' }}>{it.descripcion}</div>
              </div>
              <div className="price">{formatPrice(getDisplayPrice(it || { precio: 0 }).final || 0)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 12 }}>
          <div><b>Subtotal:</b> {formatPrice(subtotal)}</div>
          <div><b>Total:</b> {formatPrice(total)}</div>
        </div>
      </div>
    </div>
  );
}

function ConversationOverlay({ email, id, onClose }: { email: string; id: string; onClose: () => void }) {
  const [reply, setReply] = React.useState('');
  const list = React.useMemo(() => loadInbox(email), [email]);
  const base = React.useMemo(() => list.find((m) => m.id === id), [list, id]);
  const msgs = React.useMemo(() => [base, ...((base?.replies) || [])].filter(Boolean) as InboxMessage[], [base]);
  const save = (next: InboxMessage[]) => { try { localStorage.setItem(inboxKeyFor(email), JSON.stringify(next)); } catch {} };
  const sendReply = () => {
    if (!reply.trim() || !base) return;
    const next = list.map((m) => m.id === id ? {
      ...m,
      replies: [
        ...(m.replies || []),
        { id: `${id}_r_${Date.now()}`, from: email, to: m.from, subject: 'Re: ' + (m.subject || ''), message: reply, date: new Date().toISOString() }
      ]
    } : m);
    save(next);
    setReply('');
  };
  if (!base) return null;
  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <h3 style={{ marginTop: 0 }}>Conversacion</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {msgs.map((m) => (
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
            <input className="search-bar" placeholder="Escribe una respuesta" value={reply} onChange={e => setReply(e.target.value)} />
            <button className="btn-view" onClick={sendReply}>Responder</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { user } = useAuth();
  const isSupport = user?.role === 'Soporte';
  const [users, setUsers] = useState<MgmtUser[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MgmtUser | null>(null);
  const [toast, setToast] = useState<string>("");
  const [showPurchDetail, setShowPurchDetail] = useState<{ idCompra: string } | null>(null);
  const [showConv, setShowConv] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeStatus = (status: any): UserStatus => {
    if (status === "Bloqueado" || status === "Suspendido") return status;
    return "Activo";
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await apiFetch<any[]>(USERS_API_BASE, '/api/users');
        const mapped: MgmtUser[] = (Array.isArray(list) ? list : []).map((u: any) => ({
          id: String(u.id ?? u.userId ?? u.uid ?? u.email ?? `u_${Math.random().toString(36).slice(2, 8)}`),
          nombre: u.nombre ?? u.firstName ?? '',
          apellido: u.apellido ?? u.lastName ?? '',
          email: u.email ?? '',
          role: mapRoleSafe(
            u.role ?? u.rol ?? u.authority ?? u.roleName ?? (u.role?.name ?? 'Usuario'),
            u.roleId ?? u.role_id ?? u.role?.id
          ),
          status: normalizeStatus(String(u.status ?? 'Activo')),
          foto: u.profilePic || u.avatarUrl || u.avatar,
          suspensionHasta: u.suspensionHasta || '',
        }));
        setUsers(mapped);
      } catch (err: any) {
        const msg = err?.message || 'No se pudo cargar la lista de usuarios.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = isSupport ? users.filter(u => u.role === 'Usuario') : users;
    if (!q) return base;
    return base.filter((u) =>
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.apellido || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.id || "").toLowerCase().includes(q)
    );
  }, [users, query, isSupport]);

  const updateUser = (id: string, changes: Partial<MgmtUser>, toastMsg?: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...changes } : u);
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
    updateUser(id, { status: "Suspendido" as UserStatus, suspensionHasta: fechaFin.toISOString() }, "Usuario suspendido");
  };

  return (
    <div className="user-panel">
      <h2 style={{ marginTop: 0 }}>Gestion de Usuarios</h2>
      {error && <div className="user-toast" role="alert">{error}</div>}
      <input
        className="search-bar"
        placeholder="Buscar por nombre, correo o ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <div style={{ padding: 12 }}>Cargando usuarios...</div>
      ) : (
        <UserTable users={filtered} onSelect={(u) => { setSelected(u); }} />
      )}

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateUser}
          onSuspend={suspenderUsuario}
          onOpenPurchase={(idCompra) => setShowPurchDetail({ idCompra })}
          onOpenConversation={(id) => setShowConv({ id })}
        />
      )}

      {showPurchDetail && selected && (
        <PurchaseDetailOverlay userId={selected.id} idCompra={showPurchDetail.idCompra} onClose={() => setShowPurchDetail(null)} />
      )}

      {showConv && selected && (
        <ConversationOverlay email={selected.email} id={showConv.id} onClose={() => setShowConv(null)} />
      )}

      {toast && (
        <div className="user-toast" role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}
