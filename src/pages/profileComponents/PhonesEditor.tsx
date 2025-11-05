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

  return (
    <section className="profile-section panel">
      <h2>Teléfonos</h2>
      <div className="profile-field">
        <label>Teléfono móvil:</label>
        <div className="field-row" style={{ gridTemplateColumns: '110px 1fr' as any }}>
          <span className="phone-prefix">{BASE_PREFIX}</span>
          <input
            type="tel"
            placeholder="Ej: 912345678"
            value={mobileNum}
            onChange={(e) => { const val = e.target.value; setMobileNum(val); onChange('phone', `${BASE_PREFIX} ${val}`.trim()); }}
          />
        </div>
      </div>
      <div className="profile-field">
        <label>Teléfono fijo:</label>
        <div className="field-row" style={{ gridTemplateColumns: '110px 1fr' as any }}>
          <span className="phone-prefix">{BASE_PREFIX}</span>
          <input
            type="tel"
            placeholder="Ej: 222345678"
            value={fixedNum}
            onChange={(e) => { const val = e.target.value; setFixedNum(val); onChange('landline', `${BASE_PREFIX} ${val}`.trim()); }}
          />
        </div>
      </div>
    </section>
  );
}

