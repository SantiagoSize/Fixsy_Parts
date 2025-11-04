import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import NavBar from './pages/sharedComponents/NavBar';
import Footer from './pages/sharedComponents/Footer';
import { CartProvider } from './context/CartContext';

function FixsyPartsApp() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-container">
          <NavBar />
          <main className="app-main">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default FixsyPartsApp;
