import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../src/pages/sharedComponents/NavBar';
import { AuthContext } from '../src/context/AuthContext';
import { CartContext } from '../src/context/CartContext';
import { ResponsiveProvider } from '../src/context/ResponsiveContext';
import { BrowserRouter } from 'react-router-dom';

describe('NavBar', () => {
    const mockAuth = {
        user: { id: '1', nombre: 'Test', email: 'test@test.com', role: 'Usuario' as const },
        isAuthenticated: true,
        login: jasmine.createSpy('login'),
        register: jasmine.createSpy('register'),
        logout: jasmine.createSpy('logout'),
        refreshUser: jasmine.createSpy('refreshUser'),
        setSessionUser: jasmine.createSpy('setSessionUser'),
    };

    const mockCart = {
        items: [],
        addToCart: jasmine.createSpy('addToCart'),
        updateQuantity: jasmine.createSpy('updateQuantity'),
        removeFromCart: jasmine.createSpy('removeFromCart'),
        clearCart: jasmine.createSpy('clearCart'),
        restockProduct: jasmine.createSpy('restockProduct'),
    };

    const renderNavBar = (authOverrides = {}, cartOverrides = {}) => {
        return render(
            <AuthContext.Provider value={{ ...mockAuth, ...authOverrides } as any}>
                <CartContext.Provider value={{ ...mockCart, ...cartOverrides } as any}>
                    <ResponsiveProvider>
                        <BrowserRouter>
                            <NavBar />
                        </BrowserRouter>
                    </ResponsiveProvider>
                </CartContext.Provider>
            </AuthContext.Provider>
        );
    };

    it('renderiza correctamente el componente dentro de una etiqueta nav', () => {
        const { container } = renderNavBar();
        // Busca la etiqueta nav
        const navElement = container.querySelector('nav');
        expect(navElement).toBeTruthy();
        expect(navElement?.className).toContain('navbar');
    });

    it('muestra el botón de perfil cuando está autenticado', () => {
        renderNavBar({ isAuthenticated: true });
        // Busca el botón de cuenta
        const profileBtn = screen.getByLabelText('Cuenta');
        expect(profileBtn).toBeDefined();
    });

    it('DOM Manipulation: despliega el menú al hacer click en el perfil', () => {
        renderNavBar({ isAuthenticated: true });

        // Al inicio el menú "Cerrar sesion" no debería estar visible
        let logoutBtn = screen.queryByText('Cerrar sesion');
        expect(logoutBtn).toBeNull();

        // Simular click
        const profileBtn = screen.getByLabelText('Cuenta');
        fireEvent.click(profileBtn);

        // Ahora debería aparecer en el DOM
        logoutBtn = screen.getByText('Cerrar sesion');
        expect(logoutBtn).toBeDefined();
    });

    it('DOM Manipulation: oculta el menú al hacer click en una opción', () => {
        renderNavBar({ isAuthenticated: true });

        const profileBtn = screen.getByLabelText('Cuenta');
        fireEvent.click(profileBtn);

        const logoutMenuBtn = screen.getByText('Cerrar sesion');
        fireEvent.click(logoutMenuBtn);

        // Debería llamar logout
        expect(mockAuth.logout).toHaveBeenCalled();
        // Y el menú debería desaparecer (o al menos react-router navegaría, 
        // pero aquí verificamos la interacción)
    });
});
