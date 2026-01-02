import { useState } from 'react';
import { LogIn, X, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

function LoginModal({ onClose, onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(username, password);
    
    if (result.success) {
      onSuccess && onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="modal-overlay login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="login-modal-header">
          <LogIn size={32} />
          <h2>Вход в систему</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              Логин
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin или user"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-hint">
            <p><strong>Тестовые аккаунты:</strong></p>
            <p>Админ: <code>admin</code> / <code>admin123</code></p>
            <p>Пользователь: <code>user</code> / <code>user123</code></p>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || !username || !password}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;

