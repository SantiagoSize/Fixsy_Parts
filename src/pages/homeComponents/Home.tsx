import './Home.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import MostVisited from './MostVisited';
import CategoryCard from './CategoryCard';
import catAccesorios from '../../assets/categoria/Accesorios.png';
import catAceite from '../../assets/categoria/aceite.png';
import catSuspension from '../../assets/categoria/amortiguador.jpg';
import catBateria from '../../assets/categoria/bateria.png';
import catFiltros from '../../assets/categoria/Filtro.jpg';
import catFrenos from '../../assets/categoria/Freno.jpg';
import catFocos from '../../assets/categoria/focos.png';
import catFusible from '../../assets/categoria/fusible.png';
import { useResponsive } from '../../hooks/useResponsive';

type Category = {
  name: string;
  desc: string;
  image: string;
};

const HOME_VIDEO_URL = 'https://www.youtube.com/embed/EDSTDHU6oFI';

function Home() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const categories: Category[] = React.useMemo(() => ([
    { name: 'Filtros', desc: 'Aire, aceite y combustible', image: catFiltros },
    { name: 'Frenos', desc: 'Pastillas, discos y kits', image: catFrenos },
    { name: 'Aceites', desc: 'Lubricantes premium', image: catAceite },
    { name: 'Baterias', desc: 'Energia y encendido', image: catBateria },
    { name: 'Suspension', desc: 'Amortiguadores y rotulas', image: catSuspension },
    { name: 'Iluminacion', desc: 'Focos y kits LED', image: catFocos },
    { name: 'Accesorios', desc: 'Tapetes, cubreasientos', image: catAccesorios },
    { name: 'Electrico', desc: 'Sensores y fusibles', image: catFusible },
  ]), []);
  const [visibleCategories, setVisibleCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const limit = isMobile ? 4 : isTablet ? 6 : categories.length;
    setVisibleCategories(categories.slice(0, limit));
  }, [categories, isMobile, isTablet]);

  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  React.useEffect(() => {
    if (!isVideoOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeVideo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVideoOpen]);

  return (
    <div className="home-shell">
      <div className="home-container container-xxl">
        <div className="home-hero-block row g-3 align-items-stretch">
          <div className="home-hero-col home-hero-col--text col-12 col-lg-4 col-xl-5">
            <HeroComponent
              primaryLabel="Conocer Fixsy Parts"
              onPrimaryAction={openVideo}
            />
          </div>
          <div className="home-hero-col home-hero-col--carousel col-12 col-lg-8 col-xl-7">
            <OffersCarousel />
          </div>
        </div>

        <section className="home-section home-categories">
          <div className="section-header categories-header">
            <div>
              <h2 className="section-title">Explora por categoria</h2>
            </div>
            <button
              type="button"
              className="home-hero__button home-categories__cta"
              onClick={() => navigate('/catalogo')}
            >
              Ver todas las categorias
            </button>
          </div>
          <div className="categories-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {visibleCategories.map((cat) => (
              <div className="col" key={cat.name}>
                <CategoryCard
                  title={cat.name}
                  subtitle={cat.desc}
                  imageSrc={cat.image}
                  onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(cat.name)}`)}
                />
              </div>
            ))}
          </div>
          {visibleCategories.length < categories.length && (
            <div className="home-categories__footer">
              <button
                type="button"
                className="home-hero__button home-categories__cta home-categories__cta--ghost"
                onClick={() => setVisibleCategories(categories)}
              >
                Mostrar todas las categorias
              </button>
            </div>
          )}
        </section>

        <MostVisited />
      </div>
      {isVideoOpen && (
        <div className="home-video-modal" role="dialog" aria-modal="true" aria-label="Video institucional Fixsy Parts">
          <div className="home-video-modal__backdrop" onClick={closeVideo} />
          <div className="home-video-modal__content">
            <button
              type="button"
              className="home-video-modal__close"
              aria-label="Cerrar video institucional"
              onClick={closeVideo}
            >
              ×
            </button>
            <div className="home-video-modal__frame">
              <iframe
                src={`${HOME_VIDEO_URL}?rel=0`}
                title="Fixsy Parts en acción"
                allowFullScreen
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
