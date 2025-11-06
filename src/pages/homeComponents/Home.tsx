import './Home.css';
import HeroComponent from './HeroComponent';
import OffersCarousel from './OffersCarousel';
import MostVisited from './MostVisited';
import UserInboxPreview from './UserInboxPreview';

function Home() {
  return (
    <div className="home-container">
      <HeroComponent />
      <OffersCarousel />
      <MostVisited />
      <UserInboxPreview />
    </div>
  );
}

export default Home;

