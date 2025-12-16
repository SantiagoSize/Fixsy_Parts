import React from 'react';

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
  onReset?: () => void;
  hideSearch?: boolean;
  offersOnly?: boolean;
  onToggleOffers?: () => void;
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
  onReset,
  hideSearch = false,
  offersOnly = false,
  onToggleOffers = () => {},
}: Props) {
  const [openPanel, setOpenPanel] = React.useState<'categories' | 'tags' | null>(null);
  const selectedLabel = selectedCategory === 'all' ? 'Todos' : selectedCategory;
  const tagsLabel = selectedTags.length === 0
    ? 'Seleccionar'
    : selectedTags.length === 1
      ? `#${selectedTags[0]}`
      : `${selectedTags.length} tags seleccionados`;

  const togglePanel = (panel: 'categories' | 'tags') => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setOpenPanel(null);
  };

  return (
    <div className="catalog-filters">
      <div className="sidebar-card sidebar-card--title">
        <h3>Filtros</h3>
      </div>

      {!hideSearch && (
        <section className="sidebar-card sidebar-card--search">
          <label className="catalog-search">
            <span className="catalog-search__icon" aria-hidden>
              🔍
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, categoría o palabra clave"
              className="catalog-search__input"
            />
          </label>
        </section>
      )}

      <section className="sidebar-card sidebar-card--cascade">
        <header className="sidebar-card__header">
          <h4 className="sidebar-card__title">Categorías</h4>
        </header>
        <div className="sidebar-card__body">
          <button
            type="button"
            className={`cascade-trigger ${openPanel === 'categories' ? 'is-open' : ''}`}
            onClick={() => togglePanel('categories')}
            aria-expanded={openPanel === 'categories'}
          >
            <span className="cascade-trigger__value">{selectedLabel}</span>
            <span className="cascade-trigger__arrow" aria-hidden>
              ▶
            </span>
          </button>
          {openPanel === 'categories' && (
            <div className="cascade-panel" role="listbox" aria-label="Seleccionar categoría">
              <button
                type="button"
                role="option"
                aria-selected={selectedCategory === 'all'}
                className={`cascade-item ${selectedCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                <span className="cascade-item__content">
                  <span className="cascade-indicator" aria-hidden />
                  <span>Todos</span>
                </span>
                <span className="cascade-item__right">✓</span>
              </button>
              {categories
                .filter((cat) => cat !== 'all')
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="option"
                    aria-selected={selectedCategory === cat}
                    className={`cascade-item ${selectedCategory === cat ? 'is-active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className="cascade-item__content">
                      <span className="cascade-indicator" aria-hidden />
                      <span>{cat}</span>
                    </span>
                    <span className="cascade-item__right">✓</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

      <section className="sidebar-card sidebar-card--cascade">
        <header className="sidebar-card__header">
          <h4 className="sidebar-card__title">Tags</h4>
        </header>
        <div className="sidebar-card__body">
          <button
            type="button"
            className={`cascade-trigger ${openPanel === 'tags' ? 'is-open' : ''}`}
            onClick={() => togglePanel('tags')}
            aria-expanded={openPanel === 'tags'}
          >
            <span className="cascade-trigger__value">{tagsLabel}</span>
            <span className="cascade-trigger__arrow" aria-hidden>
              ▶
            </span>
          </button>
          {openPanel === 'tags' && (
            <div className="cascade-panel cascade-panel--tags" role="group" aria-label="Tags">
              {tags.map((tag) => {
                const isActive = selectedTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    className={`cascade-item tag-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => onToggleTag(tag.value)}
                    aria-pressed={isActive}
                  >
                    <span className="cascade-item__content">
                      <span className="tag-item__indicator" aria-hidden />
                      <span>#{tag.value}</span>
                    </span>
                    <span className="tag-count">{tag.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="sidebar-card sidebar-card--offers">
        <header className="sidebar-card__header">
          <h4 className="sidebar-card__title">Ofertas</h4>
        </header>
        <div className="sidebar-card__body">
          <button
            type="button"
            className={`offers-toggle ${offersOnly ? 'is-active' : ''}`}
            onClick={onToggleOffers}
            aria-pressed={offersOnly}
          >
            <span>{offersOnly ? 'Solo ofertas (activo)' : 'Mostrar solo ofertas'}</span>
            <span className="offers-toggle__icon" aria-hidden>
              🔥
            </span>
          </button>
        </div>
      </section>

      <button
        type="button"
        className="sidebar-action-btn sidebar-action-btn--danger"
        onClick={() => {
          onReset?.();
        }}
      >
        Limpiar filtros
      </button>
    </div>
  );
}
