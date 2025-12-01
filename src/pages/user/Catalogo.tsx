import React from 'react';
import './Catalogo.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import { apiFetch, PRODUCTS_API_BASE } from '../../utils/api';
import { Product } from '../../types/product';
import CatalogFilters, { SortOption, TagOption } from '../../components/catalog/CatalogFilters';
import CatalogGrid from '../../components/catalog/CatalogGrid';
import { CatalogCardProduct } from '../../components/catalog/CatalogProductCard';
import Pagination from '../../components/catalog/Pagination';
import { ProductModal } from '../../components/ProductModal';
import { getDisplayPrice } from '../../utils/price';

type NormalizedProduct = CatalogCardProduct & {
  categoria: string;
  tags: string[];
  isOffer: boolean;
  order: number;
  stock: number;
};

const CATEGORY_ALL = 'all';
const OFFICIAL_CATEGORIES = [
  'Filtros',
  'Frenos',
  'Aceites',
  'Baterías',
  'Suspensión',
  'Iluminación',
  'Accesorios',
  'Eléctrico',
] as const;

function normalizeCategory(raw?: string): string {
  const value = (raw || '').toLowerCase().trim();
  switch (value) {
    case 'filtros':
      return 'Filtros';
    case 'freno':
    case 'frenos':
      return 'Frenos';
    case 'aceite':
    case 'aceites':
      return 'Aceites';
    case 'bateria':
    case 'baterias':
    case 'batería':
    case 'baterías':
      return 'Baterías';
    case 'suspencion':
    case 'suspensión':
      return 'Suspensión';
    case 'iluminacion':
    case 'iluminación':
      return 'Iluminación';
    case 'accesorio':
    case 'accesorios':
      return 'Accesorios';
    case 'electrico':
    case 'eléctrico':
      return 'Eléctrico';
    default:
      return raw || 'Otros';
  }
}

