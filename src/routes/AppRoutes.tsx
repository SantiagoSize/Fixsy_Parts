import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Home from '../pages/homeComponents/Home';
import ProductDetail from '../pages/productComponents/ProductDetail';
import Checkout from '../pages/checkoutComponents/Checkout';
import CartView from '../pages/cartComponents/CartView';
import TermsPage from '../pages/legal/TermsPage';
import PrivacyPage from '../pages/legal/PrivacyPage';
import ContactPage from '../pages/contact/ContactPage';

// Placeholders hasta que se agreguen las páginas reales
const CatalogPlaceholder = () => <div style={{ padding: '1rem' }}>Catálogo (en progreso)</div>;
const LoginPlaceholder = () => <div style={{ padding: '1rem' }}>Login (en progreso)</div>;
const RegisterPlaceholder = () => <div style={{ padding: '1rem' }}>Registro (en progreso)</div>;
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
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/register" element={<RegisterPlaceholder />} />
      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
