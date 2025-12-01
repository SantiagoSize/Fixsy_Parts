import { Product } from '../types/product';
import { buildProductImageUrl } from './api';

export function getProductImages(product: Product | any): string[] {
  const images: string[] = [];
  
  // Primero intentar con el array de imágenes
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const filtered = product.images
      .filter(Boolean)
      .map(img => {
        // Si la imagen ya tiene /images/, usarla directamente
        if (typeof img === 'string' && img.includes('/images/')) {
          return buildProductImageUrl(img);
        }
        // Si es solo un nombre de archivo, agregar /images/
        if (typeof img === 'string' && !img.startsWith('/') && !img.startsWith('http')) {
          return buildProductImageUrl(`/images/${img}`);
        }
        return buildProductImageUrl(img);
      })
      .filter(Boolean);
    if (filtered.length) return filtered;
  }
  
  // Luego con imageUrl
  if (product?.imageUrl) {
    let imagePath = product.imageUrl;
    // Si no empieza con /images/ y no es URL completa, agregarlo
    if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/') && !imagePath.startsWith('/')) {
      imagePath = `/images/${imagePath}`;
    }
    const url = buildProductImageUrl(imagePath);
    if (url) images.push(url);
  }
  
  // Finalmente con imagen
  if (product?.imagen && images.length === 0) {
    let imagePath = product.imagen;
    // Si no empieza con /images/ y no es URL completa, agregarlo
    if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/') && !imagePath.startsWith('/')) {
      imagePath = `/images/${imagePath}`;
    }
    const url = buildProductImageUrl(imagePath);
    if (url) images.push(url);
  }
  
  return images;
}

export function getProductPlaceholder(nombre?: string) {
  const label = nombre || 'Producto';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='260'><rect width='100%' height='100%' rx='18' ry='18' fill='%23f2f4fa'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23898ca0' font-size='14'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
