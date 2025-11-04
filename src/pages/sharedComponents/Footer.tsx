import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__legal">
          <p>© {year} Fixsy Parts — Todos los derechos reservados</p>
        </div>
        <nav className="footer__links" aria-label="Enlaces del sitio">
          <Link to="/terms">Términos y Condiciones</Link>
          <Link to="/privacy">Política de Privacidad</Link>
          <Link to="/contact">Contacto</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
