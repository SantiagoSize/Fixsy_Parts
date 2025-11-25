import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/auth";
import { STORAGE_KEYS } from "../../utils/storageKeys";
import { MgmtUser, UserStatus, InboxMessage, UserPurchase } from "../../types/user";
import { UserTable } from "./user/UserTable";
import { UserDetailModal } from "./user/UserDetailModal";
import { UserMessagesBox } from "./user/UserMessagesBox";
import { UserPurchasesBox } from "./user/UserPurchasesBox";

const MGMT_KEY = STORAGE_KEYS.mgmtUsers;
const AUTH_KEY = STORAGE_KEYS.authUsers;
const COMPRAS_KEY = STORAGE_KEYS.mgmtPurchases;
const inboxKeyFor = (email: string) => `${STORAGE_KEYS.inboxPrefix}${(email || '').toLowerCase()}`;

function loadUsers(): MgmtUser[] {
  try {
    const raw = localStorage.getItem(MGMT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as MgmtUser[] : [];
  } catch {
    return [];
  }
}

function saveUsers(list: MgmtUser[]) {
  try { localStorage.setItem(MGMT_KEY, JSON.stringify(list)); } catch {}
}

function loadCompras(): UserPurchase[] {
  try { const raw = localStorage.getItem(COMPRAS_KEY); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}

function loadInbox(email: string): InboxMessage[] {
  try { const raw = localStorage.getItem(inboxKeyFor(email)); return raw ? JSON.parse(raw) as InboxMessage[] : []; } catch { return []; }
}

function PurchaseDetailOverlay({ userId, idCompra, onClose }: { userId: string; idCompra: string; onClose: () => void }) {
  const compra = React.useMemo(() => loadCompras().find((c: any) => String((c as any).idUsuario) === String(userId) && (c as any).idCompra === idCompra), [userId, idCompra]);
  const items = React.useMemo(() => (compra as any)?.items || [], [compra]);
  const subtotal = items.reduce((s: number, it: any) => s + (it.precio || 0), 0);
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

  const normalizeStatus = (status: any): UserStatus => {
    if (status === "Bloqueado" || status === "Suspendido") return status;
    return "Activo";
  };

  useEffect(() => {
    const data = loadUsers();
    const now = new Date();
    let changed = false;
    let updated: MgmtUser[] = data.map((u) => {
      if (normalizeStatus(u.status) === "Suspendido" && u.suspensionHasta) {
        const fechaFin = new Date(u.suspensionHasta);
        if (now > fechaFin) { changed = true; return { ...u, status: "Activo" as UserStatus, suspensionHasta: "" }; }
      }
      return { ...u, status: normalizeStatus(u.status) };
    });
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      const authList = raw ? JSON.parse(raw) : [];
      if (Array.isArray(authList)) {
        const existingEmails = new Set(updated.map(u => (u.email || '').toLowerCase()));
        const toAdd: MgmtUser[] = authList
          .filter((a: any) => !existingEmails.has((a?.email || '').toLowerCase()))
          .map((a: any) => ({
            id: a.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            nombre: a.nombre || '',
            apellido: a.apellido || '',
            email: a.email || '',
            role: (a.role || 'Usuario') as Role,
            status: 'Activo' as UserStatus,
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
    updateUser(id, { status: "Suspendido" as UserStatus, suspensionHasta: fechaFin.toISOString() }, "Usuario suspendido");
  };

  return (
    <div className="user-panel">
      <h2 style={{ marginTop: 0 }}>Gestion de Usuarios</h2>
      <input
        className="search-bar"
        placeholder="Buscar por nombre, correo o ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <UserTable users={filtered} onSelect={(u) => { setSelected(u); }} />

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
