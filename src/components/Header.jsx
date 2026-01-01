import { Calendar, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { usePremium } from '../contexts/PremiumContext';
import './Header.css';

function Header({ onPremiumClick }) {
  const { isPremium } = usePremium();
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
      </div>
    </header>
  );
}

export default Header;
