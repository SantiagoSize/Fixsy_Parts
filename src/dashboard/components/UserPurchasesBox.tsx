import React from "react";

const COMPRAS_KEY = "fixsyCompras";

type Props = { userId: string; onOpenDetail: (idCompra: string) => void };

function loadCompras(): any[] {
  try { const raw = localStorage.getItem(COMPRAS_KEY); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list : []; } catch { return []; }
}

export function UserPurchasesBox({ userId, onOpenDetail }: Props) {
  const compras = React.useMemo(
    () => loadCompras().filter((c: any) => String(c.idUsuario) === String(userId)).sort((a: any, b: any) => (b.fecha || "").localeCompare(a.fecha || "")),
    [userId]
  );
  if (!compras.length) return <p>Sin registros.</p>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {compras.map((c: any) => (
        <div key={c.idCompra} className="user-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div><b>ID:</b> <span style={{ fontFamily: "monospace" }}>{c.idCompra}</span></div>
            <div><b>Fecha:</b> {new Date(c.fecha).toLocaleString()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div><b>Total:</b> ${c.total}</div>
            <button className="btn-view" onClick={() => onOpenDetail(c.idCompra)}>Ver detalles</button>
          </div>
        </div>
      ))}
    </div>
  );
}
