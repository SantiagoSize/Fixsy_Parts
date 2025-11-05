import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import NavBar from './pages/sharedComponents/NavBar';
import Footer from './pages/sharedComponents/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { OrdersProvider } from './context/OrdersContext';
import { useToast } from './hooks/useToast';
// Error popup eliminado temporalmente

function FixsyPartsApp() {
  const { ToastContainer } = useToast();
  return (
    <AuthProvider>
      <MessagesProvider>
        <OrdersProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="app-container">
                <NavBar />
                <main className="app-main">
                  <AppRoutes />
                </main>
                <Footer />
                <ToastContainer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </OrdersProvider>
      </MessagesProvider>
    </AuthProvider>
  );
}

export default FixsyPartsApp;
