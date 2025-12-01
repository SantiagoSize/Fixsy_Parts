/// <reference types="jasmine" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponsiveProvider, ResponsiveState } from '../src/context/ResponsiveContext';
import Home from '../src/pages/homeComponents/Home';


function renderHomeWithState(state: ResponsiveState, initialEntries?: string[]) {
  const { container } = render(
    <MemoryRouter>
      <ResponsiveProvider initialState={state}>
        <Home />
      </ResponsiveProvider>
    </MemoryRouter>
  );
  return { container };
}

describe('Home categorias responsive', () => {
  it('limita las categorias visibles en mobile y permite expandir', () => {
    const { container } = renderHomeWithState({
      width: 480,
      height: 800,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
    });

    const initialCards = container.querySelectorAll('.category-card');
    expect(initialCards.length).toBe(4);

    const showAllBtn = screen.getByRole('button', { name: /mostrar todas las categorias/i });
    fireEvent.click(showAllBtn);

    const expandedCards = container.querySelectorAll('.category-card');
    expect(expandedCards.length).toBeGreaterThan(4);
  });

  it('muestra todas las categorias en desktop', () => {
    const { container } = renderHomeWithState({
      width: 1280,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
    });
    const cards = container.querySelectorAll('.category-card');
    expect(cards.length).toBe(8);
  });
});
