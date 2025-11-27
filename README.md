# Fixsy Parts

Aplicación web de catálogo y gestión de repuestos construida con React + TypeScript (Vite). Incluye vitrina para clientes, flujo de compra demo y un dashboard para roles de Admin y Soporte.

## Funciones principales
- **Catálogo** con buscador y grilla responsiva (1/2/3/4 columnas) usando componentes reutilizables (`ProductCard`, `ProductModal`).
- **Carrito y Checkout**: cálculo de totales, validaciones básicas, botones con estado de carga y feedback de éxito/error.
- **Autenticación**: login/registro con reCAPTCHA opcional, roles unificados (`Usuario`, `Admin`, `Soporte`) y guardas de ruta.
- **Dashboard**:
  - **UserManagement** modular (tabla, modal de detalle, historial de compras, mensajes del usuario).
  - **Inbox/Tickets**: bandeja de mensajes con filtros, lectura/marcado y tickets con respuestas y cambio de estado.
  - **Widgets**: KPIs de usuarios, clientes, inventario y tickets recientes.
- **Mensajería unificada**: provider real en `src/messages/MessagesContext.tsx` y wrapper `useMessages` en `src/context/MessagesContext.tsx`.
- **Soporte/Contacto**: formulario con envío a inbox/tickets y manejo de adjuntos simulado.

## Validaciones y UX
- Formularios (login, registro, checkout, contacto, compose) con:
  - Validación visible de campos requeridos y formatos de email.
  - Estados `loading`, `error`, `success` y botones deshabilitados mientras se procesa.
  - Estilos consistentes vía `src/styles/forms.css` (`.form-input`, `.form-error`, `.form-success`, `.form-button`).
- Mensajería e inbox con estados de carga, error y vacíos; conteo de no leídos.
- Tablas y tarjetas con `overflow-x: auto` en móvil para evitar desbordes.

## Estructura breve
- `src/pages/`: vistas públicas (home, catálogo, auth, cuenta, soporte, contacto, checkout).
- `src/dashboard/`: vistas privadas y componentes del panel (incluye `components/user/` para UserManagement).
- `src/components/`: reutilizables (Alert, ProductCard, ProductModal, etc.).
- `src/context/`: providers (Auth, Cart, Orders, Messages wrapper).
- `src/messages/`: provider real de mensajería.
- `src/utils/`: utilidades (storageKeys, seeding `useInitDemoData`, inventory, uuid).
- `src/types/`: modelos tipados (auth, user, mensajes).
- `src/styles/`: estilos globales (incluye `forms.css`).

## Almacenamiento y seeding
- Claves de `localStorage` centralizadas en `src/utils/storageKeys.ts` (sin strings mágicos).
- Seeding inicial de demo con `useInitDemoData` (usuarios, inventario, mensajes).
- Prefijos para inbox/tickets en storage (`inboxPrefix`, `ticketsPrefix`) usados en dashboard y contacto.

## Responsividad
- Navbar con menú colapsable en móvil.
- Catálogo y dashboard con layouts adaptables; tablas y tarjetas con scroll horizontal en pantallas pequeñas.
- Perfil, inbox y tickets se apilan en mobile para evitar cortes.

## Cómo ejecutar
```bash
npm install
npm run dev   # entorno de desarrollo
npm run build # compilación de producción
```
