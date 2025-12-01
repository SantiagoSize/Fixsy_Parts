export type Product = {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOferta?: number | null;
  stock: number;
  tags?: string[] | string;
  imagen?: string;
  images?: string[];
  categoria?: string;
  marca?: string;
  sku?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};

export type ProductListResponse = Product[];

export type CartProduct = Product;
