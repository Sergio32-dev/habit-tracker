import { useState, useEffect } from 'react';
import HabitList from './components/HabitList';
import AddHabitForm from './components/AddHabitForm';
import StatsPanel from './components/StatsPanel';
import Header from './components/Header';
import PremiumBanner from './components/PremiumBanner';
import PremiumModal from './components/PremiumModal';
import YooKassaPayment from './components/YooKassaPayment';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import { usePremium } from './contexts/PremiumContext';
import { useAuth } from './contexts/AuthContext';
import { yookassaService } from './services/yookassaService';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [habits, setHabits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { isPremium, canAddHabit, activatePremium } = usePremium();

  // Обработка возврата с оплаты
  useEffect(() => {
    const checkPaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id');
      
      if (paymentId) {
        try {
          const result = await yookassaService.checkPaymentStatus(paymentId);
          
          if (result.paid) {
            // Определяем план по metadata или используем сохраненный
            const savedPlan = localStorage.getItem('pendingPaymentPlan') || 'monthly';
            const days = savedPlan === 'yearly' ? 365 : 30;
            
            activatePremium(days);
            localStorage.removeItem('pendingPaymentPlan');
            
            // Убираем payment_id из URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Показываем уведомление об успехе
            alert('✅ Премиум подписка успешно активирована!');
          }
        } catch (error) {
          console.error('Ошибка проверки платежа:', error);
        }
      }
    };

    checkPaymentReturn();
  }, [activatePremium]);

  // Загрузка темы оформления
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      }
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (habits.length > 0 || localStorage.getItem('habits')) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  const addHabit = (habit) => {
    if (!canAddHabit(habits.length)) {
      setShowAddForm(false);
      setShowPremiumModal(true);
      return;
    }

    const newHabit = {
      id: Date.now(),
      name: habit.name,
      icon: habit.icon || '⭐',
      color: habit.color || '#6366f1',
      createdAt: new Date().toISOString(),
      completedDates: [],
      streak: 0,
      bestStreak: 0
    };
    setHabits([...habits, newHabit]);
    setShowAddForm(false);
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleHabit = (id) => {
    const today = new Date().toDateString();
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(today);
        let newCompletedDates;
        let newStreak = habit.streak;
        let newBestStreak = habit.bestStreak;

        if (isCompleted) {
          newCompletedDates = habit.completedDates.filter(date => date !== today);
          newStreak = calculateStreak(newCompletedDates);
        } else {
          newCompletedDates = [...habit.completedDates, today];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (habit.completedDates.includes(yesterday.toDateString())) {
            newStreak = habit.streak + 1;
          } else {
            newStreak = 1;
          }
          if (newStreak > habit.bestStreak) {
            newBestStreak = newStreak;
          }
        }

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
          bestStreak: newBestStreak
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (completedDates) => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates
      .map(date => new Date(date))
      .sort((a, b) => b - a);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const found = sortedDates.find(d => 
        d.getTime() === checkDate.getTime()
      );
      
      if (found) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handlePremiumUpgrade = () => {
    setShowPremiumModal(true);
  };

  const handleSubscribe = (planType) => {
    setSelectedPlan(planType);
    setShowPremiumModal(false);
    setShowPaymentModal(true);
    // Сохраняем план для проверки после возврата
    localStorage.setItem('pendingPaymentPlan', planType);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
  };

  // Показываем экран авторизации если не авторизован
  if (loading) {
    return <div className="app loading">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="app">
      <Header 
        onAdminClick={() => setShowAdminPanel(true)}
      />
      <PremiumBanner onUpgrade={handlePremiumUpgrade} />
      <StatsPanel habits={habits} />
      <HabitList
        habits={habits}
        onToggle={toggleHabit}
        onDelete={deleteHabit}
      />
      {showAddForm && (
        <AddHabitForm
          onAdd={addHabit}
          onClose={() => setShowAddForm(false)}
          canAdd={canAddHabit(habits.length)}
        />
      )}
      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          onSubscribe={handleSubscribe}
        />
      )}
      {showPaymentModal && (
        <YooKassaPayment
          planType={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
        />
      )}
      <button
        className="fab"
        onClick={() => setShowAddForm(true)}
        aria-label="Добавить привычку"
      >
        <span className="fab-icon">+</span>
      </button>
    </div>
  );
}

export default App;
