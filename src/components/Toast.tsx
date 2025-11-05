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
            <path fill="#FFCC00" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <div className="toast-message">{message}</div>
          <button className="toast-close" type="button" onClick={onClose} aria-label="Cerrar">
            ✖
          </button>
        </div>
      </div>
    </div>
  );
}

