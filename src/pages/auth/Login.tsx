import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { isAuthRoute } from '../../utils/isAuthRoute';
import getRecaptchaKey from '../../utils/getRecaptchaKey';
import Alert from '../../components/Alert';
import { STORAGE_KEYS } from '../../utils/storageKeys';
import './Auth.css';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const recaptchaRef = React.useRef<ReCAPTCHA | null>(null);
  const siteKey = getRecaptchaKey();
  const shouldUseCaptchaRoute = isAuthRoute(location.pathname);
  const shouldShowCaptcha = shouldUseCaptchaRoute && failedAttempts >= 2;

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('fixsy_login_failed_attempts');
      if (raw) setFailedAttempts(parseInt(raw, 10) || 0);
    } catch {}
  }, []);
  React.useEffect(() => {
    try { sessionStorage.setItem('fixsy_login_failed_attempts', String(failedAttempts)); } catch {}
  }, [failedAttempts]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) { setError('Ingresa un email valido'); setLoading(false); return; }
    if (shouldShowCaptcha) {
      if (!siteKey) { setError('Clave reCAPTCHA faltante, contacte al administrador.'); setLoading(false); return; }
      if (!recaptchaToken) { setError('Por seguridad debes verificar que no eres un robot.'); setLoading(false); return; }
    }
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error || 'Credenciales invalidas');
      setFailedAttempts(prev => prev + 1);
      if (shouldShowCaptcha && siteKey) {
        try { recaptchaRef.current?.reset(); } catch {}
        setRecaptchaToken(null);
      }
      setLoading(false);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.mgmtUsers);
      const list = raw ? JSON.parse(raw) : [];
      const found = Array.isArray(list) ? list.find((u: any) => (u?.email || '').toLowerCase() === email.toLowerCase()) : null;
      if (found) {
        const status = String(found.status || 'Activo');
        if (status === 'Bloqueado') {
          setError('Tu cuenta esta bloqueada. Contacta con soporte.');
          setLoading(false);
          return;
        }
        if (status === 'Suspendido') {
          const until = found.suspensionHasta ? new Date(found.suspensionHasta) : null;
          if (until && new Date() < until) {
            setError(`Tu cuenta esta suspendida hasta ${until.toLocaleDateString()}`);
            setLoading(false);
            return;
          } else {
            found.status = 'Activo';
            found.suspensionHasta = '';
            const next = list.map((u: any) => u.email === found.email ? found : u);
            localStorage.setItem(STORAGE_KEYS.mgmtUsers, JSON.stringify(next));
          }
        }
      }
    } catch {}

    setFailedAttempts(0);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
      const s = raw ? JSON.parse(raw) : null;
      const role = s?.role;
      if (role === 'Admin') { navigate('/dashboard/admin'); setLoading(false); return; }
      if (role === 'Soporte') { navigate('/dashboard/support'); setLoading(false); return; }
    } catch {}
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Iniciar sesion</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Contrasena</label>
            <input id="password" className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {shouldShowCaptcha && (
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
                    <Alert type="error" message="Por seguridad debes verificar que no eres un robot." />
                  )}
                </div>
              ) : (
                <Alert type="error" message="Clave reCAPTCHA faltante, contacte al administrador." />
              )}
            </div>
          )}
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary form-button" disabled={loading || (shouldShowCaptcha && !recaptchaToken)}>
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
            <div className="auth-links">
              <Link className="auth-link" to="/forgot-password">?Olvidaste tu contrasena?</Link>
              <Link className="auth-link" to="/register">Crear cuenta</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
