import React from 'react';
import { toast } from '../hooks/useToast';
import { STORAGE_KEYS } from '../utils/storageKeys';

type ProductLike = {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  imagen?: string;
  images?: string[];
};

export type CartItem = { product: ProductLike; quantity: number };

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: ProductLike, quantity?: number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  // Espacio para lógica futura de admin (restock)
  restockProduct: (productId: string | number, amount: number) => void;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = STORAGE_KEYS.cart;
  const [items, setItems] = React.useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as CartItem[] : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const addToCart = React.useCallback((product: ProductLike, quantity = 1) => {
    if (quantity < 1) return;
    if (product.stock < 1) {
      toast('No hay stock disponible para este producto');
      return;
    }
    setItems(prev => {
      const idx = prev.findIndex(ci => String(ci.product.id) === String(product.id));
      if (idx >= 0) {
        const current = prev[idx];
        const nextQty = current.quantity + quantity;
        if (nextQty > product.stock) {
          toast('No hay stock disponible para este producto');
          return prev; // no cambiar
        }
        const copy = [...prev];
        copy[idx] = { ...current, quantity: nextQty };
        return copy;
      }
      if (quantity > product.stock) {
        toast('No hay stock disponible para este producto');
        return prev; // no agregar si supera stock
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = React.useCallback((productId: string | number, quantity: number) => {
    setItems(prev => {
      return prev.map(ci => {
        if (String(ci.product.id) !== String(productId)) return ci;
        // No permitir superar stock; mantener cantidad actual si se intenta exceder
        if (quantity > ci.product.stock) return ci;
        if (quantity < 1) return ci;
        return { ...ci, quantity };
      });
    });
  }, []);

  const removeFromCart = React.useCallback((productId: string | number) => {
    setItems(prev => prev.filter(ci => String(ci.product.id) !== String(productId)));
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const restockProduct = React.useCallback((_productId: string | number, _amount: number) => {
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

