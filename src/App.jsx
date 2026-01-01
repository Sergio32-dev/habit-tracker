import { useState, useEffect } from 'react';
import HabitList from './components/HabitList';
import AddHabitForm from './components/AddHabitForm';
import StatsPanel from './components/StatsPanel';
import Header from './components/Header';
import PremiumBanner from './components/PremiumBanner';
import PremiumModal from './components/PremiumModal';
import YooKassaPayment from './components/YooKassaPayment';
import { usePremium } from './contexts/PremiumContext';
import './App.css';

function App() {
  const [habits, setHabits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { isPremium, canAddHabit } = usePremium();

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
          // Убираем отметку
          newCompletedDates = habit.completedDates.filter(date => date !== today);
          // Пересчитываем streak
          newStreak = calculateStreak(newCompletedDates);
        } else {
          // Добавляем отметку
          newCompletedDates = [...habit.completedDates, today];
          // Проверяем, продолжается ли streak
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
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="app">
      <Header />
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
