import './NavBar.css';

function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__top">
        <div className="navbar__brand">
          <div className="navbar__logo" aria-hidden="true">FP</div>
          <span className="navbar__title">Fixsy Parts</span>
        </div>
        <div className="navbar__actions">
          <button className="icon-button" aria-label="Carrito">🛒</button>
          <button className="icon-button" aria-label="Cuenta">👤</button>
        </div>
      </div>
      <div className="navbar__search">
        <input
          type="search"
          placeholder="Buscar repuestos..."
          aria-label="Buscar repuestos"
        />
        <button type="button" className="search-button" aria-label="Buscar">🔍</button>
      </div>
    </header>
  );
}

export default NavBar;

