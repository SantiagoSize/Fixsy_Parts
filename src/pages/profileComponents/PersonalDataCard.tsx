import React from 'react';

type Props = { firstName: string; lastName: string; email: string };

export default function PersonalDataCard({ firstName, lastName, email }: Props) {
  return (
    <section className="profile-section">
      <h2>Datos personales</h2>
      <div className="profile-field"><label>Nombre</label><input value={firstName} disabled /></div>
      <div className="profile-field"><label>Apellido</label><input value={lastName} disabled /></div>
      <div className="profile-field"><label>Correo</label><input value={email} disabled /></div>
    </section>
  );
}

