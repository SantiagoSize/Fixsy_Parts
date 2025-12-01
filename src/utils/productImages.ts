import { Product } from '../types/product';

export function getProductImages(product: Product | any): string[] {
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const filtered = product.images.filter(Boolean);
    if (filtered.length) return filtered;
  }
  if (product?.imageUrl) return [product.imageUrl];
  if (product?.imagen) return [product.imagen];
  return [];
}

export function getProductPlaceholder(nombre?: string) {
  const label = nombre || 'Producto';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='260'><rect width='100%' height='100%' rx='18' ry='18' fill='%23f2f4fa'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23898ca0' font-size='14'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
