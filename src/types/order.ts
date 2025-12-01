import { Product } from './product';

export type OrderItemRequestDTO = {
  productId: string | number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
};

export type OrderRequestDTO = {
  userId?: string | null;
  userEmail: string;
  userName: string;
  status?: string;
  subtotal: number;
  iva?: number;
  shippingCost?: number;
  total?: number;
  totalItems?: number;
  shippingAddress: string;
  shippingRegion: string;
  shippingComuna: string;
  contactPhone: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  items: OrderItemRequestDTO[];
};

export type OrderItemResponseDTO = {
  id: string | number;
  productId: string | number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderResponseDTO = {
  id: string | number;
  userId?: string | null;
  userEmail: string;
  userName: string;
  status: string;
  subtotal: number;
  iva?: number;
  shippingCost: number;
  total: number;
  totalItems?: number;
  shippingAddress: string;
  shippingRegion: string;
  shippingComuna: string;
  contactPhone: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt?: string;
  paidAt?: string;
  items: OrderItemResponseDTO[];
};

export type OrderSummary = {
  order: OrderResponseDTO;
  products: Product[];
};
