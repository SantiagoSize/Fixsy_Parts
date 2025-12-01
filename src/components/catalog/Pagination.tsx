import React from 'react';

type Props = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

function getPages(current: number, totalPages: number, maxButtons = 5) {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages, 5);

  const goTo = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    if (safe !== currentPage) onPageChange(safe);
  };

  return (
    <nav className="pagination" aria-label="Paginación de productos">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <div className="pagination__pages">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagination__page ${p === currentPage ? 'is-active' : ''}`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </nav>
  );
}
