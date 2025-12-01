import React from 'react';

type Props = {
  firstName: string;
  photo: string;
  onPick: (file: File) => void;
  loading?: boolean;
};

export default function ProfileHeader({ firstName, photo, onPick, loading }: Props) {
  const [imageFailed, setImageFailed] = React.useState(false);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
  };

  React.useEffect(() => { setImageFailed(false); }, [photo]);

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {photo && !imageFailed ? (
          <img src={photo} alt="Avatar del usuario" onError={() => setImageFailed(true)} />
        ) : (
          <div className="avatar-placeholder">{firstName?.[0]?.toUpperCase() || 'U'}</div>
        )}
      </div>
      <div className="profile-upload">
        <label className="btn-secondary">
          {loading ? 'Cargando...' : 'Editar foto'}
          <input type="file" accept="image/*" onChange={onChange} hidden />
        </label>
      </div>
    </div>
  );
}

