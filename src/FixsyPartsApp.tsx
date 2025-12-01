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
import { useCartNotification } from './hooks/useCartNotification';
import { useInitDemoData } from './utils/initDemoData';
import { ResponsiveProvider } from './context/ResponsiveContext';
// Error popup eliminado temporalmente

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isHome = location.pathname === '/';
  const { ToastContainer } = useToast();
  const { CartNotificationContainer } = useCartNotification();
  return (
    <div className="app-container container-fluid d-flex flex-column min-vh-100 p-0">
      <NavBar />
      <main className={`app-main ${isHome ? 'app-main--home' : ''} container-fluid flex-grow-1 py-3`}>
        <AppRoutes />
      </main>
      {!isDashboard && <Footer />}
      <ToastContainer />
      <CartNotificationContainer />
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
              <ResponsiveProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </ResponsiveProvider>
            </CartProvider>
          </OrdersProvider>
        </MailMessagesProvider>
      </MessagesProvider>
    </AuthProvider>
  );
}

export default FixsyPartsApp;


