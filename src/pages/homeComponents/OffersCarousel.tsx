import React from 'react';
import body1 from '../../assets/Body1.png';
import body2 from '../../assets/Body2.png';
import body3 from '../../assets/Body 3.png';

const slides = [
  { src: body1, alt: 'Promoción 1' },
  { src: body2, alt: 'Promoción 2' },
  { src: body3, alt: 'Promoción 3' },
];

function OffersCarousel(): React.ReactElement {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const current = slides[index];

  return (
    <section className="home-carousel" aria-label="Ofertas">
      <img className="home-carousel__image" src={current.src} alt={current.alt} />
    </section>
  );
}

export default OffersCarousel;

