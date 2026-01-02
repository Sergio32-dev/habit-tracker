import { useState } from 'react';
import { CreditCard, Lock, Check } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { usePremium } from '../contexts/PremiumContext';
import './PaymentModal.css';

function PaymentModal({ planType, onClose, onSuccess }) {
  const { activatePremium } = usePremium();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'

  const plans = {
    monthly: { price: 299, period: 'месяц' },
    yearly: { price: 1999, period: 'год' }
  };

  const currentPlan = plans[planType];

  const handlePayment = async () => {
    setLoading(true);
    setStep('processing');

    try {
      // Симуляция платежа
      const result = await paymentService.processPayment(planType);
      
      if (result.success) {
        activatePremium(result.days);
        setStep('success');
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Ошибка платежа:', error);
      setStep('form');
      alert('Ошибка при обработке платежа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="modal-overlay payment-modal-overlay">
        <div className="payment-modal processing">
          <div className="payment-processing">
            <div className="spinner"></div>
            <h3>Обработка платежа...</h3>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="modal-overlay payment-modal-overlay">
        <div className="payment-modal success">
          <div className="payment-success">
            <div className="success-icon">
              <Check size={64} />
            </div>
            <h3>Платеж успешен!</h3>
            <p>Премиум подписка активирована</p>
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
          <h2>Оформление подписки</h2>
          <p>Безопасная оплата</p>
        </div>

        <div className="payment-summary">
          <div className="payment-plan">
            <span>Подписка: Премиум</span>
            <span className="payment-price">{currentPlan.price}₽ / {currentPlan.period}</span>
          </div>
        </div>

        <div className="payment-info">
          <div className="payment-note">
            <Lock size={16} />
            <span>Все платежи защищены SSL шифрованием</span>
          </div>
          <p className="payment-disclaimer">
            Это демо-версия. В реальном приложении здесь будет форма ввода карты через Stripe.
            Для тестирования нажмите "Оплатить", платеж будет симулирован.
          </p>
        </div>

        <div className="payment-modal-actions">
          <button
            className="payment-btn"
            onClick={handlePayment}
            disabled={loading}
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

export default PaymentModal;


