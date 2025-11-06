import './NavBar.css';
import logo from '../../assets/SoloLogoF_White.png';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useMessages } from '../../context/MessagesContext';

function NavBar() {
  const location = useLocation();
  if (location.pathname.startsWith('/dashboard')) return null;
  const { items } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { unreadCount } = useMessages();
  const [openMenu, setOpenMenu] = React.useState(false);
  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const unread = user ? unreadCount(user.email) : 0;
  const unreadText = unread > 99 ? '99+' : unread > 0 ? String(unread) : '';

  return (
    <header className="navbar">
      <div className="navbar__top">
        {/**
         * Ajuste de alineaciÃ³n del bloque logo + texto
         * - Si quieres mover mÃ¡s a la izquierda/derecha: usa margin-left/padding-left en .navbar__brand
         * - AlineaciÃ³n interna: display:flex en .navbar__brand con justify-content y align-items
         *   por defecto: justify-content: flex-start; align-items: center;
         */}
        <div
          className="navbar__brand"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
        >
          {/**
           * Logo oficial + texto de marca
           * - TamaÃ±o del logo: ajusta "width" en la clase .logo-image (ej: 45px)
           * - SeparaciÃ³n entre logo y texto: ajusta "gap" en .logo-container (ej: 10px)
           * - PosiciÃ³n del bloque completo: ajusta margin-left / padding-left en .navbar__brand
           *   y/o usa display:flex + justify-content / align-items segÃºn necesites
           */}
          <div className="logo-container">
            <img className="logo-image" src={logo} alt="Fixsy Parts" />
            <span className="logo-text navbar__title">Fixsy Parts</span>
          </div>
        </div>
        <div className="navbar__search">
          <input
            type="search"
            placeholder="Buscar repuestos..."
            aria-label="Buscar repuestos"
          />
          <button type="button" className="search-button" aria-label="Buscar">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" strokeWidth="1.8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="navbar__actions">
          <button
            className="icon-button cart-button"
            aria-label="Carrito"
            onClick={() => navigate('/cart')}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3h2l1.6 9.2a2 2 0 0 0 2 1.8h7.5a2 2 0 0 0 2-1.6l1.2-6.4H6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.8" fill="currentColor" />
              <circle cx="17" cy="20" r="1.8" fill="currentColor" />
            </svg>
            {count > 0 && (
              <span className="cart-badge" aria-label={`${count} artículos en el carrito`}>
                {count}
              </span>
            )}
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="icon-button profile-button"
              aria-label="Cuenta"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  setOpenMenu(v => !v);
                }
              }}
            >
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="none" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {!!unread && (
              <span className="profile-msg-badge" aria-label={`${unread} mensajes no leídos`}>{unreadText}</span>
            )}
            {isAuthenticated && openMenu && (
              <div
                role="menu"
                style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 160,
                }}
              >
                <button
                  onClick={() => { setOpenMenu(false); navigate('/profile'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Ver perfil
                </button>
                <button
                  onClick={() => { setOpenMenu(false); navigate('/inbox'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Bandeja de mensajes
                </button>
                <button
                  onClick={() => { setOpenMenu(false); navigate('/history'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Historial de compras
                </button>
                {user?.role === 'Support' && (
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
                  Cerrar sesión
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




