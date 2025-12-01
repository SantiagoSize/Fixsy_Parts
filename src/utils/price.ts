// Utilidades de precios para formato CLP y soporte de ofertas
export interface DisplayPrice {
  hasDiscount: boolean;
  original: number;
  final: number;
  discountPercentage?: number;
}

type PriceLike = { precio?: number; precioNormal?: number; precioOferta?: number; offerPrice?: number };

export function formatPrice(value: number): string {
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `$ ${Number(value || 0).toLocaleString('es-CL')}`;
  }
}

export function getDisplayPrice<T extends PriceLike>(product: T): DisplayPrice {
  const base = product?.precioNormal ?? product?.precio ?? 0;
  const original = Number(base);
  const offer = Number((product as any).precioOferta ?? (product as any).offerPrice ?? NaN);
  const hasDiscount = Number.isFinite(offer) && offer > 0 && offer < original;
  if (hasDiscount) {
    const final = offer;
    const discountPercentage = original > 0 ? Math.round((1 - final / original) * 100) : undefined;
    return {
      hasDiscount: true,
      original,
      final,
      discountPercentage,
    };
  }
  return {
    hasDiscount: false,
    original,
    final: original,
  };
}
