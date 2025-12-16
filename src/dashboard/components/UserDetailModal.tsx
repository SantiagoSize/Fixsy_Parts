import React from "react";
import { MgmtUser, Status } from "./UserTypes";
import { UserPurchasesBox } from "./UserPurchasesBox";
import { UserMessagesBox } from "./UserMessagesBox";

type Props = {
  user: MgmtUser;
  roles: { id: number; nombre: string }[];
  onClose: () => void;
  onStatusChange: (id: string, status: Status, suspensionHasta?: string) => void;
  onRoleChange: (id: string, roleId: number) => void;
  onOpenPurchase: (idCompra: string) => void;
  onOpenConversation: (id: string) => void;
};

export function UserDetailModal({
  user,
  roles,
  onClose,
  onStatusChange,
  onRoleChange,
  onOpenPurchase,
  onOpenConversation,
}: Props) {
  const [diasSuspension, setDiasSuspension] = React.useState<number>(0);
  const [selectedRole, setSelectedRole] = React.useState(user.roleId || 0);

  // Sync state if user changes
  React.useEffect(() => {
    if (user.roleId) setSelectedRole(user.roleId);
  }, [user.roleId]);

  const handleRoleSubmit = () => {
    if (selectedRole && selectedRole !== user.roleId) {
      onRoleChange(user.id, selectedRole);
    }
  };

  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <img src={user.foto || "/default-avatar.png"} alt="foto perfil" className="profile-img" />
        <h3 style={{ marginBottom: 4, textAlign: 'center' }}>{user.nombre} {user.apellido}</h3>
        <p style={{ margin: 0 }}><b>Email:</b> {user.email}</p>
        <p style={{ margin: 0 }}><b>ID:</b> {user.id}</p>

        <div style={{ margin: "16px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "12px 0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontWeight: 600 }}>Rol:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(Number(e.target.value))}
            >
              {roles.length === 0 && <option value={user.roleId || 0}>{user.role}</option>}
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-primary" onClick={handleRoleSubmit} disabled={selectedRole === user.roleId}>
              Actualizar
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontWeight: 600 }}>Estado:</label>
            <span className={`badge ${user.status === 'Activo' ? 'bg-success' : 'bg-danger'}`}>{user.status}</span>
          </div>
        </div>

        {user.status === "Suspendido" && user.suspensionHasta && (
          <p><b>Suspension hasta:</b> {new Date(user.suspensionHasta).toLocaleDateString()}</p>
        )}

        <div className="actions" style={{ justifyContent: 'center' }}>
          {user.status !== "Bloqueado" && (
            <button className="btn btn-outline-danger" onClick={() => onStatusChange(user.id, "Bloqueado")}>Bloquear</button>
          )}

          <div className="suspension" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Dias"
              value={diasSuspension}
              onChange={(e) => setDiasSuspension(Number(e.target.value))}
            />
            <button onClick={() => {
              const fechaFin = new Date();
              fechaFin.setDate(fechaFin.getDate() + diasSuspension);
              onStatusChange(user.id, "Suspendido", fechaFin.toISOString());
            }}>Suspender</button>
          </div>

          {(user.status === "Bloqueado" || user.status === "Suspendido") && (
            <button className="btn btn-success" onClick={() => onStatusChange(user.id, "Activo")}>Reactivar</button>
          )}
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <h4>Historial de Compras</h4>
            <UserPurchasesBox userId={user.id} onOpenDetail={onOpenPurchase} />
          </div>
          <div>
            <h4>Mensajes</h4>
            <UserMessagesBox email={user.email} onOpenConversation={onOpenConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
