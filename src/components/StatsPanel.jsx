import { TrendingUp, Flame, Target } from 'lucide-react';
import './StatsPanel.css';

function StatsPanel({ habits }) {
  const totalHabits = habits.length;
  const today = new Date().toDateString();
  const completedToday = habits.filter(h => 
    h.completedDates.includes(today)
  ).length;
  const completionRate = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.bestStreak))
    : 0;

  if (totalHabits === 0) {
    return (
      <div className="stats-panel empty">
        <p>Добавьте первую привычку, чтобы начать отслеживание!</p>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <Target color="#10b981" size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Сегодня</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <Flame color="#ef4444" size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalStreak}</div>
          <div className="stat-label">Активные серии</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
          <TrendingUp color="#6366f1" size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{bestStreak}</div>
          <div className="stat-label">Лучшая серия</div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;

