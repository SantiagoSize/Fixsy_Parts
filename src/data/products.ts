export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  tags: string[];
  imagen?: string; // placeholder por ahora
  images?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    nombre: 'Filtro de aceite',
    descripcion: 'Filtro de aceite estándar para motores 1.6-2.0L.',
    precio: 9990,
    stock: 12,
    tags: ['motor', 'mantenimiento'],
    imagen: undefined,
  },
  {
    id: 2,
    nombre: 'Pastillas de freno',
    descripcion: 'Juego de pastillas delanteras de alto rendimiento.',
    precio: 19990,
    stock: 20,
    tags: ['frenos', 'seguridad'],
    imagen: undefined,
  },
  {
    id: 3,
    nombre: 'Batería 60Ah',
    descripcion: 'Batería libre de mantención, 60Ah, terminal estándar.',
    precio: 79990,
    stock: 8,
    tags: ['eléctrico'],
    imagen: undefined,
  },
  {
    id: 4,
    nombre: 'Amortiguador delantero',
    descripcion: 'Amortiguador hidráulico para eje delantero.',
    precio: 49990,
    stock: 6,
    tags: ['suspensión'],
    imagen: undefined,
  },
  {
    id: 5,
    nombre: 'Filtro de aire',
    descripcion: 'Filtro de aire lavable de alto flujo.',
    precio: 14990,
    stock: 15,
    tags: ['motor', 'mantenimiento'],
    imagen: undefined,
  },
  {
    id: 6,
    nombre: 'Aceite 5W-30',
    descripcion: 'Aceite sintético, bidón 4L.',
    precio: 25990,
    stock: 10,
    tags: ['lubricantes', 'motor'],
    imagen: undefined,
  },
];

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

