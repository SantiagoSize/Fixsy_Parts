import React from 'react';

type Props = {
  phone: string;
  onChange: (key: 'phone', value: string) => void;
};

const BASE_PREFIX = '+56';

function extractAfterPrefix(value: string): string {
  const v = (value || '').trim();
  if (v.startsWith('+56')) return v.replace(/^\+56\s*/, '');
  return v;
}

export default function PhonesEditor({ phone, onChange }: Props) {
  const [mobileNum, setMobileNum] = React.useState('');

  React.useEffect(() => { setMobileNum(extractAfterPrefix(phone)); }, [phone]);
  const sanitize8 = (value: string) => (value || '').replace(/\D+/g, '').slice(0, 8);

  return (
    <section className="profile-section panel">
      <h2>Teléfono</h2>
      <div className="profile-field">
        <label>Teléfono:</label>
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
    </section>
  );
}
