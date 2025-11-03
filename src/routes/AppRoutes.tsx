import { Route, Routes } from 'react-router-dom';
import React from 'react';

// Placeholders until real pages are added
const HomePlaceholder = () => <div style={{ padding: '1rem' }}>Home (en progreso)</div>;
const CatalogPlaceholder = () => <div style={{ padding: '1rem' }}>Catálogo (en progreso)</div>;
const ProductPlaceholder = () => <div style={{ padding: '1rem' }}>Producto (en progreso)</div>;
const LoginPlaceholder = () => <div style={{ padding: '1rem' }}>Login (en progreso)</div>;
const RegisterPlaceholder = () => <div style={{ padding: '1rem' }}>Registro (en progreso)</div>;
const NotFoundPlaceholder = () => <div style={{ padding: '1rem' }}>404 - No encontrado</div>;

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route path="/catalog" element={<CatalogPlaceholder />} />
      <Route path="/product/:id" element={<ProductPlaceholder />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/register" element={<RegisterPlaceholder />} />
      <Route path="*" element={<NotFoundPlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;

