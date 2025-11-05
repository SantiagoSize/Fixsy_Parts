import React from 'react';
import Toast from '../components/Toast';

type ShowToastFn = (message: string) => void;

let externalToast: ShowToastFn | null = null;

export function toast(message: string) {
  if (externalToast) {
    externalToast(message);
  } else {
    console.warn('ToastContainer no está montado aún. Mensaje:', message);
  }
}

export function useToast() {
  const [visible, setVisible] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const timerRef = React.useRef<number | null>(null);

  const show: ShowToastFn = React.useCallback((message: string) => {
    setMsg(message);
    // Reiniciar temporizador si ya estaba corriendo
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 3000);
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
    externalToast = show;
    return () => {
      externalToast = null;
    };
  }, [show]);

  const ToastContainer = React.useCallback(() => (
    <Toast visible={visible} message={msg} onClose={close} />
  ), [visible, msg, close]);

  return { toast: show, ToastContainer } as const;
}

