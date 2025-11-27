import { useNavigate } from 'react-router-dom';
import React from 'react';

function HeroComponent() {
  const navigate = useNavigate();
  const goCatalog = React.useCallback(() => navigate('/catalogo'), [navigate]);

  return (
    <section className="home-hero">
      <p className="home-hero__eyebrow">Bienvenido a Fixsy Parts</p>
      <h1 className="home-hero__title">Repuestos confiables, listos para instalar.</h1>
      <p className="home-hero__text">
        Reune todo lo que tu vehiculo necesita en un solo lugar: marcas certificadas, envios rapidos y
        soporte experto cuando lo necesites.
      </p>
      <div className="home-hero__actions">
        <button type="button" className="home-hero__button" onClick={goCatalog}>
          Ver Catalogo
        </button>
      </div>
    </section>
  );
}

export default HeroComponent;
