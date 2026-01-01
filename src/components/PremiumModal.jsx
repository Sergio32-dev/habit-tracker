import { useState } from 'react';
import { Crown, Check, X, Zap, Cloud, BarChart3, Bell, Palette, Award } from 'lucide-react';
import { usePremium } from '../contexts/PremiumContext';
import './PremiumModal.css';

const FEATURES = [
  { icon: Zap, text: 'Неограниченное количество привычек' },
  { icon: Cloud, text: 'Облачная синхронизация' },
  { icon: BarChart3, text: 'Расширенная аналитика и графики' },
  { icon: Bell, text: 'Напоминания и уведомления' },
  { icon: Palette, text: 'Темы оформления' },
  { icon: Award, text: 'Достижения и награды' }
];

function PremiumModal({ onClose, onSubscribe }) {
  const { isPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = {
    monthly: { price: 299, period: 'месяц', discount: null },
    yearly: { price: 1999, period: 'год', discount: '44%', originalPrice: 3588 }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="modal-overlay premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <button className="premium-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="premium-modal-header">
          <div className="premium-crown-icon">
            <Crown size={48} />
          </div>
          <h2>Премиум подписка</h2>
          <p>Откройте все возможности приложения</p>
        </div>

        <div className="premium-features">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="premium-feature">
                <div className="premium-feature-icon">
                  <Icon size={20} />
                </div>
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>

        <div className="premium-plans">
          <div className="premium-plan-tabs">
            <button
              className={`premium-plan-tab ${selectedPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              Месяц
            </button>
            <button
              className={`premium-plan-tab ${selectedPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('yearly')}
            >
              Год {currentPlan.discount && <span className="discount-badge">-{currentPlan.discount}</span>}
            </button>
          </div>

          <div className="premium-plan-price">
            <div className="price-amount">
              {currentPlan.originalPrice && (
                <span className="original-price">{Math.round(currentPlan.originalPrice / 12)}₽</span>
              )}
              <span className="current-price">{currentPlan.price}₽</span>
              <span className="price-period">/{currentPlan.period}</span>
            </div>
            {selectedPlan === 'yearly' && (
              <p className="price-savings">Экономия {currentPlan.originalPrice - currentPlan.price}₽ в год!</p>
            )}
          </div>
        </div>

        <div className="premium-modal-actions">
          <button
            className="premium-subscribe-btn"
            onClick={() => onSubscribe(selectedPlan)}
            disabled={isPremium}
          >
            {isPremium ? 'У вас уже есть премиум' : `Оформить подписку - ${currentPlan.price}₽/${currentPlan.period === 'месяц' ? 'мес' : 'год'}`}
          </button>
          <p className="premium-note">
            Подписка автоматически продлевается. Вы можете отменить в любой момент.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PremiumModal;

