export type Product = {
  id: number;
  nombre: string;
  slug: string;
  categoria: string;
  tags: string[];
  descripcionCorta?: string;
  descripcionLarga?: string;
  precioNormal: number;
  precioOferta?: number;
  stock: number;
  imageUrl: string;
  destacado?: boolean;
  oferta?: boolean;
  // Compatibilidad con datos existentes
  descripcion?: string;
  images?: string[];
  imagen?: string;
  precio?: number;
  isFeatured?: boolean;
  isOffer?: boolean;
  isActive?: boolean;
  sku?: string;
  marca?: string;
};

export type ProductListResponse = Product[];

export type CartProduct = {
  id: string | number;
  nombre: string;
  precio: number;
  precioNormal?: number;
  precioOferta?: number | null;
  stock?: number;
  imageUrl?: string;
  imagen?: string;
  images?: string[];
  descripcion?: string;
  sku?: string;
};
