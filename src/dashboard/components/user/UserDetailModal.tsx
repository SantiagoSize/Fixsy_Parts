import React from "react";
import { MgmtUser, UserStatus } from "../../../types/user";
import { UserPurchasesBox } from "./UserPurchasesBox";
import { UserMessagesBox } from "./UserMessagesBox";

type Props = {
  user: MgmtUser;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<MgmtUser>, toastMsg?: string) => void;
  onSuspend: (id: string, dias: number) => void;
  onOpenPurchase: (idCompra: string) => void;
  onOpenConversation: (id: string) => void;
};

export function UserDetailModal({
  user,
  onClose,
  onUpdate,
  onSuspend,
  onOpenPurchase,
  onOpenConversation,
}: Props) {
  const [diasSuspension, setDiasSuspension] = React.useState<number>(0);

  return (
    <div className="user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-modal__close" onClick={onClose} aria-label="Cerrar">Volver</button>
        <img src={user.foto || "/default-avatar.png"} alt="foto perfil" className="profile-img" />
        <h3 style={{ marginBottom: 4, textAlign: 'center' }}>{user.nombre} {user.apellido}</h3>
        <p style={{ margin: 0 }}><b>Email:</b> {user.email}</p>
        <p style={{ margin: 0 }}><b>ID:</b> {user.id}</p>
        <p style={{ margin: 0 }}><b>Rol:</b> {user.role}</p>
        <p style={{ marginTop: 0 }}><b>Estado:</b> {user.status}</p>
        {user.status === "Suspendido" && user.suspensionHasta && (
          <p><b>Suspension hasta:</b> {new Date(user.suspensionHasta).toLocaleDateString()}</p>
        )}

        <div className="actions" style={{ justifyContent: 'center' }}>
          <button onClick={() => onUpdate(user.id, { status: "Bloqueado" as UserStatus }, "Usuario bloqueado")}>Bloquear</button>
          <div className="suspension" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Dias"
              value={diasSuspension}
              onChange={(e) => setDiasSuspension(Number(e.target.value))}
            />
            <button onClick={() => onSuspend(user.id, diasSuspension)}>Suspender</button>
          </div>
          <button onClick={() => onUpdate(user.id, { status: "Activo" as UserStatus, suspensionHasta: "" }, "Usuario reactivado")}>Reactivar</button>
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
