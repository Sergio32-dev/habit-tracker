import { Calendar, Crown, User, Settings, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header({ onAdminClick }) {
  const { isPremium } = usePremium();
  const { user, logout, isAdmin } = useAuth();
  const today = format(new Date(), 'EEEE, d MMMM');

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <div className="header-title-row">
            <h1>Мои Привычки</h1>
            {isPremium && (
              <div className="premium-badge-header">
                <Crown size={18} />
                <span>Премиум</span>
              </div>
            )}
          </div>
          <p className="header-date">
            <Calendar size={16} />
            {today}
          </p>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <User size={18} />
            <span>{user?.username}</span>
            {isAdmin() && (
              <span className="admin-badge">Админ</span>
            )}
          </div>
          {isAdmin() && (
            <button 
              className="header-btn admin-btn" 
              onClick={onAdminClick} 
              title="Панель администратора"
            >
              <Settings size={18} />
              <span className="btn-text">Настройки</span>
            </button>
          )}
          <button 
            className="header-btn logout-btn" 
            onClick={logout} 
            title="Выйти"
          >
            <LogOut size={18} />
            <span className="btn-text">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
