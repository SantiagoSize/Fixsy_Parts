import React from "react";
import { STORAGE_KEYS } from "../../../utils/storageKeys";
import { UserPurchase } from "../../../types/user";

const COMPRAS_KEY = STORAGE_KEYS.mgmtPurchases;

function loadCompras(): UserPurchase[] {
  try { const raw = localStorage.getItem(COMPRAS_KEY); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}

type Props = { userId: string; onOpenDetail: (idCompra: string) => void };

export function UserPurchasesBox({ userId, onOpenDetail }: Props) {
  const compras = React.useMemo(
    () => loadCompras().filter((c) => String((c as any).idUsuario) === String(userId)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')),
    [userId]
  );
  if (!compras.length) return <p>Sin registros.</p>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {compras.map((c) => (
        <div key={(c as any).idCompra} className="user-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div><b>ID:</b> <span style={{ fontFamily: 'monospace' }}>{(c as any).idCompra}</span></div>
            <div><b>Fecha:</b> {new Date(c.fecha).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div><b>Total:</b> ${(c as any).total}</div>
            <button className="btn-view" onClick={() => onOpenDetail((c as any).idCompra)}>Ver detalles</button>
          </div>
        </div>
      ))}
    </div>
  );
}
