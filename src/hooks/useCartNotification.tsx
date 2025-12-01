import React from 'react';
import CartNotification, { CartNotificationData } from '../components/CartNotification';

type ShowCartNotificationFn = (data: CartNotificationData) => void;

let externalShowNotification: ShowCartNotificationFn | null = null;

/**
 * Función global para mostrar la notificación del carrito
 * Se puede llamar desde cualquier parte de la aplicación
 */
export function showCartNotification(data: CartNotificationData) {
  if (externalShowNotification) {
    externalShowNotification(data);
  } else {
    console.warn('CartNotificationContainer no está montado aún.');
  }
}

/**
 * Hook para manejar el estado de la notificación del carrito
 * Devuelve el componente contenedor que debe renderizarse en el árbol de React
 */
export function useCartNotification() {
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState<CartNotificationData | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const show: ShowCartNotificationFn = React.useCallback((notificationData: CartNotificationData) => {
    setData(notificationData);
    
    // Limpiar timer anterior si existe
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setVisible(true);
    
    // Auto-cerrar después de 4 segundos
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 4000);
  }, []);

  const close = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Exponer API global
  React.useEffect(() => {
    externalShowNotification = show;
    return () => {
      externalShowNotification = null;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [show]);

  // Componente contenedor
  const CartNotificationContainer = React.useCallback(() => (
    <CartNotification visible={visible} data={data} onClose={close} />
  ), [visible, data, close]);

  return { showCartNotification: show, CartNotificationContainer } as const;
}

