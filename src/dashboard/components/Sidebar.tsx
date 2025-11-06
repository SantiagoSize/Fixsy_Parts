import React from "react";
import { useAuth } from "../../context/AuthContext";
import { DashContext, DashKey } from "../DashboardLayout";
import logo from "../../assets/SoloLogoF_White.png";

type Props = { role: 'Admin' | 'Soporte'; onLogout: () => void };

export default function Sidebar({ role, onLogout }: Props) {
  const { user } = useAuth();
  const ctx = React.useContext(DashContext);
  if (!ctx) return null;
  const { key, setKey } = ctx;

  const initials = (user?.nombre || 'U')[0]?.toUpperCase();

  const unread = React.useMemo(() => {
    try {
      const emailLower = (user?.email || '').toLowerCase();
      const key = `fixsy_inbox_${emailLower}`;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) as any[] : [];
      if (!Array.isArray(list)) return 0;
      return list.filter(m => (m?.to || '').toLowerCase() === emailLower && !m?.read && !m?.archived && !m?.deleted).length;
    } catch { return 0; }
  }, [role, user?.email]);

  const badge = (n?: number) => (n && n > 0) ? (n > 99 ? '99+' : String(n)) : '';

  const adminMenu: { key: DashKey; label: string; icon?: string; badge?: string }[] = [
    { key: 'home', label: 'Inicio', icon: "\uD83C\uDFE0" },
    { key: 'inbox', label: 'Bandeja de entrada', icon: "\uD83D\uDCE5", badge: badge(unread) },
    // Inventario: dejar solo 1 emoji (hoja) en la etiqueta; sin icono adicional
    { key: 'inventory', label: '🧾 Inventario' },
    { key: 'products', label: 'Productos', icon: "\uD83D\uDED2" },
    { key: 'users', label: 'Usuarios', icon: "\uD83D\uDC65" },
    { key: 'profile', label: 'Perfil', icon: "\uD83D\uDC64" },
  ];
  const supportMenu: { key: DashKey; label: string; icon: string; badge?: string }[] = [
    { key: 'home', label: 'Inicio', icon: "\uD83C\uDFE0" },
    { key: 'inbox', label: 'Bandeja de entrada', icon: "\uD83D\uDCE5", badge: badge(unread) },
    { key: 'tickets', label: 'Tickets', icon: "\uD83C\uDF9F" },
    { key: 'search', label: 'Buscar usuarios', icon: "\uD83D\uDD0E" },
    { key: 'purchases', label: 'Compras', icon: "\uD83E\uDDFE" },
    { key: 'stock', label: 'Stock', icon: "\uD83C\uDFF7" },
    { key: 'profile', label: 'Perfil', icon: "\uD83D\uDC64" },
  ];
  const menu = role === 'Admin' ? adminMenu : supportMenu;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="fxdash__brand">
        <div className="fxdash__logo"><img src={logo} alt="Fixsy" /></div>
        <div className="fxdash__brandTitle">Fixsy Parts</div>
        <div className="fxdash__brandSubtitle">{role === 'Admin' ? 'Administración' : 'Soporte Técnico'}</div>
      </div>

      <div className="fxdash__user">
        {user?.nombre ? (
          user?.profilePic ? (
            <img src={(user as any).profilePic} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="fxdash__avatar" aria-label="Avatar">{initials}</div>
          )
        ) : (
          <div className="fxdash__avatar" aria-label="Avatar">U</div>
        )}
        <div className="fxdash__hello">Hola, <strong>{user?.nombre || 'Usuario'}</strong></div>
      </div>

      <div className="fxdash__menu" role="navigation" aria-label="Menu">
        {menu.map(m => (
          <button
            key={m.key}
            className={`fxdash__item ${key === m.key ? 'fxdash__item--active' : ''}`}
            onClick={() => {
              try { localStorage.setItem('fixsy_dash_key', m.key as any); } catch {}
              setKey(m.key);
              // Forzar recarga para que otros módulos detecten nuevos datos (fotos, archivos, etc.)
              window.location.reload();
            }}
          >
            {m.icon ? (<span style={{ fontSize: 20 }}>{m.icon}</span>) : null}
            <span>{m.label}</span>
            {m.badge && (
              <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 12 }}>{m.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="fxdash__logout">
        <button onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}





