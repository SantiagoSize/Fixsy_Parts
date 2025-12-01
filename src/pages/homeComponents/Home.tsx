import './Home.css';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import MostVisited from './MostVisited';
import catAccesorios from '../../assets/categoria/Accesorios.png';
import catAceite from '../../assets/categoria/aceite.png';
import catSuspension from '../../assets/categoria/amortiguador.jpg';
import catBateria from '../../assets/categoria/bateria.png';
import catFiltros from '../../assets/categoria/Filtro.jpg';
import catFrenos from '../../assets/categoria/Freno.jpg';
import catFocos from '../../assets/categoria/focos.png';
import catFusible from '../../assets/categoria/fusible.png';
import CategoryCard from './CategoryCard';
import { useNavigate } from 'react-router-dom';

type Category = {
  name: string;
  desc: string;
  image: string;
};

function Home() {
  const navigate = useNavigate();
  const categories: Category[] = [
    { name: 'Filtros', desc: 'Aire, aceite y combustible', image: catFiltros },
    { name: 'Frenos', desc: 'Pastillas, discos y kits', image: catFrenos },
    { name: 'Aceites', desc: 'Lubricantes premium', image: catAceite },
    { name: 'Baterías', desc: 'Energía y encendido', image: catBateria },
    { name: 'Suspensión', desc: 'Amortiguadores y rótulas', image: catSuspension },
    { name: 'Iluminación', desc: 'Focos y kits LED', image: catFocos },
    { name: 'Accesorios', desc: 'Tapetes, cubreasientos', image: catAccesorios },
    { name: 'Eléctrico', desc: 'Sensores y fusibles', image: catFusible },
  ];

  return (
    <div className="home-shell">
      <div className="home-container">
        <div className="home-hero-block">
          <div className="home-hero-col home-hero-col--text">
            <HeroComponent />
          </div>
          <div className="home-hero-col home-hero-col--carousel">
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
              Ver todas las categorías
            </button>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.name}
                title={cat.name}
                subtitle={cat.desc}
                imageSrc={cat.image}
                onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(cat.name)}`)}
              />
            ))}
          </div>
        </section>

        <MostVisited />
      </div>
    </div>
  );
}

export default Home;
