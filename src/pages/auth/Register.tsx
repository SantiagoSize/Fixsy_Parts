import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { isAuthRoute } from '../../utils/isAuthRoute';
import getRecaptchaKey from '../../utils/getRecaptchaKey';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [confirmEmail, setConfirmEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const recaptchaRef = React.useRef<ReCAPTCHA | null>(null);
  const siteKey = getRecaptchaKey();
  const shouldUseCaptcha = isAuthRoute(location.pathname);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirm) {
      setError('Completa todos los campos');
      return;
    }
    if (!/.+@.+\..+/.test(email)) { setError('Ingresa un email válido'); return; }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) { setError('Los correos no coinciden'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (shouldUseCaptcha) {
      if (!siteKey) { setError('Clave reCAPTCHA faltante, contacte al administrador.'); return; }
      if (!recaptchaToken) { setError('Debes verificar que no eres un robot para continuar.'); return; }
    }
    const res = await register({ nombre: firstName.trim(), apellido: lastName.trim(), email, password });
    if (!res.ok) { setError(res.error || 'Ocurrió un error'); if (shouldUseCaptcha && siteKey) { try { recaptchaRef.current?.reset(); } catch {}; setRecaptchaToken(null);} return; }
    navigate('/login');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Crear cuenta</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="firstName">Nombres</label>
            <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Apellidos</label>
            <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="confirmEmail">Confirmar email</label>
            <input id="confirmEmail" type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {shouldUseCaptcha && (
            <div className="captcha-container">
              {siteKey ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                  {!recaptchaToken && (
                    <span className="captcha-error">
                      ⚠️ Debes completar la verificación de seguridad para continuar.
                    </span>
                  )}
                </div>
              ) : (
                <div className="auth-error" role="alert">Clave reCAPTCHA faltante, contacte al administrador.</div>
              )}
            </div>
          )}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={shouldUseCaptcha && !recaptchaToken}>Registrarme</button>
            <div className="auth-links">
              <span />
              <Link className="auth-link" to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

