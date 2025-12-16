import React from "react";
import { MgmtUser, UserStatus } from "../../../types/user";
import { UserPurchasesBox } from "./UserPurchasesBox";
import { UserMessagesBox } from "./UserMessagesBox";

import { RoleOption } from "../UserManagement";

type Props = {
  user: MgmtUser;
  roles: RoleOption[];
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<MgmtUser>, toastMsg?: string) => void;
  onRoleChange: (id: string, roleId: number) => void;
  onSuspend: (id: string, dias: number) => void;
  onOpenPurchase: (idCompra: string) => void;
  onOpenConversation: (id: string) => void;
};

export function UserDetailModal({
  user,
  roles,
  onClose,
  onUpdate,
  onRoleChange,
  onSuspend,
  onOpenPurchase,
  onOpenConversation,
}: Props) {
  const [diasSuspension, setDiasSuspension] = React.useState<number>(0);

  return (
    <>
      <div className="modal-backdrop show" style={{ opacity: 0.5 }}></div>
      <div className="modal show d-block" tabIndex={-1} role="dialog" onClick={onClose}>
        <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content shadow">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title">Detalle de Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="d-flex flex-column align-items-center mb-4">
                <img
                  src={user.foto || "/default-avatar.png"}
                  alt="Perfil"
                  className="rounded-circle mb-3 shadow-sm"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/100?text=U'}
                />
                <h4>{user.nombre} {user.apellido}</h4>
                <p className="text-muted mb-1">{user.email}</p>
                <div className="d-flex gap-2">
                  <span className="badge bg-secondary">{user.role}</span>
                  <span className={`badge ${user.status === 'Activo' ? 'bg-success' : 'bg-danger'}`}>{user.status}</span>
                </div>
                {user.status === "Suspendido" && user.suspensionHasta && (
                  <div className="alert alert-warning mt-2 py-1 px-3 mt-2">
                    <small>Suspendido hasta: {new Date(user.suspensionHasta).toLocaleDateString()}</small>
                  </div>
                )}
              </div>

              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">Acciones Administrativas</h6>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">

                    {user.status !== "Bloqueado" ? (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onUpdate(user.id, { status: "Bloqueado" as UserStatus }, "Usuario bloqueado")}
                        disabled={user.role === 'Admin'}
                      >
                        <i className="bi bi-slash-circle me-1"></i> Bloquear
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-success"
                        onClick={() => onUpdate(user.id, { status: "Activo" as UserStatus }, "Usuario desbloqueado")}
                      >
                        <i className="bi bi-check-circle me-1"></i> Desbloquear
                      </button>
                    )}

                    <div className="input-group" style={{ width: 'auto' }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Días"
                        style={{ width: '80px' }}
                        value={diasSuspension}
                        onChange={(e) => setDiasSuspension(Number(e.target.value))}
                        disabled={user.role === 'Admin'}
                      />
                      <button
                        className="btn btn-outline-warning text-dark"
                        onClick={() => onSuspend(user.id, diasSuspension)}
                        disabled={!diasSuspension || user.role === 'Admin'}
                      >
                        Suspender
                      </button>
                    </div>

                    {user.status !== "Activo" && (
                      <button
                        className="btn btn-success"
                        onClick={() => onUpdate(user.id, { status: "Activo" as UserStatus, suspensionHasta: "" }, "Usuario reactivado")}
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">Historial de Compras</div>
                    <div className="card-body p-0">
                      <UserPurchasesBox userId={user.id} onOpenDetail={onOpenPurchase} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">Mensajes</div>
                    <div className="card-body p-0">
                      <UserMessagesBox email={user.email} onOpenConversation={onOpenConversation} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
