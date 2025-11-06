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

// Placeholders hasta que se agreguen las páginas reales
const CatalogPlaceholder = () => <div style={{ padding: '1rem' }}>Catálogo (en progreso)</div>;
const NotFoundPlaceholder = () => <div style={{ padding: '1rem' }}>404 - No encontrado</div>;

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<CatalogPlaceholder />} />
      <Route path="/cart" element={<CartView />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* Dashboard (Admin/Soporte) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="admin" element={<AdminHome />} />
        <Route path="support" element={<SupportHome />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/compose" element={<ComposeMessage />} />
      <Route path="/history" element={<PurchaseHistory />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
// 🧹 FIXSY CLEANUP: organised structure, no logic changes
import DashboardLayout from '../dashboard/DashboardLayout';
import AdminHome from '../dashboard/AdminHome';
import SupportHome from '../dashboard/SupportHome';
