import React from 'react';

const offers = [
  'Hasta 30% OFF en frenos',
  '2x1 en escobillas este fin de semana',
  'Aceites y lubricantes con descuento',
  'Despacho gratis sobre $50.000',
];

function OffersCarousel(): React.ReactElement {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300'>` +
    `<rect width='100%' height='100%' fill='%23f2f1f2'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'>Oferta</text>` +
    `</svg>`;
  const placeholderSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <section className="home-carousel" aria-label="Ofertas">
      <img className="home-carousel__image" src={placeholderSrc} alt="Imagen de oferta" />
      <div className="home-carousel__text" aria-live="polite">
        {offers[index]}
      </div>
    </section>
  );
}

export default OffersCarousel;

