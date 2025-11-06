import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { isAuthRoute } from '../../utils/isAuthRoute';
import getRecaptchaKey from '../../utils/getRecaptchaKey';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const recaptchaRef = React.useRef<ReCAPTCHA | null>(null);
  const siteKey = getRecaptchaKey();
  const shouldUseCaptchaRoute = isAuthRoute(location.pathname);
  const shouldShowCaptcha = shouldUseCaptchaRoute && failedAttempts >= 2;

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
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) { setError('Ingresa un email válido'); return; }
    if (shouldShowCaptcha) {
      if (!siteKey) { setError('Clave reCAPTCHA faltante, contacte al administrador.'); return; }
      if (!recaptchaToken) { setError('Por seguridad debes verificar que no eres un robot.'); return; }
    }
    const ok = await login(email, password);
    if (!ok) {
      setError('Credenciales incorrectas');
      setFailedAttempts(prev => prev + 1);
      if (shouldShowCaptcha && siteKey) {
        try { recaptchaRef.current?.reset(); } catch {}
        setRecaptchaToken(null);
      }
      return;
    }
    // Control de acceso por estado (Bloqueado/Suspendido) desde fixsyUsers
    try {
      const usersRaw = localStorage.getItem('fixsyUsers');
      const list = usersRaw ? JSON.parse(usersRaw) : [];
      const found = Array.isArray(list) ? list.find((u: any) => (u?.email || '').toLowerCase() === email.toLowerCase()) : null;
      if (found) {
        const status = String(found.status || 'Activo');
        if (status === 'Bloqueado') {
          setError('Tu cuenta está bloqueada. Contacta con soporte.');
          return;
        }
        if (status === 'Suspendido') {
          const until = found.suspensionHasta ? new Date(found.suspensionHasta) : null;
          if (until && new Date() < until) {
            setError(`Tu cuenta está suspendida hasta ${until.toLocaleDateString()}`);
            return;
          } else {
            // Reactivar si ya expiró
            found.status = 'Activo';
            found.suspensionHasta = '';
            const next = list.map((u: any) => u.email === found.email ? found : u);
            localStorage.setItem('fixsyUsers', JSON.stringify(next));
          }
        }
      }
    } catch {}

    setFailedAttempts(0);
    try {
      const raw = localStorage.getItem('fixsy_current_user');
      const s = raw ? JSON.parse(raw) : null;
      const role = s?.role;
      if (role === 'Admin') { navigate('/dashboard/admin'); return; }
      if (role === 'Soporte') { navigate('/dashboard/support'); return; }
    } catch {}
    navigate('/');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Iniciar sesión</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
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
                    <div className="auth-error" role="alert">Por seguridad debes verificar que no eres un robot.</div>
                  )}
                </div>
              ) : (
                <div className="auth-error" role="alert">Clave reCAPTCHA faltante, contacte al administrador.</div>
              )}
            </div>
          )}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={shouldShowCaptcha && !recaptchaToken}>Iniciar sesión</button>
            <div className="auth-links">
              <Link className="auth-link" to="/forgot-password">¿Olvidaste tu contraseña?</Link>
              <Link className="auth-link" to="/register">Crear cuenta</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
