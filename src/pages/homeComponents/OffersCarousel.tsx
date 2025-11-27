import React from 'react';
import './OffersCarousel.css';
import body1 from '../../assets/Body1.png';
import body2 from '../../assets/Body2.png';
import body3 from '../../assets/Body 3.png';

const slides = [
  { src: body1, alt: 'Promocion 1' },
  { src: body2, alt: 'Promocion 2' },
  { src: body3, alt: 'Promocion 3' },
];

function OffersCarousel(): React.ReactElement {
  const [index, setIndex] = React.useState(0);
  const hasMultiple = slides.length > 1;
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    if (!hasMultiple) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [hasMultiple]);

  React.useEffect(() => {
    setFading(true);
    const timeout = setTimeout(() => setFading(false), 450);
    return () => clearTimeout(timeout);
  }, [index]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
  };

  const current = slides[index];

  return (
    <section className="home-carousel" aria-label="Ofertas">
      <div className="home-carousel__frame">
        <img
          className={`home-carousel__image ${fading ? 'is-fading' : ''}`}
          src={current.src}
          alt={current.alt}
        />
      </div>
      {hasMultiple && (
        <div className="carousel-dots" role="tablist" aria-label="Selector de imagenes">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel-dot ${i === index ? 'is-active' : ''}`}
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default OffersCarousel;
