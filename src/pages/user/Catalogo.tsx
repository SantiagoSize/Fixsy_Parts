import React from 'react';
import './Catalogo.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiFetch, PRODUCTS_API_BASE } from '../../utils/api';
import { Product } from '../../types/product';
import CatalogFilters, { TagOption } from '../../components/catalog/CatalogFilters';
import CatalogGrid from '../../components/catalog/CatalogGrid';
import { CatalogCardProduct } from '../../components/catalog/CatalogProductCard';
import Pagination from '../../components/catalog/Pagination';
import { getDisplayPrice } from '../../utils/price';
import { useResponsive } from '../../hooks/useResponsive';

type NormalizedProduct = CatalogCardProduct & {
  categoria: string;
  tags: string[];
  isOffer: boolean;
  order: number;
  stock: number;
  precioNormal: number;
  precio?: number;
  imageUrl: string;
  slug?: string;
  descripcion?: string;
  descripcionCorta?: string;
};

const CATEGORY_ALL = 'all';
const OFFICIAL_CATEGORIES = [
  'Filtros',
  'Frenos',
  'Aceites',
  'Baterias',
  'Suspension',
  'Iluminacion',
  'Accesorios',
  'Electrico',
] as const;
const VALID_CATEGORIES = new Set<string>([CATEGORY_ALL, ...OFFICIAL_CATEGORIES]);

function normalizeCategory(raw?: string): string {
  const value = (raw || '').toLowerCase().trim();
  const clean = typeof value.normalize === 'function'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : value;
  switch (clean) {
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
      return 'Baterias';
    case 'suspencion':
    case 'suspension':
      return 'Suspension';
    case 'iluminacion':
      return 'Iluminacion';
    case 'accesorio':
    case 'accesorios':
      return 'Accesorios';
    case 'electrico':
      return 'Electrico';
    default:
      return raw || 'Otros';
  }
}

function normalizeCategoryParam(raw?: string | null): string {
  if (!raw) return CATEGORY_ALL;
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower === 'null' || lower === 'undefined') return CATEGORY_ALL;
  if (lower === CATEGORY_ALL) return CATEGORY_ALL;

  const normalized = normalizeCategory(trimmed);
  return VALID_CATEGORIES.has(normalized) ? normalized : CATEGORY_ALL;
}

