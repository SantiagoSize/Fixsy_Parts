import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import NavBar from './pages/sharedComponents/NavBar';
import Footer from './pages/sharedComponents/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { __seedFixsyMessagesOnce } from './messages/MessagesContext';
import { seedAuthUsersOnce, seedManagementUsersOnce, setAllAuthPasswords, pruneUsersToCore, seedDemoUsersAndMail, ensureCoreAccounts, ensureSupportToAdminMail } from './utils/seedUsers';
import { seedItemsOnce, seedPurchasesOnce, seedPurchasesForEmails } from './utils/seedStore';
import { MessagesProvider as MailMessagesProvider } from './messages/MessagesContext';
import { OrdersProvider } from './context/OrdersContext';
import { useToast } from './hooks/useToast';
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
  // Semilla de mensajes para pruebas (solo si estÃ¡ vacÃ­o)
  React.useEffect(() => {
    try { __seedFixsyMessagesOnce(); } catch {}
    try { seedAuthUsersOnce(); } catch {}
    try { seedManagementUsersOnce(); } catch {}
    try { setAllAuthPasswords('12345678'); } catch {}
    try { pruneUsersToCore(['santiago@admin.fixsy.com','matias@soporte.fixsy.com','lucas.morales@mail.com','valentina.rojas@mail.com','diego.castro@mail.com']); } catch {}
    try { ensureCoreAccounts(); } catch {}
    try { seedItemsOnce(); } catch {}
    try { seedPurchasesOnce(); } catch {}
    try { seedPurchasesForEmails(['lucas.morales@mail.com','valentina.rojas@mail.com','diego.castro@mail.com']); } catch {}
    try { seedDemoUsersAndMail(); } catch {}
    try { ensureSupportToAdminMail(); } catch {}
  }, []);
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


