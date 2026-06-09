import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function LoginPage() {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const { login, loginError, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard', { replace: true });
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">PET</h1>
        <p className="login-subtitle">No-Code App Builder</p>

        <label className="login-field">
          <span className="login-label">Benutzer</span>
          <input className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>

        <label className="login-field">
          <span className="login-label">Passwort</span>
          <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {loginError && <p className="login-error">{loginError}</p>}

        <button className="login-btn" type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
