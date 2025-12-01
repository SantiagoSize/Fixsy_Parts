import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../profileComponents/ProfileHeader';
import PhonesEditor from '../profileComponents/PhonesEditor';
import AddressesSection from '../profileComponents/AddressesSection';
import { Alert } from '../../components/Alert';
import './Profile.css';
import '../profileComponents/ProfilePage.css';
import { USERS_API_BASE, buildUserAvatarUrl, parseErrorMessage } from '../../utils/api';

type ProfileForm = {
  firstName: string;
  lastName: string;
  profilePic: string;
  phone: string;
};

export default function Profile() {
  const { user, setSessionUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<ProfileForm>({
    firstName: user?.nombre || '',
    lastName: user?.apellido || '',
    profilePic: '',
    phone: '',
  });
  const [loadingPic, setLoadingPic] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const profileId = React.useMemo(() => (user ? String(user.id) : 'guest'), [user]);

  const loadProfile = React.useCallback(async () => {
    if (!user?.id) return;
    setLoadingProfile(true);
    setError(null);
    try {
      const response = await fetch(`${USERS_API_BASE}/api/users/${user.id}`);
      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'No se pudo cargar tu perfil.');
      }
      const data = await response.json();
      const firstName = data?.nombre ?? user?.nombre ?? '';
      const lastName = data?.apellido ?? user?.apellido ?? '';
      const avatarUrl = buildUserAvatarUrl(String(user.id), Date.now());
      setProfile({
        firstName,
        lastName,
        profilePic: avatarUrl,
        phone: data?.telefono ?? data?.phone ?? '',
      });
      setSessionUser({ ...user, nombre: firstName, apellido: lastName, profilePic: avatarUrl });
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar tu perfil.');
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.id, user?.nombre, user?.apellido, setSessionUser]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdate = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => {
    setSuccessMessage(null);
    setProfile(prev => ({ ...prev, [k]: v }));
  };

  const onSaveAll = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        nombre: profile.firstName.trim(),
        apellido: profile.lastName.trim(),
        telefono: profile.phone.trim(),
        email: user.email,
      };
      const response = await fetch(`${USERS_API_BASE}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'No se pudo actualizar el perfil.');
      }
      const data = await response.json();
      const firstName = data?.nombre ?? profile.firstName;
      const lastName = data?.apellido ?? profile.lastName;
      const avatarUrl = buildUserAvatarUrl(String(user.id), Date.now());
      const updated = {
        firstName,
        lastName,
        phone: data?.telefono ?? data?.phone ?? profile.phone,
        profilePic: avatarUrl,
      };
      setProfile(updated);
      setSessionUser({ ...user, nombre: firstName, apellido: lastName, profilePic: avatarUrl });
      setSuccessMessage('Los datos del perfil se guardaron correctamente.');
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onPickFile = async (file: File) => {
    if (!user?.id) return;
    const formData = new FormData();
    formData.append('file', file);
    setSuccessMessage(null);
    setError(null);
    setLoadingPic(true);
    try {
      const response = await fetch(`${USERS_API_BASE}/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'No se pudo subir la imagen.');
      }
      const version = Date.now();
      const avatarUrl = buildUserAvatarUrl(String(user.id), version);
      setProfile(prev => ({ ...prev, profilePic: avatarUrl }));
      setSessionUser({ ...user, profilePic: avatarUrl });
      setSuccessMessage('Avatar actualizado correctamente.');
    } catch (err: any) {
      setError(err?.message || 'No se pudo subir la imagen.');
    } finally {
      setLoadingPic(false);
    }
  };

  if (!user) return <div className="profile-wrapper"><div className="profile-card"><p>Debes iniciar sesion.</p></div></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <ProfileHeader firstName={profile.firstName} photo={profile.profilePic} onPick={onPickFile} loading={loadingPic} />

        <div className="profile-main-card">
          {error && (
            <div className="profile-alert">
              <Alert type="error" message={error} />
            </div>
          )}
          {successMessage && (
            <div className="profile-alert">
              <Alert type="success" message={successMessage} />
            </div>
          )}

          <section className="profile-section">
            <div className="hex-card">
              <h2 className="hex-title">Datos personales</h2>
              <div className="hex-fields">
                <div className="hex-row">
                  <div className="hex-label">Nombre:</div>
                  <input
                    className="hex-value editable"
                    value={profile.firstName}
                    onChange={e => handleUpdate('firstName', e.target.value)}
                    disabled={loadingProfile}
                  />
                </div>
                <div className="hex-row">
                  <div className="hex-label">Apellido:</div>
                  <input
                    className="hex-value editable"
                    value={profile.lastName}
                    onChange={e => handleUpdate('lastName', e.target.value)}
                    disabled={loadingProfile}
                  />
                </div>
                <div className="hex-row"><div className="hex-label">Correo:</div><div className="hex-value">{user.email}</div></div>
                {user.role !== 'Usuario' && (
                  <div className="hex-row"><div className="hex-label">Rol:</div><div className="hex-value">{user.role}</div></div>
                )}
              </div>
            </div>
          </section>

          <PhonesEditor
            phone={profile.phone}
            onChange={(k, v) => handleUpdate(k, v)}
          />

          <section className="profile-section panel">
            <AddressesSection profileId={profileId} role={user.role} />
          </section>

          <div className="profile-actions">
            <button type="button" className="btn-back" onClick={() => navigate(-1)} disabled={loadingProfile || savingProfile}>Volver</button>
            <button type="button" className="btn-save" onClick={onSaveAll} disabled={loadingProfile || savingProfile}>
              {savingProfile ? 'Guardando...' : 'Guardar todo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
