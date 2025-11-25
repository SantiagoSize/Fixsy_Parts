import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import NavBar from './pages/sharedComponents/NavBar';
import Footer from './pages/sharedComponents/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { MessagesProvider as MailMessagesProvider } from './messages/MessagesContext';
import { OrdersProvider } from './context/OrdersContext';
import { useToast } from './hooks/useToast';
import { useInitDemoData } from './utils/initDemoData';
// Error popup eliminado temporalmente

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isHome = location.pathname === '/';
  const { ToastContainer } = useToast();
  return (
    <div className="app-container">
      <NavBar />
      <main className={`app-main ${isHome ? 'app-main--home' : ''}`}>
        <AppRoutes />
      </main>
      {!isDashboard && <Footer />}
      <ToastContainer />
    </div>
  );
}

function FixsyPartsApp() {
  const { ToastContainer } = useToast();
  const ready = useInitDemoData();
  if (!ready) return <div className="app-loading">Cargando datos de demo...</div>;
  return (
    <AuthProvider>
      <MessagesProvider>
        <MailMessagesProvider>
          <OrdersProvider>
            <CartProvider>
              <BrowserRouter>
                <AppShell />
              </BrowserRouter>
            </CartProvider>
          </OrdersProvider>
        </MailMessagesProvider>
      </MessagesProvider>
    </AuthProvider>
  );
}

export default FixsyPartsApp;


