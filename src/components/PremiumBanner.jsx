import { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { usePremium } from '../contexts/PremiumContext';
import './PremiumBanner.css';

function PremiumBanner({ onUpgrade }) {
  const { isPremium } = usePremium();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('premiumBannerDismissed') === 'true';
  });

  if (isPremium || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('premiumBannerDismissed', 'true');
  };

  return (
    <div className="premium-banner">
      <div className="premium-banner-content">
        <div className="premium-banner-icon">
          <Crown size={24} />
        </div>
        <div className="premium-banner-text">
          <h3>Разблокируйте все возможности!</h3>
          <p>Неограниченное количество привычек, синхронизация, аналитика</p>
        </div>
        <button className="premium-banner-btn" onClick={onUpgrade}>
          Премиум
        </button>
        <button className="premium-banner-close" onClick={handleDismiss}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default PremiumBanner;

