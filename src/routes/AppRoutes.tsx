import { Route, Routes, Navigate } from 'react-router-dom';
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
import DashboardLayout from '../dashboard/DashboardLayout';
import AdminHome from '../dashboard/AdminHome';
import SupportHome from '../dashboard/SupportHome';
import AdminProductDashboard from '../pages/admin/AdminProductDashboard';
import { PrivateRoute, PublicOnlyRoute, RoleRoute } from './guards';

const NotFoundPlaceholder = () => <div style={{ padding: '1rem' }}>404 - No encontrado</div>;

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
      <Route path="/cart" element={<CartView />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<PrivateRoute element={<Checkout />} />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* Dashboard (Admin/Soporte) */}
      <Route
        path="/dashboard"
        element={<RoleRoute allowed={['Admin', 'Soporte']} element={<DashboardLayout />} />}
      >
        <Route path="admin" element={<AdminHome />} />
        <Route path="support" element={<SupportHome />} />
      </Route>
      <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
      <Route path="/register" element={<PublicOnlyRoute element={<Register />} />} />
      <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPassword />} />} />
      <Route path="/inbox" element={<PrivateRoute element={<Inbox />} />} />
      <Route path="/compose" element={<RoleRoute allowed={['Soporte']} element={<ComposeMessage />} />} />
      <Route path="/history" element={<PrivateRoute element={<PurchaseHistory />} />} />
      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
      <Route path="/admin/products" element={<RoleRoute allowed={['Admin']} element={<AdminProductDashboard />} />} />
      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
// 🧹 FIXSY CLEANUP: organised structure, no logic changes
