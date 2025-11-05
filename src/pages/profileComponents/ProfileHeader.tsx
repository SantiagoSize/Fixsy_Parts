import React from 'react';

type Props = {
  firstName: string;
  photo: string;
  onPick: (file: File) => void;
  loading?: boolean;
};

export default function ProfileHeader({ firstName, photo, onPick, loading }: Props) {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {photo ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={photo} />
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

