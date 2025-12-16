import { Route, Routes, Navigate } from 'react-router-dom';
import React from 'react';
import Home from '../pages/homeComponents/Home';
import ProductDetail from '../pages/productComponents/ProductDetail';
import Checkout from '../pages/checkoutComponents/Checkout';
import CheckoutError from '../pages/checkoutComponents/CheckoutError';
import CheckoutSuccess from '../pages/checkoutComponents/CheckoutSuccess';
import CartView from '../pages/cartComponents/CartView';
import TermsPage from '../pages/legal/TermsPage';
import PrivacyPage from '../pages/legal/PrivacyPage';
import ContactPage from '../pages/contact/ContactPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Profile from '../pages/auth/Profile';
import ComposeMessage from '../pages/support/ComposeMessage';
import PurchaseHistory from '../pages/account/PurchaseHistory';
import Catalogo from '../pages/user/Catalogo';
import DashboardLayout from '../dashboard/DashboardLayout';
import AdminHome from '../dashboard/AdminHome';
import SupportDashboard from '../dashboard/SupportDashboard';
import AdminProductDashboard from '../pages/admin/AdminProductDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from './PublicRoute';

const NotFoundPlaceholder = () => <div style={{ padding: '1rem' }}>404 - No encontrado</div>;

import { useAuth } from '../context/AuthContext';

const RedirectIfAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'Admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return children;
};

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={
        <RedirectIfAdmin>
          <Home />
        </RedirectIfAdmin>
      } />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
      <Route path="/cart" element={<CartView />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/error" element={<CheckoutError />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Dashboard (Admin/Soporte) */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminHome />} />
      </Route>

      <Route path="/dashboard/support" element={
        <ProtectedRoute allowedRoles={['Soporte']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SupportDashboard />} />
      </Route>

      {/* Legacy/Other Dashboard Paths if needed */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />


      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/compose" element={<ProtectedRoute allowedRoles={['Soporte']}><ComposeMessage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['Admin']}><AdminProductDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
// 🧹 FIXSY CLEANUP: organised structure, no logic changes