function normalizeTags(raw?: string[] | string): string[] {
  if (Array.isArray(raw)) return raw.map(t => t.trim().toLowerCase()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  return [];
}

function normalizeProduct(p: Product, order: number): NormalizedProduct {
  const mainImage = (p as any).imageUrl || p.imagen;
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : mainImage ? [mainImage] : [];
  const imagen = images[0] || mainImage || '';
  const categoria = (p.categoria || (p as any).categoriaNombre || 'Otros').trim();
  const tags = normalizeTags((p as any).tags || (p as any).etiquetas || p.tags);
  const precioOferta = (p as any).precioOferta ?? (p as any).offerPrice;
  const isOffer = Boolean((p as any).isOffer ?? (Number(precioOferta ?? NaN) > 0 && Number(precioOferta) < Number(p.precio)));
  const stock = Number(p.stock ?? 0);

  return {
    ...p,
    imagen,
    images,
    categoria: normalizeCategory(categoria),
    tags,
    isOffer,
    isActive: (p as any).isActive ?? p.isActive,
    isFeatured: (p as any).isFeatured ?? p.isFeatured,
    precioOferta: precioOferta ?? p.precioOferta,
    order,
    stock: Number.isFinite(stock) ? stock : 0,
  };
}

function finalPrice(product: CatalogCardProduct) {
  const display = getDisplayPrice(product as any);
  return display.final;
}

export default function Catalogo(): React.ReactElement {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = React.useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<NormalizedProduct | null>(null);
  const initialCat = normalizeCategory(searchParams.get('categoria') || '');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCat || CATEGORY_ALL);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(() => searchParams.get('q') || '');
  const [sortOption, setSortOption] = React.useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Product[]>(PRODUCTS_API_BASE, '/api/products');
        const normalized = data
          .map((p, idx) => normalizeProduct(p, idx))
          .filter(p => p.isActive !== false);
        setProducts(normalized);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el catálogo.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  React.useEffect(() => {
    const paramSearch = searchParams.get('q') || '';
    if (paramSearch !== searchTerm) {
      setSearchTerm(paramSearch);
    }
    const paramCategory = normalizeCategory(searchParams.get('categoria') || '');
    if (paramCategory && paramCategory !== selectedCategory) {
      setSelectedCategory(paramCategory);
    }
    if (!paramCategory && selectedCategory !== CATEGORY_ALL) {
      setSelectedCategory(CATEGORY_ALL);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory && selectedCategory !== CATEGORY_ALL) params.set('categoria', selectedCategory);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, setSearchParams]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTags, sortOption]);

  const categories = React.useMemo(() => {
    return [CATEGORY_ALL, ...OFFICIAL_CATEGORIES];
  }, []);

  const tags: TagOption[] = React.useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach(p => {
      p.tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    const sorted = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'es', { sensitivity: 'base' }));
    return sorted.slice(0, 14);
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matchTerm = (p: NormalizedProduct) => {
      if (!term) return true;
      const text = `${p.nombre} ${p.categoria} ${p.descripcion ?? ''} ${p.tags.join(' ')}`.toLowerCase();
      return text.includes(term);
    };

    const matchCategory = (p: NormalizedProduct) =>
      selectedCategory === CATEGORY_ALL || p.categoria.toLowerCase() === selectedCategory.toLowerCase();
    const matchTags = (p: NormalizedProduct) => selectedTags.length === 0 || p.tags.some(tag => selectedTags.includes(tag));

    let list = products.filter(p => matchCategory(p) && matchTags(p) && matchTerm(p));

    const compareRelevance = (a: NormalizedProduct, b: NormalizedProduct) => {
      const featured = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
      if (featured !== 0) return featured;
      const offer = Number(Boolean(b.isOffer)) - Number(Boolean(a.isOffer));
      if (offer !== 0) return offer;
      const stock = Number((b.stock ?? 0) > 0) - Number((a.stock ?? 0) > 0);
      if (stock !== 0) return stock;
      return a.order - b.order;
    };

    const comparePriceAsc = (a: NormalizedProduct, b: NormalizedProduct) => {
      const diff = finalPrice(a) - finalPrice(b);
      if (diff !== 0) return diff;
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    };

    switch (sortOption) {
      case 'price_asc':
        list = [...list].sort(comparePriceAsc);
        break;
      case 'price_desc':
        list = [...list].sort((a, b) => comparePriceAsc(b, a));
        break;
      case 'recent':
        list = [...list].sort((a, b) => b.order - a.order);
        break;
      case 'featured':
      default:
        list = [...list].sort(compareRelevance);
        break;
    }

    return list;
  }, [products, searchTerm, selectedCategory, selectedTags, sortOption]);

  const itemsPerPage = 12;
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleAdd = (p: CatalogCardProduct) => {
    addToCart(
      {
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        precioOferta: p.precioOferta ?? undefined,
        stock: p.stock ?? 0,
        imagen: p.imagen,
        images: p.images,
        sku: (p as any).sku,
      },
      1
    );
    try { toast('Producto agregado al carrito'); } catch {}
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleView = (p: CatalogCardProduct) => navigate(`/product/${p.id}`);

  const handleReset = () => {
    setSelectedCategory(CATEGORY_ALL);
    setSelectedTags([]);
    setSearchTerm('');
    setSortOption('featured');
  };

  const hasResults = filteredProducts.length > 0;

  return (
    <section className="catalog-page">
      <div className="catalog-hero">
        <p className="catalog-eyebrow">Fixsy Parts</p>
        <h1 className="catalog-title">Catálogo de productos</h1>
        <p className="catalog-subtitle">Explora repuestos originales y alternativos con filtros rápidos por categoría, tags y ofertas.</p>
      </div>

      <div className="catalog-shell catalog-layout">
        <aside className="catalog-sidebar">
          <CatalogFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            tags={tags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onReset={handleReset}
            hideSearch
          />
        </aside>

        <div className="catalog-content catalog-results">
          <div className="catalog-content__top catalog-results__header">
            <div className="catalog-meta">
              {loading && <span>Cargando catálogo…</span>}
              {!loading && error && <span className="catalog-meta__error">{error}</span>}
              {!loading && !error && (
                <span>{hasResults ? `${filteredProducts.length} productos` : 'Sin resultados con los filtros actuales'}</span>
              )}
            </div>
            <div className="catalog-view">
              <div className="catalog-view__sort">
                <label className="catalog-sort__label" htmlFor="catalog-sort-select-inline">Ordenar por</label>
                <select
                  id="catalog-sort-select-inline"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="catalog-sort__select"
                >
                  <option value="featured">Destacados</option>
                  <option value="price_asc">Precio: de menor a mayor</option>
                  <option value="price_desc">Precio: de mayor a menor</option>
                  <option value="recent">Más recientes</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="catalog-empty">Cargando catálogo…</div>
          ) : error ? (
            <div className="catalog-empty">{error}</div>
          ) : (
            <>
              <CatalogGrid
                products={paginatedProducts}
                loading={loading}
                emptyMessage="No se encontraron productos con estos filtros."
                onAdd={handleAdd}
                onView={handleView}
              />
              <Pagination
                currentPage={safePage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {view && (
        <ProductModal
          product={view}
          onAdd={() => handleAdd(view)}
          onClose={() => setView(null)}
        />
      )}
    </section>
  );
}
