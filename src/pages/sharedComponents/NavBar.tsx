import './NavBar.css';
import logo from '../../assets/SoloLogoF_White.png';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function NavBar() {
  const { items } = useCart();
  const navigate = useNavigate();
  const count = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <header className="navbar">
      <div className="navbar__top">
        {/**
         * Ajuste de alineación del bloque logo + texto
         * - Si quieres mover más a la izquierda/derecha: usa margin-left/padding-left en .navbar__brand
         * - Alineación interna: display:flex en .navbar__brand con justify-content y align-items
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
           * - Tamaño del logo: ajusta "width" en la clase .logo-image (ej: 45px)
           * - Separación entre logo y texto: ajusta "gap" en .logo-container (ej: 10px)
           * - Posición del bloque completo: ajusta margin-left / padding-left en .navbar__brand
           *   y/o usa display:flex + justify-content / align-items según necesites
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
          <button
            className="icon-button profile-button"
            aria-label="Cuenta"
            onClick={() => navigate('/account')}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="none" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      
    </header>
  );
}

export default NavBar;
