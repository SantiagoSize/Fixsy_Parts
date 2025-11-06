import React from 'react';

type Props = {
  phone: string;
  landline: string;
  onChange: (key: 'phone' | 'landline', value: string) => void;
};

const BASE_PREFIX = '+56';

function extractAfterPrefix(value: string): string {
  const v = (value || '').trim();
  if (v.startsWith('+56')) return v.replace(/^\+56\s*/, '');
  return v;
}

export default function PhonesEditor({ phone, landline, onChange }: Props) {
  const [mobileNum, setMobileNum] = React.useState('');
  const [fixedNum, setFixedNum] = React.useState('');

  React.useEffect(() => { setMobileNum(extractAfterPrefix(phone)); }, [phone]);
  React.useEffect(() => { setFixedNum(extractAfterPrefix(landline)); }, [landline]);
  const sanitize8 = (value: string) => (value || '').replace(/\D+/g, '').slice(0, 8);

  return (
    <section className="profile-section panel">
      <h2>Teléfonos</h2>
      <div className="profile-field">
        <label>Teléfono móvil:</label>
        <div className="field-row" style={{ gridTemplateColumns: '110px 1fr' as any }}>
          <span className="phone-prefix">{BASE_PREFIX}</span>
          <input
            type="tel"
            placeholder="Ej: 12345678"
            inputMode="numeric"
            pattern="^[0-9]{0,8}$"
            maxLength={8}
            title="Ingrese hasta 8 dígitos"
            value={mobileNum}
            onChange={(e) => { const v = sanitize8(e.target.value); setMobileNum(v); onChange('phone', `${BASE_PREFIX} ${v}`.trim()); }}
          />
        </div>
      </div>
      <div className="profile-field">
        <label>Teléfono fijo:</label>
        <div className="field-row" style={{ gridTemplateColumns: '110px 1fr' as any }}>
          <span className="phone-prefix">{BASE_PREFIX}</span>
          <input
            type="tel"
            placeholder="Ej: 12345678"
            inputMode="numeric"
            pattern="^[0-9]{0,8}$"
            maxLength={8}
            title="Ingrese hasta 8 dígitos"
            value={fixedNum}
            onChange={(e) => { const v = sanitize8(e.target.value); setFixedNum(v); onChange('landline', `${BASE_PREFIX} ${v}`.trim()); }}
          />
        </div>
      </div>
    </section>
  );
}

