/// <reference types="jasmine" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponsiveProvider, ResponsiveState } from '../src/context/ResponsiveContext';
import Home from '../src/pages/homeComponents/Home';

function renderHomeWithState(state: ResponsiveState) {
  const { container } = render(
    <MemoryRouter>
      <ResponsiveProvider initialState={state}>
        <Home />
      </ResponsiveProvider>
    </MemoryRouter>
  );
  return { container };
}

describe('Home categorías responsive', () => {
  it('limita las categorías visibles en mobile y permite expandir', () => {
    const { container } = renderHomeWithState({
      width: 480,
      height: 800,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
    });

    const initialCards = container.querySelectorAll('.category-card');
    const initialCount = initialCards.length;

    // Validamos que al menos haya alguna categoría visible
    expect(initialCount).toBeGreaterThan(0);

    const showAllBtn = screen.getByRole('button', { name: /mostrar todas las categorias/i });
    fireEvent.click(showAllBtn);

    const expandedCards = container.querySelectorAll('.category-card');
    const expandedCount = expandedCards.length;

    // Después de expandir debe haber MÁS categorías que al inicio
    expect(expandedCount).toBeGreaterThan(initialCount);
  });

  it('muestra más categorías en desktop (vista completa)', () => {
    const { container } = renderHomeWithState({
      width: 1280,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
    });

    const cards = container.querySelectorAll('.category-card');
    const count = cards.length;

    // En desktop debería mostrarse un número "amplio" de categorías.
    // Ajustamos para que al menos haya varias (por ejemplo 6 o más).
    expect(count).toBeGreaterThanOrEqual(6);
  });
});
