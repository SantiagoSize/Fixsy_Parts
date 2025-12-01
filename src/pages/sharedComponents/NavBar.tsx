import './NavBar.css';
import logo from '../../assets/SoloLogoF_White.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';

function NavBar() {
  const location = useLocation();
  if (location.pathname.startsWith('/dashboard')) return null;
  const { items } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { isMobile } = useResponsive();
  const [openMenu, setOpenMenu] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const dashboardPath = user?.role === 'Admin' ? '/dashboard/admin' : user?.role === 'Soporte' ? '/dashboard/support' : null;
  const goCatalog = React.useCallback((term?: string) => {
    const query = term ? `?q=${encodeURIComponent(term)}` : '';
    navigate(`/catalogo${query}`);
  }, [navigate]);
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goCatalog(search.trim() || undefined);
  };

  React.useEffect(() => {
    setOpenMenu(false);
  }, [location.pathname, isMobile]);

  const barClass = `navbar__bar ${isMobile ? 'navbar__bar--stack' : ''}`;
  const searchClass = `navbar__search ${isMobile ? 'navbar__search--full' : ''}`;
  const actionsClass = `navbar__actions ${isMobile ? 'navbar__actions--spread' : ''}`;

  return (
    <header className="navbar navbar-expand-lg">
      <div className={`${barClass} container-xxl`}>
        <div
          className="navbar__brand"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
        >
          <div className="logo-container">
            <img className="logo-image" src={logo} alt="Fixsy Parts" />
            <div className="logo-text-stack">
              <span className="logo-text-top">Fixsy</span>
              <span className="logo-text-bottom">Parts</span>
            </div>
          </div>
        </div>

        <form className={`${searchClass} d-flex flex-grow-1 gap-2`} onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="Buscar repuestos..."
            aria-label="Buscar repuestos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
          <button type="submit" className="search-button btn btn-light d-flex align-items-center" aria-label="Buscar">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" strokeWidth="1.8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <div className={`${actionsClass} d-flex align-items-center`}>
          <button
            className="icon-button cart-button btn btn-light"
            aria-label="Carrito"
            onClick={() => navigate('/cart')}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3h2l1.6 9.2a2 2 0 0 0 2 1.8h7.5a2 2 0 0 0 2-1.6l1.2-6.4H6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.8" fill="currentColor" />
              <circle cx="17" cy="20" r="1.8" fill="currentColor" />
            </svg>
            {count > 0 && (
              <span className="cart-badge" aria-label={`${count} articulos en el carrito`}>
                {count}
              </span>
            )}
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="icon-button profile-button btn btn-warning text-white"
              aria-label="Cuenta"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  setOpenMenu((v) => !v);
                }
              }}
            >
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="none" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isAuthenticated && openMenu && (
              <div
                role="menu"
                style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 160,
                  zIndex: 60,
                }}
              >
                <button
                  onClick={() => { setOpenMenu(false); navigate('/profile'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Ver perfil
                </button>
                <button
                  onClick={() => { setOpenMenu(false); navigate('/history'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Historial de compras
                </button>
                {dashboardPath && (
                  <button
                    onClick={() => { setOpenMenu(false); navigate(dashboardPath); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Dashboard
                  </button>
                )}
                {user?.role === 'Soporte' && (
                  <button
                    onClick={() => { setOpenMenu(false); navigate('/compose'); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Enviar mensaje
                  </button>
                )}
                <button
                  onClick={() => { setOpenMenu(false); logout(); navigate('/'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
                >
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
