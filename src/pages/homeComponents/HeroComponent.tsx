import { Link } from 'react-router-dom';

function HeroComponent() {
  return (
    <section className="home-hero">
      <div className="home-hero__content">
        <h1 className="home-hero__title">Bienvenido a Fixsy Parts</h1>
        <p className="home-hero__text">
          Encuentra repuestos automotrices de calidad para tu vehículo, al mejor precio.
        </p>
        <Link to="/catalog" className="home-hero__button">
          Ver Catálogo
        </Link>
      </div>
    </section>
  );
}

export default HeroComponent;

