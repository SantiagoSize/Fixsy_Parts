import React from 'react';

type AlertProps = {
  type: 'error' | 'success';
  message: string;
};

export function Alert({ type, message }: AlertProps) {
  const palette = type === 'error'
    ? { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' }
    : { bg: '#ECFDF3', color: '#0F766E', border: '#A7F3D0' };
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: '10px 12px',
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

export default Alert;
