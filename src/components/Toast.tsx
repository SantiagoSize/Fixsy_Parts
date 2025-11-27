import React from 'react';
import '../styles/toast.css';

export type ToastProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export default function Toast({ visible, message, onClose }: ToastProps) {
  return (
    <div className={`toast-container ${visible ? 'show' : ''}`} aria-live="polite" aria-atomic="true">
      <div className={`toast ${visible ? 'show' : ''}`} role="status">
        <div className="toast-content">
          <svg className="toast-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#26AB4E" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.1 14.2-3.6-3.6 1.4-1.4 2.2 2.2 5-5 1.4 1.4-6.6 6.8z" />
          </svg>
          <div className="toast-message">{message}</div>
          <button className="toast-close" type="button" onClick={onClose} aria-label="Cerrar">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
