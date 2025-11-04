import React from 'react';
import type { Product } from '../data/products';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  // Espacio para lógica futura de admin (restock)
  restockProduct: (productId: number, amount: number) => void;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addToCart = React.useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(ci => ci.product.id === product.id);
      if (idx >= 0) {
        const current = prev[idx];
        const nextQty = current.quantity + quantity;
        if (nextQty > product.stock) {
          alert('No hay stock disponible para este producto');
          return prev; // no cambiar
        }
        const copy = [...prev];
        copy[idx] = { ...current, quantity: nextQty };
        return copy;
      }
      if (quantity > product.stock) {
        alert('No hay stock disponible para este producto');
        return prev; // no agregar si supera stock
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = React.useCallback((productId: number, quantity: number) => {
    setItems(prev => {
      return prev.map(ci => {
        if (ci.product.id !== productId) return ci;
        // No permitir superar stock; mantener cantidad actual si se intenta exceder
        if (quantity > ci.product.stock) return ci;
        if (quantity < 1) return ci;
        return { ...ci, quantity };
      });
    });
  }, []);

  const removeFromCart = React.useCallback((productId: number) => {
    setItems(prev => prev.filter(ci => ci.product.id !== productId));
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const restockProduct = React.useCallback((_productId: number, _amount: number) => {
    // reservado para implementación futura
  }, []);

  const value = React.useMemo(
    () => ({ items, addToCart, updateQuantity, removeFromCart, clearCart, restockProduct }),
    [items, addToCart, updateQuantity, removeFromCart, clearCart, restockProduct]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
