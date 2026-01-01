import { createContext, useContext, useState, useEffect } from 'react';

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState(null);

  useEffect(() => {
    // Загрузка статуса премиум из localStorage
    const savedPremium = localStorage.getItem('premium');
    const savedPremiumUntil = localStorage.getItem('premiumUntil');
    
    if (savedPremium === 'true' && savedPremiumUntil) {
      const untilDate = new Date(savedPremiumUntil);
      if (untilDate > new Date()) {
        setIsPremium(true);
        setPremiumUntil(untilDate);
      } else {
        // Премиум истек
        localStorage.removeItem('premium');
        localStorage.removeItem('premiumUntil');
      }
    }
  }, []);

  const activatePremium = (days = 30) => {
    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + days);
    setIsPremium(true);
    setPremiumUntil(untilDate);
    localStorage.setItem('premium', 'true');
    localStorage.setItem('premiumUntil', untilDate.toISOString());
  };

  const deactivatePremium = () => {
    setIsPremium(false);
    setPremiumUntil(null);
    localStorage.removeItem('premium');
    localStorage.removeItem('premiumUntil');
  };

  const FREE_HABIT_LIMIT = 5;
  const canAddHabit = (currentCount) => {
    return isPremium || currentCount < FREE_HABIT_LIMIT;
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        premiumUntil,
        activatePremium,
        deactivatePremium,
        canAddHabit,
        FREE_HABIT_LIMIT
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

