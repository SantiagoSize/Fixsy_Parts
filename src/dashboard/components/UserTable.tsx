import React from "react";
import { MgmtUser } from "./UserTypes";

type Props = { users: MgmtUser[]; onSelect: (u: MgmtUser) => void };

export function UserTable({ users, onSelect }: Props) {
  return (
    <div className="user-table-wrap">
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>ID</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px 0' }}>No se encontraron usuarios.</td></tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.email}</td>
                <td><span className={`role-tag ${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td><span className={`status ${u.status.toLowerCase()}`}>{u.status}</span></td>
                <td style={{ fontFamily: 'monospace' }}>{u.id}</td>
                <td><button className="btn-view" onClick={() => onSelect(u)}>Ver</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
