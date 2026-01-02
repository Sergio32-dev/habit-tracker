import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔄 Запускаем загрузку пользователей...');
    
    // Используем абсолютный URL с правильным портом
    fetch('http://localhost:5173/api/admin/users')
      .then(response => {
        console.log('📡 Статус ответа:', response.status);
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📊 Получены данные:', data);
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          throw new Error('Неправильный формат ответа');
        }
      })
      .catch(err => {
        console.error('❌ Ошибка загрузки:', err);
        setError(err.message);
        // Тестовые данные на случай ошибки
        setUsers([
          {id: 1, name: 'Администратор', email: 'admin@test.com', phone: '+79990000000', role: 'admin'},
          {id: 2, name: 'Пользователь', email: 'user@test.com', phone: '+79991234567', role: 'user'}
        ]);
      })
      .finally(() => {
        console.log('✅ Загрузка завершена');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>👑 Панель администратора</h1>
      <p>Порт: <strong>5173</strong></p>
      
      {error && (
        <div style={{ background: '#fee', color: '#900', padding: '10px', margin: '10px 0' }}>
          ⚠️ {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка пользователей...</p>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            margin: '20px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <div>
          <h2>Пользователи ({users.length})</h2>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Имя</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Телефон</th>
                <th style={{ padding: '10px' }}>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '10px' }}>{user.id}</td>
                  <td style={{ padding: '10px' }}>{user.name}</td>
                  <td style={{ padding: '10px' }}>{user.email}</td>
                  <td style={{ padding: '10px' }}>{user.phone}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: user.role === 'admin' ? '#ef4444' : '#10b981',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          🔄 Обновить страницу
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}