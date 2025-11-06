import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Home from '../pages/homeComponents/Home';
import ProductDetail from '../pages/productComponents/ProductDetail';
import Checkout from '../pages/checkoutComponents/Checkout';
import CartView from '../pages/cartComponents/CartView';
import TermsPage from '../pages/legal/TermsPage';
import PrivacyPage from '../pages/legal/PrivacyPage';
import ContactPage from '../pages/contact/ContactPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Profile from '../pages/auth/Profile';
import Inbox from '../pages/account/Inbox';
import ComposeMessage from '../pages/support/ComposeMessage';
import PurchaseHistory from '../pages/account/PurchaseHistory';
import Catalogo from '../pages/user/Catalogo';
import { RequireAdmin, RequireSupport, RequireAuth } from './Guards';

// Placeholders hasta que se agreguen las páginas reales
const CatalogPlaceholder = () => <div style={{ padding: '1rem' }}>Catálogo (en progreso)</div>;
const NotFoundPlaceholder = () => <div style={{ padding: '1rem' }}>404 - No encontrado</div>;

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalogo />} />
      <Route path="/cart" element={<RequireAuth><CartView /></RequireAuth>} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* Dashboard (Admin/Soporte) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
        <Route path="support" element={<RequireSupport><SupportHome /></RequireSupport>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
      <Route path="/compose" element={<RequireAuth><ComposeMessage /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><PurchaseHistory /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
// 🧹 FIXSY CLEANUP: organised structure, no logic changes
import DashboardLayout from '../dashboard/DashboardLayout';
import AdminHome from '../dashboard/AdminHome';
import SupportHome from '../dashboard/SupportHome';
