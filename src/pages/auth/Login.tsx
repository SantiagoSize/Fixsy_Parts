import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Estado para mensaje de éxito
  const [loading, setLoading] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redireccionar basado en rol cuando está autenticado
  // No confiamos en useEffect para el redirect de login para evitar condiciones de carrera

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones Previas
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // 1. Esperar login y obtener usuario
      const loggedUser = await login(email, password);

      setSuccess('Inicio de sesión correcto.');

      // Breve retraso para que el usuario lea el mensaje
      setTimeout(() => {
        // 2. Navegar inmediatamente segun rol
        const role = String(loggedUser.role).toLowerCase();

        if (role === "admin") {
          navigate('/dashboard/admin', { replace: true });
        } else if (role === "soporte") {
          navigate('/dashboard/support', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1000);

    } catch (err: any) {
      console.error("Error Login:", err);

      // Traducción de Errores (401, 403, 500)
      let msg = 'Ocurrió un error al conectar con el servidor.'; // Default requested by user

      // Si el error viene de Axios
      if (err.response) {
        if (err.response.status === 401) msg = 'Correo o contraseña incorrectos.';
        else if (err.response.status === 403) msg = 'Cuenta bloqueada o inactiva.';
        // else keep default
      } else if (err.message) {
        // Fallback si AuthContext lanza Error con mensaje
        if (err.message.includes('401')) msg = 'Correo o contraseña incorrectos.';
        else if (err.message.includes('403')) msg = 'Cuenta bloqueada o inactiva.';
        else msg = err.message;
      }

      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Iniciar sesion</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Contrasena</label>
            <input
              type="password"
              className="form-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
          <div className="auth-actions">
            <button type="submit" className="btn-primary form-button" disabled={loading}>
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
            <div className="auth-links">
              <a className="auth-link" href="/register">Crear cuenta</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
