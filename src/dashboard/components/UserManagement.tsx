import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/auth";
import { STORAGE_KEYS } from "../../utils/storageKeys";
import { MgmtUser, UserStatus, InboxMessage, UserPurchase } from "../../types/user";
import { USERS_API_BASE, apiFetch, parseErrorMessage } from "../../utils/api";
import { UserTable } from "./user/UserTable";
import { UserDetailModal } from "./user/UserDetailModal";
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

// --- Sub-components for overlays (Inline for simplicity, can be moved if needed) ---
function PurchaseDetailOverlay({ userId, idCompra, onClose }: { userId: string; idCompra: string; onClose: () => void }) {
  const compra = React.useMemo(() => loadCompras().find((c: any) => String((c as any).idUsuario) === String(userId) && (c as any).idCompra === idCompra), [userId, idCompra]);
  const items = React.useMemo(() => (compra as any)?.items || [], [compra]);
  const subtotal = items.reduce((s: number, it: any) => s + (getDisplayPrice(it || { precio: 0 }).final || 0), 0);
  const total = (compra as any)?.total || subtotal;

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1055 }}></div>
      <div className="modal show d-block" style={{ zIndex: 1060 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalle de Compra</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {items.map((it: any) => (
                <div key={it.id || it.nombre} className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                  <div>
                    <div className="fw-bold">{it.nombre}</div>
                    <small className="text-muted">{it.descripcion}</small>
                  </div>
                  <div className="fw-bold text-primary">
                    {formatPrice(getDisplayPrice(it || { precio: 0 }).final || 0)}
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end mt-3 border-top pt-2">
                <div className="text-end">
                  <div>Subtotal: {formatPrice(subtotal)}</div>
                  <div className="fw-bold fs-5">Total: {formatPrice(total)}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ConversationOverlay({ email, id, onClose }: { email: string; id: string; onClose: () => void }) {
  const [reply, setReply] = React.useState('');
  const list = React.useMemo(() => loadInbox(email), [email]);
  const base = React.useMemo(() => list.find((m) => m.id === id), [list, id]);
  const msgs = React.useMemo(() => [base, ...((base?.replies) || [])].filter(Boolean) as InboxMessage[], [base]);
  const save = (next: InboxMessage[]) => { try { localStorage.setItem(inboxKeyFor(email), JSON.stringify(next)); } catch { } };

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
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1055 }}></div>
      <div className="modal show d-block" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Conversación: {base.subject}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body bg-light" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="d-flex flex-column gap-3">
                {msgs.map((m) => (
                  <div key={m.id} className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">{new Date(m.date).toLocaleString()}</small>
                        <small className="text-muted">De: {m.from}</small>
                      </div>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer d-block">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Escribe una respuesta..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                />
                <button className="btn btn-primary" onClick={sendReply}>
                  <i className="bi bi-send"></i> Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserManagement() {
  const { user, authenticatedFetch } = useAuth();
  const isSupport = user?.role === 'Soporte';
  const [users, setUsers] = useState<MgmtUser[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MgmtUser | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null);

  const [showPurchDetail, setShowPurchDetail] = useState<{ idCompra: string } | null>(null);
  const [showConv, setShowConv] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeStatus = (status: any): UserStatus => {
    if (status === "Bloqueado" || status === "Suspendido") return status;
    return "Activo";
  };

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch<any[]>('/api/users');
      if (!res.ok) throw new Error(res.error || `Error ${res.status}`);
      const list = res.data;
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
      console.error("Error fetching users:", err);
      const msg = err?.message || 'No se pudo cargar la lista de usuarios.';
      if (msg.includes("403")) {
        setError("Acceso denegado. No tienes permisos para ver esta lista.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
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

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateUser = (id: string, changes: Partial<MgmtUser>, toastMsg?: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...changes } : u);
      const sel = next.find(u => u.id === id) || null;
      if (selected && selected.id === id) setSelected(sel);
      return next;
    });
    if (toastMsg) showToast(toastMsg);
  };

  const suspenderUsuario = (id: string, dias: number) => {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + (isNaN(dias) ? 0 : dias));
    updateUser(id, { status: "Suspendido" as UserStatus, suspensionHasta: fechaFin.toISOString() }, `Usuario suspendido por ${dias} días`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold text-primary">
              <i className="bi bi-people-fill me-2"></i>Gestión de Usuarios
            </h4>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={loadUsers} disabled={loading}>
                <i className="bi bi-arrow-clockwise me-1"></i> Recargar
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className={`alert ${error.includes('403') ? 'alert-danger' : 'alert-warning'} role="alert"`}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              {error.includes('403') && <div className="mt-1 small">Asegúrese de tener credenciales de Administrador (adminfixsy.cl).</div>}
            </div>
          )}

          {toast && (
            <div
              className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3 shadow`}
              style={{ zIndex: 1100 }}
            >
              {toast.msg}
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre o email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">Total: {filteredUsers.length} usuarios</small>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Cargando registros...</p>
            </div>
          ) : (
            <UserTable users={filteredUsers} onSelect={setSelected} />
          )}
        </div>
      </div>

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateUser}
          onSuspend={suspenderUsuario}
          onOpenPurchase={(id) => {
            setShowPurchDetail({ idCompra: id });
          }}
          onOpenConversation={(id) => {
            setShowConv({ id });
          }}
        />
      )}

      {showPurchDetail && selected && (
        <PurchaseDetailOverlay userId={selected.id} idCompra={showPurchDetail.idCompra} onClose={() => setShowPurchDetail(null)} />
      )}

      {showConv && selected && (
        <ConversationOverlay email={selected.email} id={showConv.id} onClose={() => setShowConv(null)} />
      )}
    </div>
  );
}
