import { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { yookassaService } from '../services/yookassaService';
import './PaymentModal.css';

function YooKassaPayment({ planType, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'redirect' | 'error'
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const plans = {
    monthly: { price: 299, period: 'месяц', days: 30 },
    yearly: { price: 1999, period: 'год', days: 365 }
  };

  const currentPlan = plans[planType];

  useEffect(() => {
    // Загружаем сохраненный email из localStorage
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handlePayment = async () => {
    if (!email.trim()) {
      setError('Пожалуйста, укажите email');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('redirect');

    try {
      // Создаем платеж через ЮKassa
      const paymentResult = await yookassaService.createPayment(planType, {
        email: email.trim(),
        phone: phone.trim(),
        userId: localStorage.getItem('userId') || 'user_' + Date.now()
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Сохраняем email
        localStorage.setItem('userEmail', email.trim());
        
        // Редирект на страницу оплаты ЮKassa
        window.location.href = paymentResult.paymentUrl;
      } else {
        throw new Error('Не получен URL для оплаты');
      }
    } catch (err) {
      console.error('Ошибка платежа:', err);
      setError(err.message || 'Ошибка при создании платежа. Попробуйте еще раз.');
      setStep('form');
      setLoading(false);
    }
  };

  const formatPhone = (value) => {
    // Форматирование телефона: +7 (XXX) XXX-XX-XX
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('8')) {
      const formatted = '+7 ' + numbers.slice(1, 4) + ' ' + numbers.slice(4, 7) + '-' + numbers.slice(7, 9) + '-' + numbers.slice(9, 11);
      return formatted.trim();
    }
    if (numbers.startsWith('7')) {
      const formatted = '+7 ' + numbers.slice(1, 4) + ' ' + numbers.slice(4, 7) + '-' + numbers.slice(7, 9) + '-' + numbers.slice(9, 11);
      return formatted.trim();
    }
    return value;
  };

  if (step === 'redirect') {
    return (
      <div className="modal-overlay payment-modal-overlay">
        <div className="payment-modal processing">
          <div className="payment-processing">
            <div className="spinner"></div>
            <h3>Перенаправление на оплату...</h3>
            <p>Вы будете перенаправлены на безопасную страницу оплаты ЮKassa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <CreditCard size={32} />
          <h2>Оплата через ЮKassa</h2>
          <p>Безопасная оплата банковской картой</p>
        </div>

        <div className="payment-summary">
          <div className="payment-plan">
            <span>Подписка: Премиум {currentPlan.period === 'месяц' ? '(1 месяц)' : '(1 год)'}</span>
            <span className="payment-price">{currentPlan.price}₽</span>
          </div>
          {planType === 'yearly' && (
            <div className="payment-savings-badge">
              💰 Экономия 599₽ при оплате за год!
            </div>
          )}
        </div>

        <div className="payment-form-fields">
          <div className="form-group">
            <label htmlFor="payment-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="payment-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment-phone">Телефон (необязательно)</label>
            <input
              id="payment-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        {error && (
          <div className="payment-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="payment-info">
          <div className="payment-note">
            <Lock size={16} />
            <span>Все платежи защищены SSL шифрованием. Обработка через ЮKassa (Яндекс.Касса)</span>
          </div>
          <div className="payment-test-note">
            <span>🧪 Тестовый режим: используйте тестовую карту <strong>5555 5555 5555 4444</strong></span>
          </div>
          <div className="payment-methods">
            <span>Принимаем:</span>
            <div className="payment-icons">
              <span>💳</span>
              <span>VISA</span>
              <span>Mastercard</span>
              <span>МИР</span>
            </div>
          </div>
        </div>

        <div className="payment-modal-actions">
          <button
            className="payment-btn"
            onClick={handlePayment}
            disabled={loading || !email.trim()}
          >
            {loading ? 'Обработка...' : `Оплатить ${currentPlan.price}₽`}
          </button>
          <button className="payment-cancel" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default YooKassaPayment;
