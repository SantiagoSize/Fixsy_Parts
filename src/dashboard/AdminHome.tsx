// ðŸ§¹ FIXSY CLEANUP: organised structure, no logic changes
import React from "react";
import { DashContext } from "./DashboardLayout";
import { useAuth } from "../context/AuthContext";
import Profile from "./components/DashboardProfile";
import Inbox from "./components/Inbox";
import UserManagement from "./components/UserManagement";

function SectionCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      {children || <div className="muted">(Prototipo)</div>}
    </div>
  );
}

export default function AdminHome() {
  const ctx = React.useContext(DashContext);
  const key = (ctx && (ctx as any).key) ? (ctx as any).key : 'home';
  const { user } = useAuth();

  const fullName = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();
  const initial = (user?.nombre || 'U').slice(0, 1).toUpperCase();

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Header de bienvenida centrado */}
      {(key === 'home') && (
        <div className="card" style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
          {user && (user as any).profilePic ? (
            <img className="fade-in" src={(user as any).profilePic} alt="Foto de perfil" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#E5E7EB', color: '#2C2A2B', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 32 }} aria-label="Avatar">
              {initial}
            </div>
          )}
          <div style={{ fontWeight: 800, fontSize: 20 }}>Hola, {fullName || 'Usuario'}</div>
        </div>
      )}

      {key === 'inbox' && (
        <SectionCard title="Bandeja de entrada"><Inbox /></SectionCard>
      )}

      {key === 'inventory' && (
        <SectionCard title="Inventario">Tabla editable de stock y precios (mock).</SectionCard>
      )}
      {key === 'products' && (
        <SectionCard title="Editar productos">Formulario simple: tÃ­tulo, fotos, descripciÃ³n (mock).</SectionCard>
      )}
      {key === 'users' && (
        <SectionCard title="Administrar usuarios"><UserManagement /></SectionCard>
      )}
      {key === 'bulk' && (
        <SectionCard title="Subir CSV/Excel">Carga masiva de stock (simulado).</SectionCard>
      )}
      {key === 'profile' && (
        <Profile />
      )}
    </div>
  );
}







      {/* Bandeja deshabilitada en Admin: solo Inicio */}


