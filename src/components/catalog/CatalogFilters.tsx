import React from 'react';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'recent';

export type TagOption = { value: string; count: number };

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  tags: TagOption[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onReset?: () => void;
  hideSearch?: boolean;
};

export default function CatalogFilters({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  tags,
  selectedTags,
  onToggleTag,
  sortOption,
  onSortChange,
  onReset,
  hideSearch = false,
}: Props) {
  return (
    <div className="catalog-filters">
      {!hideSearch && (
        <div className="filter-section">
          <div className="filter-section__header">
            <h4>Buscar</h4>
          </div>
          <div className="filter-section__body">
            <label className="catalog-search">
              <span className="catalog-search__icon" aria-hidden>🔍</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre, categoría o palabra clave…"
                className="catalog-search__input"
              />
            </label>
          </div>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-section__header">
          <h4>Categorías</h4>
          {onReset && (
            <button type="button" className="catalog-reset catalog-reset--inline" onClick={onReset}>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="filter-section__body">
          <div className="catalog-chips">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`catalog-chip catalog-chip--pill ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="filter-section">
          <div className="filter-section__header">
            <h4>Tags</h4>
          </div>
          <div className="filter-section__body">
            <div className="catalog-chips catalog-chips--wrap">
              {tags.map(tag => {
                const isActive = selectedTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    className={`catalog-chip catalog-chip--tag ${isActive ? 'is-active' : ''}`}
                    onClick={() => onToggleTag(tag.value)}
                    aria-pressed={isActive}
                  >
                    #{tag.value}
                    <span className="catalog-chip__count">{tag.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="filter-section filter-section--footer">
        <div className="catalog-filter-meta">Usa varios tags para refinar los resultados.</div>
      </div>
    </div>
  );
}
