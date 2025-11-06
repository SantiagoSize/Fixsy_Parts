import React from "react";
import { useAuth } from "../../context/AuthContext";
import "../profile.css";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
  phonePersonal: string;
  phoneLandline?: string;
  addressComment?: string;
  addressAlias?: string;
  street?: string;
  number?: string;
  comuna?: string;
  city?: string;
  region?: string;
  postalCode?: string;
};

const SESSION_KEY = 'fixsy_current_user';
const USERS_KEY = 'fixsy_users';

function readProfile(key: string, defaults: ProfileData): ProfileData {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...defaults, ...(JSON.parse(raw) as ProfileData) };
  } catch {}
  return defaults;
}

function saveProfile(key: string, data: ProfileData) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function updateUserStores(userId?: string, email?: string, nextPic?: string) {
  try {
    const sRaw = localStorage.getItem(SESSION_KEY);
    if (sRaw) {
      const s = JSON.parse(sRaw);
      s.profilePic = nextPic || '';
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
    const uRaw = localStorage.getItem(USERS_KEY);
    if (uRaw) {
      const list = JSON.parse(uRaw) as any[];
      const idx = list.findIndex(u => (u.id && u.id === userId) || (u.email && u.email === email));
      if (idx >= 0) {
        list[idx] = { ...list[idx], profilePic: nextPic || '' };
        localStorage.setItem(USERS_KEY, JSON.stringify(list));
      }
    }
  } catch {}
}

const field = (label: string, content: React.ReactNode) => (
  <div className="fxprofile-field" style={{ display: 'grid', gap: 6 }}>
    <label style={{ fontWeight: 600 }}>{label}</label>
    {content}
  </div>
);

export default function DashboardProfile() {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const roleFromStorage = ((): string => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')?.role || ''; } catch { return ''; }
  })();
  const role = user?.role || roleFromStorage || 'Usuario';
  const isAllowed = role === 'Admin' || role === 'Soporte';

  const storageKey = React.useMemo(() => user ? `fixsy_profile_${user.id}` : 'fixsy_profile_guest', [user?.id]);
  const defaults: ProfileData = React.useMemo(() => ({
    firstName: user?.nombre || '',
    lastName: user?.apellido || '',
    email: user?.email || '',
    role,
    profileImage: ((): string | undefined => {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')?.profilePic || undefined; } catch { return undefined; }
    })(),
    phonePersonal: '',
    phoneLandline: '',
    addressComment: '',
    addressAlias: '',
    street: '',
    number: '',
    comuna: '',
    city: '',
    region: '',
    postalCode: '',
  }), [user?.nombre, user?.apellido, user?.email, role]);

  const [data, setData] = React.useState<ProfileData>(() => readProfile(storageKey, defaults));
  const [error, setError] = React.useState<string>('');
  const [saved, setSaved] = React.useState<boolean>(false);
  const [toast, setToast] = React.useState<string>('');

  React.useEffect(() => {
    setData(readProfile(storageKey, defaults));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const onChange = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => {
    setSaved(false);
    setData(prev => ({ ...prev, [k]: v }));
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    onChange('profileImage', b64);
    try { localStorage.setItem('profileImage', b64); } catch {}
    saveProfile(storageKey, { ...data, profileImage: b64 });
    // Mostrar feedback sin recargar
    setToast('Cambios guardados con éxito');
    setTimeout(() => setToast(''), 3000);
  };

  const validate = (): boolean => {
    setError('');
    const emailOk = /.+@.+\..+/.test(data.email);
    if (!emailOk) { setError('Email no válido'); return false; }
    if (!data.firstName?.trim() || !data.lastName?.trim()) { setError('Nombre y apellido son requeridos'); return false; }
    if (!data.comuna?.trim() || !data.city?.trim() || !data.postalCode?.trim()) { setError('Comuna, ciudad y Codigo postal son requeridos'); return false; }
    if (data.phonePersonal && !/^\d{9}$/.test(data.phonePersonal)) { setError('Teléfono personal debe tener 9 dígitos'); return false; }
    if (data.phoneLandline && !/^\d{7,9}$/.test(data.phoneLandline)) { setError('Fijo entre 7 y 9 dígitos'); return false; }
    return true;
  };

  const onSaveAll = () => {
    if (!validate()) return;
    saveProfile(storageKey, data);
    updateUserStores(user?.id, user?.email, data.profileImage);
    setSaved(true);
    setToast('Cambios guardados con éxito');
    setTimeout(() => setToast(''), 3000);
  };

  if (!isAllowed) {
    return <div className="card">Acceso denegado: solo Admin/Soporte.</div>;
  }

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)',
    fontFamily: 'Montserrat, sans-serif'
  };
  const roStyle: React.CSSProperties = { ...inputStyle, background: '#F3F4F6', cursor: 'not-allowed' };
  const btn = (bg: string) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' } as React.CSSProperties);

  const section = (title: string, children: React.ReactNode) => (
    <div className="fxprofile-section">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'grid', gap: 12 }}>{children}</div>
    </div>
  );

  return (
    <div className="fxprofile-panel">
      {/* Título superior centrado */}
      <h2 style={{ margin: 0, color: '#111827', textAlign: 'center' }}>Perfil de Usuario</h2>

      {/* Foto centrada */}
      <div className="fxprofile-photo">
        <div className="fxprofile-photo__imgWrapper">
          {data.profileImage ? (
            <img src={data.profileImage} alt="Perfil" style={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 128, height: 128, borderRadius: '50%', background: '#E5E7EB', color: '#2C2A2B', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 48 }} aria-label="Avatar">
              {(data.firstName || 'U').slice(0,1).toUpperCase()}
            </div>
          )}
          <input id="photo" ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
      </div>

      {/* Botones bajo la foto */}
      <div className="fxprofile-actions">
        <button style={btn('#FF7A00')} onClick={() => fileInputRef.current?.click()}>Editar foto</button>
        <button style={btn('#EF4444')} onClick={() => { onChange('profileImage', undefined); try { localStorage.removeItem('profileImage'); } catch {}; saveProfile(storageKey, { ...data, profileImage: undefined }); updateUserStores(user?.id, user?.email, undefined); setSaved(true); setToast('Cambios guardados con exito'); setTimeout(()=>setToast(''),3000); }}>Borrar foto</button>
        <button style={btn('#28A745')} onClick={() => { saveProfile(storageKey, data); updateUserStores(user?.id, user?.email, data.profileImage); setSaved(true); setToast('Cambios guardados con exito'); setTimeout(()=>setToast(''),3000); }}>Guardar foto</button>
      </div>

      {/* Secciones compactas en grilla */}
      <div className="fxprofile-grid">
        {section('Datos personales', (
          <div className="fxprofile-grid--twoCols">
            {field('Nombres', <input style={roStyle} value={data.firstName} readOnly />)}
            {field('Apellidos', <input style={roStyle} value={data.lastName} readOnly />)}
            {field('Correo electronico', <input style={roStyle} value={data.email} readOnly />)}
            {field('Rol', <input style={{ ...roStyle, color: role === 'Admin' ? '#6B4DFF' : role === 'Soporte' ? '#FF7A00' : '#111827', fontWeight: 700 }} value={role} readOnly />)}
          </div>
        ))}

        {section('Contacto', (
          <div className="fxprofile-grid--twoCols">
            {field('Teléfono personal (+56)', (
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8 }}>
                <input style={{ ...roStyle, textAlign: 'center' }} value={'+56'} readOnly />
                <input style={inputStyle} value={data.phonePersonal} maxLength={9} placeholder="9 dígitos" onChange={e => onChange('phonePersonal', e.target.value.replace(/\D/g, ''))} />
              </div>
            ))}
            {field('Teléfono fijo (opcional)', <input style={inputStyle} value={data.phoneLandline || ''} maxLength={9} onChange={e => onChange('phoneLandline', e.target.value.replace(/\D/g, ''))} />)}
          </div>
        ))}

        <div style={{ gridColumn: '1 / -1' }}>
          {section('Direccion', (
            <div className="fxprofile-grid--twoCols">
              {field('Alias', <input style={inputStyle} value={data.addressAlias || ''} onChange={e => onChange('addressAlias', e.target.value)} placeholder="Casa principal / Oficina" />)}
              {field('Calle', <input style={inputStyle} value={data.street || ''} onChange={e => onChange('street', e.target.value)} />)}
              {field('Número', <input style={inputStyle} value={data.number || ''} onChange={e => onChange('number', e.target.value.replace(/[^\w-]/g, ''))} />)}
              {field('Comuna', <input style={inputStyle} value={data.comuna || ''} onChange={e => onChange('comuna', e.target.value)} />)}
              {field('Ciudad', <input style={inputStyle} value={data.city || ''} onChange={e => onChange('city', e.target.value)} />)}
              {field('Region', <input style={inputStyle} value={data.region || ''} onChange={e => onChange('region', e.target.value)} />)}
              {field('Codigo postal', <input style={inputStyle} value={data.postalCode || ''} onChange={e => onChange('postalCode', e.target.value.replace(/\D/g, ''))} />)}
              {field('Comentario adicional', <textarea style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)' }} value={data.addressComment || ''} onChange={e => onChange('addressComment', (e.target as HTMLTextAreaElement).value)} />)}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: '#ef4444', color: '#991b1b' }}>{error}</div>
      )}

      {/* Guardar todo al final */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button style={btn('#28A745')} onClick={onSaveAll}>Guardar todo</button>
      </div>

      {saved && (
        <div aria-live="polite" style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#111827', color: '#fff', padding: '12px 16px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', transition: 'opacity 0.2s ease-in-out', opacity: toast ? 1 : 0 }}>
          {toast || 'Cambios guardados con éxito'}
        </div>
      )}
    </div>
  );
}







