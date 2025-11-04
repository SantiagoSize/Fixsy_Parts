import './Home.css';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import BestProductsComponent from './BestProductsComponent';

function Home() {
  return (
    <div className="home-container">
      <HeroComponent />
      <OffersCarousel />
      <BestProductsComponent />
    </div>
  );
}

export default Home;

