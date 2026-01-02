import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, Crown, User, Loader } from 'lucide-react';
import './AdminUsersPanel.css';

function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных');
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Никогда';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <Loader size={32} className="spinner" />
        <p>Загрузка пользователей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-error">
        <p>❌ Ошибка: {error}</p>
        <button onClick={loadUsers} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="admin-users-panel">
      <div className="admin-users-header">
        <Users size={20} />
        <h3>Зарегистрированные пользователи</h3>
        <span className="users-count">{users.length}</span>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Админов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
          <div className="stat-label">Пользователей</div>
        </div>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Нет зарегистрированных пользователей</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-main-info">
                <div className="user-avatar">
                  {user.role === 'admin' ? (
                    <Crown size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name-row">
                    <span className="user-name">{user.username}</span>
                    {user.role === 'admin' && (
                      <span className="user-role-badge admin">Админ</span>
                    )}
                    {user.role === 'user' && (
                      <span className="user-role-badge user">Пользователь</span>
                    )}
                  </div>
                  <div className="user-email">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="user-stats">
                <div className="user-stat">
                  <span className="stat-label">Привычек:</span>
                  <span className="stat-value">{user.habitsCount || 0}</span>
                </div>
                <div className="user-stat">
                  <span className="stat-label">Подписок:</span>
                  <span className="stat-value">{user.activeSubscriptions || 0}</span>
                </div>
              </div>
              <div className="user-dates">
                <div className="user-date">
                  <Calendar size={14} />
                  <span>Регистрация: {formatDate(user.createdAt)}</span>
                </div>
                {user.lastLogin && (
                  <div className="user-date">
                    <Calendar size={14} />
                    <span>Последний вход: {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={loadUsers} className="refresh-btn">
        Обновить список
      </button>
    </div>
  );
}

export default AdminUsersPanel;


