import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.css";
import Sidebar from "./components/Sidebar";

export type AdminKey = 'inventory' | 'products' | 'users' | 'bulk' | 'profile' | 'home' | 'inbox' | 'search' | 'stock' | 'purchases';
export type SupportKey = 'inbox' | 'tickets' | 'search' | 'stock' | 'profile' | 'home' | 'purchases';
export type DashKey = AdminKey | SupportKey;

type Ctx = { key: DashKey; setKey: (k: DashKey) => void };
export const DashContext = React.createContext<Ctx | null>(null);

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const isAdmin = user?.role === 'Admin';
  const isSupport = user?.role === 'Soporte';

  React.useEffect(() => {
    if (!user || (!isAdmin && !isSupport)) nav('/');
  }, [user, isAdmin, isSupport, nav]);

  const [key, setKey] = React.useState<DashKey>(() => {
    try {
      const k = localStorage.getItem('fixsy_dash_key') as DashKey | null;
      return (k as DashKey) || 'home';
    } catch { return 'home'; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('fixsy_dash_key', key as string); } catch {}
  }, [key]);
  const topbarStyle: React.CSSProperties = {
    background: isAdmin ? '#6B4DFF' : '#FF6D00',
    color: '#FFFFFF',
  };

  return (
    <DashContext.Provider value={{ key, setKey }}>
      <div className="fxdash" style={{ width: '100%', height: '100vh', display: 'flex', backgroundColor: '#2C2A2B', margin: 0, padding: 0, overflow: 'hidden' }}>
        <aside className="fxdash__sidebar">
          <Sidebar role={isAdmin ? 'Admin' : 'Soporte'} onLogout={() => { logout(); nav('/'); }} />
        </aside>
        <section className="fxdash__main">
          <div className="fxdash__topbar" style={topbarStyle}>
            <div className="fxdash__topbarInner">
              {isAdmin ? 'Panel de Administración' : 'Panel de Soporte'}
            </div>
          </div>
          <div className="fxdash__content">
            <Outlet />
          </div>
        </section>
      </div>
    </DashContext.Provider>
  );
}
