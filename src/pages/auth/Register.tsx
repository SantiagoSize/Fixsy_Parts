import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { isAuthRoute } from '../../utils/isAuthRoute';
import getRecaptchaKey from '../../utils/getRecaptchaKey';
import Alert from '../../components/Alert';
import './Auth.css';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [confirmEmail, setConfirmEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const recaptchaRef = React.useRef<ReCAPTCHA | null>(null);
  const siteKey = getRecaptchaKey();
  const shouldUseCaptcha = isAuthRoute(location.pathname);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirm) {
      setError('Completa todos los campos');
      setLoading(false);
      return;
    }
    if (!/.+@.+\..+/.test(email)) { setError('Ingresa un email valido'); setLoading(false); return; }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) { setError('Los correos no coinciden'); setLoading(false); return; }
    if (password.length < 8) { setError('La contrasena debe tener al menos 8 caracteres'); setLoading(false); return; }
    if (password !== confirm) { setError('Las contrasenas no coinciden'); setLoading(false); return; }
    if (shouldUseCaptcha) {
      if (!siteKey) { setError('Clave reCAPTCHA faltante, contacte al administrador.'); setLoading(false); return; }
      if (!recaptchaToken) { setError('Debes verificar que no eres un robot.'); setLoading(false); return; }
    }
    const res = await register({ nombre: firstName.trim(), apellido: lastName.trim(), email, password, telefono: phone });
    if (!res.ok) {
      setError(res.error || 'Ocurrio un error');
      if (shouldUseCaptcha && siteKey) { try { recaptchaRef.current?.reset(); } catch {} setRecaptchaToken(null); }
      setLoading(false);
      return;
    }
    setSuccess('Cuenta creada correctamente. Te redirigimos al login...');
    setLoading(false);
    setTimeout(() => navigate('/login'), 800);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Crear cuenta</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="firstName">Nombres</label>
            <input id="firstName" className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Apellidos</label>
            <input id="lastName" className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="confirmEmail">Confirmar email</label>
            <input id="confirmEmail" className="form-input" type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="phone">Telefono</label>
            <input id="phone" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+56 912345678" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Contrasena</label>
            <input id="password" className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirmar contrasena</label>
            <input id="confirm" className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
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
                    <Alert type="error" message="Debes completar la verificacion de seguridad para continuar." />
                  )}
                </div>
              ) : (
                <Alert type="error" message="Clave reCAPTCHA faltante, contacte al administrador." />
              )}
            </div>
          )}
          {error && <div className="form-error" role="alert">{error}</div>}
          {success && <div className="form-success" role="status">{success}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary form-button" disabled={loading || (shouldUseCaptcha && !recaptchaToken)}>
              {loading ? 'Creando...' : 'Registrarme'}
            </button>
            <div className="auth-links">
              <span />
              <Link className="auth-link" to="/login">?Ya tienes cuenta? Inicia sesion</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
