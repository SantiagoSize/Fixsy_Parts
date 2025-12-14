import React from "react";
import { MgmtUser } from "../../../types/user";

type Props = { users: MgmtUser[]; onSelect: (u: MgmtUser) => void };

export function UserTable({ users, onSelect }: Props) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle">
        <thead className="table-light">
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
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="d-flex align-items-center">
                    {u.foto ? (
                      <img
                        src={u.foto}
                        alt=""
                        className="rounded-circle me-2"
                        style={{ width: 32, height: 32, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary text-white"
                        style={{ width: 32, height: 32, fontSize: "0.8rem" }}
                      >
                        {u.nombre.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="fw-bold">{u.nombre} {u.apellido}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td><small className="text-muted font-monospace">{u.id}</small></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onSelect(u)}>
                    <i className="bi bi-eye"></i> Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function getRoleBadgeClass(role?: string): string {
  switch (role?.toLowerCase()) {
    case 'admin': return 'bg-danger';
    case 'soporte': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case 'Activo': return 'bg-success';
    case 'Bloqueado': return 'bg-danger';
    case 'Suspendido': return 'bg-secondary';
    default: return 'bg-secondary';
  }
}
