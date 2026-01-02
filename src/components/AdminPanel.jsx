import { useState, useEffect } from 'react';
import { Settings, Palette, DollarSign, X, Save, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminUsersPanel from './AdminUsersPanel';
import './AdminPanel.css';

function AdminPanel({ onClose }) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [prices, setPrices] = useState({
    monthly: 299,
    yearly: 1999
  });
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Загрузка сохраненных настроек
    const savedPrices = localStorage.getItem('adminPrices');
    const savedTheme = localStorage.getItem('selectedTheme');
    
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Применение темы
    document.documentElement.setAttribute('data-theme', selectedTheme);
  }, [selectedTheme]);

  const handleSavePrices = () => {
    localStorage.setItem('adminPrices', JSON.stringify(prices));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveTheme = () => {
    localStorage.setItem('selectedTheme', selectedTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAdmin()) {
    return null;
  }

  const themes = [
    { id: 'default', name: 'По умолчанию', colors: { primary: '#6366f1', bg: '#ffffff' } },
    { id: 'dark', name: 'Темная', colors: { primary: '#8b5cf6', bg: '#1a1a1a' } },
    { id: 'ocean', name: 'Океан', colors: { primary: '#06b6d4', bg: '#f0fdfa' } },
    { id: 'sunset', name: 'Закат', colors: { primary: '#f59e0b', bg: '#fffbeb' } },
    { id: 'forest', name: 'Лес', colors: { primary: '#10b981', bg: '#f0fdf4' } },
    { id: 'rose', name: 'Роза', colors: { primary: '#ec4899', bg: '#fdf2f8' } }
  ];

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <Settings size={24} />
          <h2>Панель администратора</h2>
          <button className="admin-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Пользователи
          </button>
          <button
            className={`admin-tab ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
          >
            <Palette size={18} />
            Дизайн
          </button>
          <button
            className={`admin-tab ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            <DollarSign size={18} />
            Цены
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'users' && (
            <AdminUsersPanel />
          )}

          {activeTab === 'design' && (
            <div className="admin-section">
              <h3>Выберите тему оформления</h3>
              <div className="themes-grid">
                {themes.map(theme => (
                  <div
                    key={theme.id}
                    className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div
                      className="theme-preview"
                      style={{
                        background: theme.colors.bg,
                        borderColor: theme.colors.primary
                      }}
                    >
                      <div
                        className="theme-color-dot"
                        style={{ background: theme.colors.primary }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                ))}
              </div>
              <button className="admin-save-btn" onClick={handleSaveTheme}>
                <Save size={18} />
                Сохранить тему
              </button>
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="admin-section">
              <h3>Настройка цен</h3>
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Месячная подписка (₽)</label>
                  <input
                    type="number"
                    value={prices.monthly}
                    onChange={(e) => setPrices({ ...prices, monthly: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="price-input-group">
                  <label>Годовая подписка (₽)</label>
                  <input
                    type="number"
                    value={prices.yearly}
                    onChange={(e) => setPrices({ ...prices, yearly: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              <button className="admin-save-btn" onClick={handleSavePrices}>
                <Save size={18} />
                Сохранить цены
              </button>
            </div>
          )}

          {saved && (
            <div className="admin-saved-message">
              ✓ Сохранено!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

