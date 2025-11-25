import React from 'react';
import { useAddresses, Address } from '../../hooks/useAddresses';
import ModalAddAddress from './ModalAddAddress';
import { toast } from '../../hooks/useToast';
import { Role } from '../../types/auth';

type Props = { profileId: string; role?: Role };

const CHILE_GEODATA: Record<string, Record<string, string[]>> = {
  'Metropolitana de Santiago': { 'Santiago': ['Santiago', 'Providencia', 'Las Condes', 'La Florida'] },
  'Valparaíso': { 'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué'] },
  'Biobío': { 'Concepción': ['Concepción', 'Talcahuano', 'San Pedro de la Paz'] },
};
const REGIONS = Object.keys(CHILE_GEODATA);
const provincesFor = (region: string) => (CHILE_GEODATA[region] ? Object.keys(CHILE_GEODATA[region]) : []);
const communesFor = (region: string, province: string) => (CHILE_GEODATA[region]?.[province] || []);

export default function AddressesSection({ profileId, role }: Props) {
  const { addresses, add, update, remove } = useAddresses(profileId);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const isAdminLike = role === 'Admin' || role === 'Soporte';

  // Inline form state for admin/support
  const [adminForm, setAdminForm] = React.useState<Omit<Address, 'id'>>({
    alias: '', address: '', number: '', comment: '', region: '', province: '', commune: '', postalCode: '', phone: ''
  });
  const [adminEditing, setAdminEditing] = React.useState(false);

  React.useEffect(() => {
    if (isAdminLike) {
      const a = addresses[0];
      if (a) {
        setAdminForm({ alias: a.alias, address: a.address, number: a.number, comment: a.comment, region: a.region, province: a.province, commune: a.commune, postalCode: a.postalCode, phone: a.phone });
        setAdminEditing(false);
      } else {
        setAdminForm({ alias: '', address: '', number: '', comment: '', region: '', province: '', commune: '', postalCode: '', phone: '' });
        setAdminEditing(true);
      }
    }
  }, [isAdminLike, addresses]);

  const onSaveModal = (val: Omit<Address, 'id'>) => {
    if (editing) {
      update(editing.id, val);
      setEditing(null);
    } else {
      if (isAdminLike && addresses.length >= 1) {
        toast('Solo se permite una dirección para cuentas administrativas.');
        return;
      }
      add(val);
    }
    setOpen(false);
    toast('Dirección guardada ✅');
  };

  const onAdminSave = () => {
    if (!adminForm.alias.trim()) { toast('Alias requerido'); return; }
    if (!adminForm.address.trim() || !adminForm.number.trim() || !adminForm.region.trim() || !adminForm.province.trim() || !adminForm.commune.trim() || !/^[0-9]+$/.test(adminForm.postalCode)) {
      toast('Completa los campos obligatorios');
      return;
    }
    if (addresses[0]) {
      update(addresses[0].id, adminForm);
      setAdminEditing(false);
      toast('Dirección guardada ✅');
    } else {
      if (addresses.length >= 1) { toast('Solo puedes tener una dirección en este tipo de cuenta.'); return; }
      add(adminForm);
      setAdminEditing(false);
      toast('Dirección guardada ✅');
    }
  };

  return (
    <section className="profile-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Direcciones</h2>
        {!isAdminLike && addresses.length > 0 && (
          <button className="btn-primary" type="button" onClick={() => { setEditing(null); setOpen(true); }}>+ Agregar dirección</button>
        )}
      </div>

      {isAdminLike ? (
        <div className="panel" style={{ display: 'grid', gap: 10 }}>
          <div className="profile-field"><label>Alias</label><input value={adminForm.alias} onChange={e => setAdminForm({ ...adminForm, alias: e.target.value })} disabled={!adminEditing} /></div>
          <div className="profile-field"><label>Dirección</label><input value={adminForm.address} onChange={e => setAdminForm({ ...adminForm, address: e.target.value })} disabled={!adminEditing} /></div>
          <div className="profile-field"><label>Número casa / depto</label><input value={adminForm.number} onChange={e => setAdminForm({ ...adminForm, number: e.target.value })} disabled={!adminEditing} /></div>
          <div className="profile-field"><label>Comentario</label><textarea rows={3} value={adminForm.comment} onChange={e => setAdminForm({ ...adminForm, comment: e.target.value })} disabled={!adminEditing} /></div>
          <div className="profile-field"><label>Región</label>
            <select value={adminForm.region} onChange={e => { const region = e.target.value; const provs = provincesFor(region); setAdminForm(prev => ({ ...prev, region, province: provs[0] || '', commune: '' })); }} disabled={!adminEditing}>
              <option value="">Seleccione región</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="profile-field"><label>Provincia</label>
            <select value={adminForm.province} onChange={e => setAdminForm(prev => ({ ...prev, province: e.target.value, commune: '' }))} disabled={!adminEditing || !adminForm.region}>
              <option value="">Seleccione provincia</option>
              {provincesFor(adminForm.region).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="profile-field"><label>Comuna</label>
            <select value={adminForm.commune} onChange={e => setAdminForm(prev => ({ ...prev, commune: e.target.value }))} disabled={!adminEditing || !adminForm.province}>
              <option value="">Seleccione comuna</option>
              {communesFor(adminForm.region, adminForm.province).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="profile-field"><label>Código postal</label><input value={adminForm.postalCode} onChange={e => setAdminForm({ ...adminForm, postalCode: e.target.value })} disabled={!adminEditing} /></div>
          <div className="profile-field"><label>Teléfono de contacto</label><input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} placeholder="Ej: 912345678" disabled={!adminEditing} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {!adminEditing ? (
              <button className="btn-secondary" type="button" onClick={() => setAdminEditing(true)}>Editar</button>
            ) : (
              <button className="btn-save" type="button" onClick={onAdminSave}>Guardar Cambios</button>
            )}
          </div>
        </div>
      ) : (
        <>
          {addresses.length === 0 ? (
            <>
              <p style={{ color: '#666', marginBottom: 10 }}>No hay direcciones guardadas</p>
              <button className="btn-primary" type="button" onClick={() => { setEditing(null); setOpen(true); }}>+ Agregar dirección</button>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{ border: '1px solid #0064CD', borderRadius: 12, padding: '10px 12px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                    <div>
                      <div><strong>{addr.alias || 'Sin alias'}</strong></div>
                      <div style={{ color: '#555' }}>{addr.address} {addr.number}</div>
                      <div style={{ color: '#777' }}>{addr.commune}, {addr.province}, {addr.region}</div>
                      <div style={{ color: '#777' }}>CP {addr.postalCode}</div>
                      {addr.comment && <div style={{ color: '#777', marginTop: 4 }}>{addr.comment}</div>}
                      {addr.phone && <div style={{ color: '#333', marginTop: 4 }}>Tel: {addr.phone}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ background: '#FFC107', color: '#2C2A2B', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }} type="button" onClick={() => { setEditing(addr); setOpen(true); }}>Editar</button>
                      <button style={{ background: '#D32F2F', color: '#fff', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }} type="button" onClick={() => remove(addr.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isAdminLike && (
        <ModalAddAddress
          open={open}
          initial={editing ?? undefined}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={onSaveModal}
        />
      )}
    </section>
  );
}
