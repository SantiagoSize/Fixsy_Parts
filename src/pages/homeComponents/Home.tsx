import './Home.css';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import MostVisited from './MostVisited';
import body1 from '../../assets/Body1.png';
import body2 from '../../assets/Body2.png';
import body3 from '../../assets/Body 3.png';

type Category = {
  name: string;
  desc: string;
  image: string;
};

function Home() {
  const visuals = [body1, body2, body3];
  const categories: Category[] = [
    { name: 'Filtros', desc: 'Aire, aceite y combustible', image: visuals[0] },
    { name: 'Frenos', desc: 'Pastillas, discos y kits', image: visuals[1] },
    { name: 'Suspension', desc: 'Amortiguadores y rotulas', image: visuals[2] },
    { name: 'Baterias', desc: 'Energia y encendido', image: visuals[1] },
    { name: 'Aceites', desc: 'Lubricantes premium', image: visuals[0] },
    { name: 'Iluminacion', desc: 'Focos y kits LED', image: visuals[2] },
    { name: 'Accesorios', desc: 'Tapetes, cubreasientos', image: visuals[0] },
    { name: 'Electrico', desc: 'Sensores y fusibles', image: visuals[1] },
  ];

  return (
    <div className="home-shell">
      <div className="home-container">
        <HeroComponent />
        <OffersCarousel />

        <section className="home-section home-categories">
          <div className="section-header">
            <div>
              <p className="section-kicker">Explora por categoria</p>
              <h2 className="section-title">Repuestos destacados</h2>
            </div>
            <div className="section-cta">Encuentra rapido lo que necesitas</div>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <div className="category-card" key={cat.name}>
                <div className="category-media">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <div className="category-body">
                  <div className="category-name">{cat.name}</div>
                  <div className="category-desc">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <MostVisited />
      </div>
    </div>
  );
}

export default Home;