function normalizeTags(raw?: string[] | string): string[] {
  if (Array.isArray(raw)) return raw.map(t => t.trim().toLowerCase()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  return [];
}

function normalizeProduct(p: Product, order: number): NormalizedProduct {
  const numericId = Number((p as any).id);
  const categoriaRaw = p.categoria || (p as any).categoriaNombre || 'Otros';
  const categoria = normalizeCategory(categoriaRaw);
  const basePrice = Number((p as any).precioNormal ?? (p as any).precio ?? 0) || 0;
  const precioOferta = (p as any).precioOferta ?? (p as any).offerPrice;
  const isOffer = Boolean((p as any).isOffer ?? (Number(precioOferta ?? NaN) > 0 && Number(precioOferta) < basePrice));
  const stock = Number(p.stock ?? 0);
  const mainImage = (p as any).imageUrl || p.imagen || '';
  let productImages = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  if (productImages.length === 0 && mainImage) {
    productImages = [mainImage];
  }
  const imageUrl = productImages[0] || mainImage || '';
  const tags = normalizeTags((p as any).tags || (p as any).etiquetas || p.tags);
  const descripcion = (p.descripcionCorta || p.descripcion || '').trim();

  return {
    ...p,
    id: Number.isFinite(numericId) ? numericId : order + 1,
    nombre: p.nombre,
    slug: (p as any).slug || p.nombre?.toLowerCase().replace(/\s+/g, '-') || String(p.id),
    descripcion,
    imagen: imageUrl,
    imageUrl,
    images: productImages,
    categoria,
    tags,
    isOffer,
    isActive: (p as any).isActive ?? p.isActive,
    isFeatured: (p as any).isFeatured ?? p.isFeatured,
    precio: basePrice,
    precioNormal: basePrice,
    precioOferta: precioOferta ?? p.precioOferta,
    order,
    stock: Number.isFinite(stock) ? stock : 0,
  };
}

function finalPrice(product: CatalogCardProduct) {
  const display = getDisplayPrice(product as any);
  return display.final;
}

type SortOption = 'price_asc' | 'price_desc' | 'recent';

export default function Catalogo(): React.ReactElement {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = React.useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(() =>
    normalizeCategoryParam(searchParams.get('categoria'))
  );
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(() => searchParams.get('q') || '');
  const [sortOption, setSortOption] = React.useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [onlyOffers, setOnlyOffers] = React.useState(false);
  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Product[]>(PRODUCTS_API_BASE, '/api/products');
        if (!Array.isArray(data)) {
          throw new Error('La respuesta de productos no es valida.');
        }
        const normalized = data
          .map((p, idx) => normalizeProduct(p, idx))
          .filter(p => p.isActive !== false);
        const safeProducts = normalized.filter(p => {
          const hasId = p.id !== null && p.id !== undefined;
          const slug = typeof p.slug === 'string' ? p.slug.trim() : '';
          const name = typeof p.nombre === 'string' ? p.nombre.trim() : '';
          return hasId && slug.length > 0 && name.length > 0;
        });
        setProducts(safeProducts);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el catalogo.');
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
    const paramCategory = normalizeCategoryParam(searchParams.get('categoria'));
    if (paramCategory !== selectedCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) params.set('q', trimmedSearch);
    if (selectedCategory !== CATEGORY_ALL && VALID_CATEGORIES.has(selectedCategory)) {
      params.set('categoria', selectedCategory);
    }
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params);
    }
  }, [searchTerm, selectedCategory, setSearchParams, searchParams]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTags, sortOption]);

  React.useEffect(() => {
    if (!isMobile) {
      setFiltersOpen(false);
    }
  }, [isMobile]);

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
      const text = `${p.nombre} ${p.categoria} ${p.descripcion ?? ''} ${(p as any).descripcionCorta ?? ''} ${p.tags.join(' ')}`.toLowerCase();
      return text.includes(term);
    };

    const matchCategory = (p: NormalizedProduct) =>
      selectedCategory === CATEGORY_ALL || p.categoria.toLowerCase() === selectedCategory.toLowerCase();
    const matchTags = (p: NormalizedProduct) =>
      selectedTags.length === 0 || p.tags.some(tag => selectedTags.includes(tag.toLowerCase()));

    let list = products.filter(p => matchCategory(p) && matchTags(p) && matchTerm(p));
    if (onlyOffers) {
      list = list.filter((p) => {
        if ((p as any).oferta === true) return true;
        const discountPrice = p.precioOferta;
        if (discountPrice != null) {
          return true;
        }
        return typeof p.precioOferta === 'number' && p.precioOferta < p.precioNormal;
      });
    }

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
      case 'offers':
      default:
        list = [...list].sort(compareRelevance);
        break;
    }

    return list;
  }, [products, searchTerm, selectedCategory, selectedTags, sortOption, onlyOffers]);

  const itemsPerPage = isMobile ? 6 : isTablet ? 9 : 12;
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleAdd = (p: CatalogCardProduct) => {
    const productId = Number(p.id);
    addToCart(
      {
        id: Number.isFinite(productId) ? productId : p.id as number,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: (p as any).precioNormal ?? p.precio,
        precioOferta: p.precioOferta ?? undefined,
        stock: p.stock ?? 0,
        imagen: (p as any).imageUrl ?? p.imagen,
        imageUrl: (p as any).imageUrl ?? p.imagen,
        images: p.images,
        sku: (p as any).sku,
      },
      1
    );
    // La notificación del carrito se muestra automáticamente desde CartContext
  };

  const toggleTag = (tag: string) => {
    const value = tag.toLowerCase();
    setSelectedTags(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]);
  };

  const handleView = (p: CatalogCardProduct) => {
    navigate(`/product/${encodeURIComponent(String(p.id))}`);
  };

  const handleReset = () => {
    setSelectedCategory(CATEGORY_ALL);
    setSelectedTags([]);
    setSearchTerm('');
    setSortOption('recent');
    setOnlyOffers(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const layoutClass = `catalog-shell catalog-layout ${isMobile ? 'catalog-layout--stack' : ''}`;
  const headerMessage = filteredProducts.length > 0
    ? `${filteredProducts.length} productos encontrados`
    : onlyOffers
      ? 'No hay productos en oferta por el momento'
      : 'Sin resultados con los filtros actuales';

  return (
    <section className="catalog-page">
      <div className={layoutClass}>
        {!isMobile && (
          <aside className="catalog-sidebar">
            <CatalogFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              tags={tags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onReset={handleReset}
              hideSearch
              offersOnly={onlyOffers}
              onToggleOffers={() => setOnlyOffers((prev) => !prev)}
            />
          </aside>
        )}

        <div className="catalog-main">
          <div className="catalog-hero container-xxl">
            <p className="catalog-eyebrow">Fixsy Parts</p>
            <h1 className="catalog-title">Catálogo de productos</h1>
            <p className="catalog-subtitle">Explora repuestos originales y alternativos con filtros rápidos por categoría, tags y ofertas.</p>
            {isMobile && (
              <button type="button" onClick={() => setFiltersOpen(true)} className="catalog-mobile-filter-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                </svg>
                Filtros
              </button>
            )}
          </div>

          <div className="catalog-content catalog-results">
            <div className="catalog-content__top catalog-results__header">
              <div className="catalog-meta">
                {loading && <span>Cargando catálogo...</span>}
              {!loading && error && <span className="catalog-meta__error">{error}</span>}
              {!loading && !error && (
                <span>{headerMessage}</span>
              )}
            </div>
            <div className="catalog-view">
              <div className="catalog-view__sort">
                <label className="catalog-sort__label" htmlFor="catalog-sort-select-inline">Ordenar:</label>
                <select
                  id="catalog-sort-select-inline"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="catalog-sort__select form-select"
                >
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="catalog-empty">Cargando catalogo...</div>
          ) : error ? (
            <div className="catalog-empty">{error}</div>
          ) : (
            <>
              <CatalogGrid
                products={paginatedProducts}
                loading={loading}
                emptyMessage={onlyOffers ? 'No hay productos en oferta por el momento' : 'No se encontraron productos para estos filtros.'}
                onAdd={handleAdd}
                onView={handleView}
                viewMode="grid"
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
    </div>

      {filtersOpen && isMobile && (
        <div className="catalog-drawer" role="dialog" aria-modal="true" aria-label="Filtros de catalogo">
          <button
            type="button"
            className="catalog-drawer__backdrop"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          />
          <div className="catalog-drawer__panel">
            <div className="catalog-drawer__header">
              <div>
                <p className="catalog-eyebrow">Filtros</p>
                <h2 className="catalog-title">Ajusta tu busqueda</h2>
              </div>
              <button
                type="button"
                className="catalog-mobile-btn catalog-mobile-btn--ghost btn btn-outline-secondary"
                onClick={() => setFiltersOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <CatalogFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              tags={tags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onReset={handleReset}
              offersOnly={onlyOffers}
              onToggleOffers={() => setOnlyOffers((prev) => !prev)}
            />
          </div>
        </div>
      )}

    </section>
  );
}
