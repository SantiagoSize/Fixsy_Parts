import React from 'react';
import { toast } from '../hooks/useToast';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { CartProduct } from '../types/product';

export type CartItem = {
  productId: string | number;
  product: CartProduct;
  quantity: number;
  unitPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  restockProduct: (productId: string | number, amount: number) => void;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

function getUnitPrice(product: CartProduct) {
  const offer = Number(product.precioOferta ?? NaN);
  const base = Number((product as any).precioNormal ?? product.precio ?? 0);
  return Number.isFinite(offer) && offer > 0 && offer < base ? offer : base;
}

function normalizeItem(raw: any): CartItem | null {
  if (!raw) return null;
  const product: CartProduct = (raw.product || raw) as CartProduct;
  const productId = product?.id ?? raw.productId;
  if (productId === undefined || productId === null) return null;
  const stock = Number(product.stock ?? raw.stock ?? 0);
  const normalizedProduct: CartProduct = {
    ...product,
    id: productId,
    precio: Number((product as any).precioNormal ?? product.precio ?? raw.precio ?? 0),
    precioNormal: Number((product as any).precioNormal ?? product.precio ?? raw.precio ?? 0),
    precioOferta: raw.precioOferta ?? product.precioOferta ?? null,
    stock: Number.isFinite(stock) ? stock : 0,
    imagen: product.imagen || (product as any).image || (product as any).imageUrl,
    imageUrl: (product as any).imageUrl || product.imagen,
    images: Array.isArray(product.images) ? product.images : raw.images,
    sku: product.sku || raw.sku,
  };
  const unitPrice = Number(raw.unitPrice ?? getUnitPrice(normalizedProduct));
  const quantity = Number(raw.quantity ?? raw.cantidad ?? 1);
  if (!Number.isFinite(quantity) || quantity < 1) return null;
  return {
    productId,
    product: normalizedProduct,
    quantity,
    unitPrice,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = STORAGE_KEYS.cart;
  const [items, setItems] = React.useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as any[]) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeItem).filter(Boolean) as CartItem[];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = React.useCallback((product: CartProduct, quantity = 1) => {
    const unitPrice = getUnitPrice(product);
    const stock = Number(product.stock ?? 0);
    if (quantity < 1) return;
    if (stock < 1) {
      toast('No hay stock disponible para este producto');
      return;
    }
    setItems(prev => {
      const idx = prev.findIndex(ci => String(ci.productId) === String(product.id));
      if (idx >= 0) {
        const current = prev[idx];
        const nextQty = current.quantity + quantity;
        if (nextQty > stock) {
          toast('No hay stock disponible para este producto');
          return prev;
        }
        const copy = [...prev];
        copy[idx] = { ...current, quantity: nextQty, unitPrice };
        return copy;
      }
      if (quantity > stock) {
        toast('No hay stock disponible para este producto');
        return prev;
      }
      return [...prev, { productId: product.id, product, quantity, unitPrice }];
    });
  }, []);

  const updateQuantity = React.useCallback((productId: string | number, quantity: number) => {
    setItems(prev =>
      prev.map(ci => {
        if (String(ci.productId) !== String(productId)) return ci;
        if (quantity < 1) return ci;
        if (quantity > (ci.product.stock ?? 0)) return ci;
        return { ...ci, quantity };
      })
    );
  }, []);

  const removeFromCart = React.useCallback((productId: string | number) => {
    setItems(prev => prev.filter(ci => String(ci.productId) !== String(productId)));
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const restockProduct = React.useCallback((_productId: string | number, _amount: number) => {
    // reservado para implementacion futura
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
