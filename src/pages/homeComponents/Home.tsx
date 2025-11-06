import './Home.css';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import MostVisited from './MostVisited';

function Home() {
  return (
    <div className="home-container">
      <HeroComponent />
      <OffersCarousel />
      <MostVisited />
    </div>
  );
}

export default Home;

