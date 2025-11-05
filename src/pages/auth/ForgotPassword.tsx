import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { isAuthRoute } from '../../utils/isAuthRoute';
import getRecaptchaKey from '../../utils/getRecaptchaKey';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const recaptchaRef = React.useRef<ReCAPTCHA | null>(null);
  const siteKey = getRecaptchaKey();
  const location = useLocation();
  const shouldUseCaptcha = isAuthRoute(location.pathname);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    if (!email) { setError('Ingresa tu email'); return; }
    if (!/.+@.+\..+/.test(email)) { setError('Ingresa un email válido'); return; }
    if (shouldUseCaptcha) {
      if (!siteKey) { setError('Clave reCAPTCHA faltante, contacte al administrador.'); return; }
      if (!recaptchaToken) { setError('Debes verificar que no eres un robot para continuar.'); return; }
    }
    try {
      const raw = localStorage.getItem('fixsy_users');
      const users = raw ? (JSON.parse(raw) as Array<{ email: string }>) : [];
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) { setError('No existe un usuario con ese email'); return; }
      setMsg('Se envió un enlace de recuperación a tu correo');
    } catch {
      setError('Ocurrió un problema, inténtalo más tarde');
      if (shouldUseCaptcha && siteKey) {
        try { recaptchaRef.current?.reset(); } catch {}
        setRecaptchaToken(null);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Recuperar contraseña</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
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
                    <div className="auth-error" role="alert">Por seguridad debes verificar que no eres un robot.</div>
                  )}
                </div>
              ) : (
                <div className="auth-error" role="alert">Clave reCAPTCHA faltante, contacte al administrador.</div>
              )}
            </div>
          )}
          {error && <div className="auth-error" role="alert">{error}</div>}
          {msg && <div className="auth-success" role="status">{msg}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={shouldUseCaptcha && !recaptchaToken}>Enviar enlace</button>
            <div className="auth-links">
              <Link className="auth-link" to="/login">Volver a Iniciar sesión</Link>
              <Link className="auth-link" to="/register">Crear cuenta</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
