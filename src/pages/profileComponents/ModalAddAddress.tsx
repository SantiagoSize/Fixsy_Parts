import React from 'react';
import type { Address } from '../../hooks/useAddresses';
import './ModalAddAddress.css';
import { toast } from '../../hooks/useToast';

type Props = {
  open: boolean;
  initial?: Partial<Address>;
  onClose: () => void;
  onSave: (value: Omit<Address, 'id'>) => void;
};

// Datos dependientes (subset práctico)
const CHILE_GEODATA: Record<string, Record<string, string[]>> = {
  'Metropolitana de Santiago': {
    'Santiago': ['Santiago', 'Providencia', 'Las Condes', 'La Florida'],
  },
  'Valparaíso': {
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué'],
  },
  'Biobío': {
    'Concepción': ['Concepción', 'Talcahuano', 'San Pedro de la Paz'],
  },
};

const REGIONS = Object.keys(CHILE_GEODATA);

function provincesFor(region: string): string[] {
  if (!region || !CHILE_GEODATA[region]) return [];
  return Object.keys(CHILE_GEODATA[region]);
}
function communesFor(region: string, province: string): string[] {
  if (!region || !province) return [];
  return CHILE_GEODATA[region]?.[province] || [];
}

export default function ModalAddAddress({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = React.useState<Omit<Address, 'id'>>({
    alias: initial?.alias || '',
    address: initial?.address || '',
    number: initial?.number || '',
    comment: initial?.comment || '',
    region: initial?.region || '',
    province: initial?.province || '',
    commune: initial?.commune || '',
    postalCode: initial?.postalCode || '',
    phone: initial?.phone || '',
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof Omit<Address, 'id'>, string>>>({});

  React.useEffect(() => {
    setForm({
      alias: initial?.alias || '',
      address: initial?.address || '',
      number: initial?.number || '',
      comment: initial?.comment || '',
      region: initial?.region || '',
      province: initial?.province || '',
      commune: initial?.commune || '',
      postalCode: initial?.postalCode || '',
      phone: initial?.phone || '',
    });
    setErrors({});
  }, [initial?.alias, initial?.address, initial?.number, initial?.comment, initial?.region, initial?.province, initial?.commune, initial?.postalCode, initial?.phone]);

  if (!open) return null;

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.alias.trim()) next.alias = 'Alias requerido';
    if (!form.address.trim()) next.address = 'Dirección requerida';
    if (!form.number.trim()) next.number = 'Número requerido';
    if (!form.region.trim()) next.region = 'Selecciona región';
    if (!form.province.trim()) next.province = 'Selecciona provincia';
    if (!form.commune.trim()) next.commune = 'Selecciona comuna';
    if (!/^\d+$/.test(form.postalCode.trim())) next.postalCode = 'Código postal numérico';
    if (form.phone && !/^\d{8,9}$/.test(form.phone.trim())) next.phone = 'Teléfono chileno 8-9 dígitos';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onRegion = (region: string) => {
    const provs = provincesFor(region);
    setForm(prev => ({ ...prev, region, province: provs[0] || '', commune: '' }));
  };
  const onProvince = (province: string) => {
    setForm(prev => ({ ...prev, province, commune: '' }));
  };

  const headerTitle = initial?.id ? 'Editar dirección' : 'Nueva dirección';

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    toast('Dirección guardada ✅');
  };

  const provs = provincesFor(form.region);
  const comms = communesFor(form.region, form.province);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card animated-in">
        <div className="modal-header">
          <h3>{headerTitle}</h3>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <div className="profile-field"><label>Alias de dirección</label><input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} />{errors.alias && <div className="field-error">{errors.alias}</div>}</div>
          <div className="profile-field"><label>Dirección</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />{errors.address && <div className="field-error">{errors.address}</div>}</div>
          <div className="profile-field"><label>Número casa / depto</label><input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />{errors.number && <div className="field-error">{errors.number}</div>}</div>
          <div className="profile-field"><label>Comentario adicional</label><textarea rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></div>
          <div className="profile-field"><label>Región</label>
            <select value={form.region} onChange={e => onRegion(e.target.value)}>
              <option value="">Seleccione región</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.region && <div className="field-error">{errors.region}</div>}
          </div>
          <div className="profile-field"><label>Provincia</label>
            <select value={form.province} onChange={e => onProvince(e.target.value)} disabled={!form.region}>
              <option value="">Seleccione provincia</option>
              {provs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <div className="field-error">{errors.province}</div>}
          </div>
          <div className="profile-field"><label>Comuna</label>
            <select value={form.commune} onChange={e => setForm({ ...form, commune: e.target.value })} disabled={!form.province}>
              <option value="">Seleccione comuna</option>
              {comms.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.commune && <div className="field-error">{errors.commune}</div>}
          </div>
          <div className="profile-field"><label>Código postal</label><input value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} />{errors.postalCode && <div className="field-error">{errors.postalCode}</div>}</div>
          <div className="profile-field"><label>Teléfono de contacto</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 912345678" />{errors.phone && <div className="field-error">{errors.phone}</div>}</div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSave}>{initial?.id ? 'Guardar Cambios' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
