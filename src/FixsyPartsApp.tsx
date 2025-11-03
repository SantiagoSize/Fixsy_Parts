import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import NavBar from './pages/sharedComponents/NavBar';

function FixsyPartsApp() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default FixsyPartsApp;

