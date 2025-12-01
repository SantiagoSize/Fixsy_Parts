import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogProductCard from '../src/components/catalog/CatalogProductCard';

const baseProduct = {
  id: 1,
  nombre: 'Filtro de aceite',
  descripcion: 'Filtro premium',
  precio: 120,
  precioNormal: 120,
  stock: 5,
  images: [],
  imageUrl: '',
};

describe('CatalogProductCard', () => {
  it('habilita agregar cuando hay stock y dispara callback', () => {
    const handleAdd = jasmine.createSpy('onAdd');
    render(
      <CatalogProductCard
        product={baseProduct as any}
        onAdd={handleAdd}
        variant="grid"
      />
    );

    const button = screen.getByRole('button', { name: /agregar al carrito/i });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('deshabilita agregar y muestra sin stock cuando no hay unidades', () => {
    const handleAdd = jasmine.createSpy('onAdd');
    render(
      <CatalogProductCard
        product={{ ...baseProduct, stock: 0 } as any}
        onAdd={handleAdd}
        variant="grid"
      />
    );

    const button = screen.getByRole('button', { name: /sin stock/i });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it('muestra vista de lista y el boton de ver detalle dispara onView', () => {
    const handleView = jasmine.createSpy('onView');
    render(
      <CatalogProductCard
        product={baseProduct as any}
        onAdd={() => {}}
        onView={handleView}
        variant="list"
      />
    );

    const viewBtn = screen.getByRole('button', { name: /ver detalle/i });
    fireEvent.click(viewBtn);
    expect(handleView).toHaveBeenCalledTimes(1);
  });
});
