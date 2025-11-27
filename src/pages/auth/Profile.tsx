import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile, ProfileRecord } from '../../hooks/useProfile';
import ProfileHeader from '../profileComponents/ProfileHeader';
import PhonesEditor from '../profileComponents/PhonesEditor';
import AddressesSection from '../profileComponents/AddressesSection';
import { Alert } from '../../components/Alert';
import './Profile.css';
import '../profileComponents/ProfilePage.css';
import { useNavigate } from 'react-router-dom';

// Futuro: aquí se puede condicionar UI según user.role (Admin/Soporte/Usuario)

export default function Profile() {
  const { user } = useAuth();
  const [loadingPic, setLoadingPic] = React.useState(false);
  const profileId = React.useMemo(() => (user ? user.id : 'guest'), [user]);
  const { profile, update, setPhoto, save } = useProfile(profileId, {
    firstName: user?.nombre || '',
    lastName: user?.apellido || '',
    profilePic: '',
    phone: '',
    landline: '',
    country: 'Chile',
    region: '',
    city: '',
    comuna: '',
    postalCode: '',
  });
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const onPickFile = (file: File) => {
    const reader = new FileReader();
    setSuccessMessage(null);
    setLoadingPic(true);
    reader.onload = () => { setPhoto(String(reader.result || '')); setLoadingPic(false); };
    reader.onerror = () => setLoadingPic(false);
    reader.readAsDataURL(file);
  };

  const handleUpdate = React.useCallback(<K extends keyof ProfileRecord>(k: K, v: ProfileRecord[K]) => {
    setSuccessMessage(null);
    update(k, v);
  }, [update]);

  const onSaveAll = () => {
    save();
    setSuccessMessage('Los datos del perfil se guardaron correctamente.');
  };
  const navigate = useNavigate();

  if (!user) return <div className="profile-wrapper"><div className="profile-card"><p>Debes iniciar sesión.</p></div></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <ProfileHeader firstName={profile.firstName} photo={profile.profilePic} onPick={onPickFile} loading={loadingPic} />

        <div className="profile-main-card">
          {successMessage && (
            <div className="profile-alert">
              <Alert type="success" message={successMessage} />
            </div>
          )}

          <section className="profile-section">
            <div className="hex-card">
              <h2 className="hex-title">Datos personales</h2>
              <div className="hex-fields">
                <div className="hex-row"><div className="hex-label">Nombre:</div><div className="hex-value">{profile.firstName}</div></div>
                <div className="hex-row"><div className="hex-label">Apellido:</div><div className="hex-value">{profile.lastName}</div></div>
                <div className="hex-row"><div className="hex-label">Correo:</div><div className="hex-value">{user.email}</div></div>
                {user.role !== 'Usuario' && (
                  <div className="hex-row"><div className="hex-label">Rol:</div><div className="hex-value">{user.role === 'Admin' ? 'Admin' : 'Soporte Técnico'}</div></div>
                )}
              </div>
            </div>
          </section>

          <PhonesEditor
            phone={profile.phone}
            landline={profile.landline}
            onChange={(k, v) => handleUpdate(k, v)}
          />

          <section className="profile-section panel">
            <AddressesSection profileId={profileId} role={user.role} />
          </section>

          <div className="profile-actions">
            <button type="button" className="btn-back" onClick={() => navigate(-1)}>Volver</button>
            <button type="button" className="btn-save" onClick={onSaveAll}>Guardar todo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
