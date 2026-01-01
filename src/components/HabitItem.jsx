import { Trash2, Flame } from 'lucide-react';
import './HabitItem.css';

function HabitItem({ habit, onToggle, onDelete }) {
  const today = new Date().toDateString();
  const isCompleted = habit.completedDates.includes(today);
  const completionRate = habit.completedDates.length > 0
    ? Math.min(100, Math.round((habit.completedDates.length / 30) * 100))
    : 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Удалить привычку "${habit.name}"?`)) {
      onDelete(habit.id);
    }
  };

  return (
    <div className={`habit-item ${isCompleted ? 'completed' : ''}`}>
      <div className="habit-content" onClick={() => onToggle(habit.id)}>
        <div 
          className="habit-checkbox"
          style={{ 
            background: isCompleted ? habit.color : 'transparent',
            borderColor: habit.color
          }}
        >
          {isCompleted && <span className="checkmark">✓</span>}
        </div>
        
        <div className="habit-info">
          <div className="habit-header">
            <span className="habit-icon">{habit.icon}</span>
            <h3 className="habit-name">{habit.name}</h3>
          </div>
          
          <div className="habit-stats">
            {habit.streak > 0 && (
              <div className="streak-badge">
                <Flame size={14} />
                <span>{habit.streak} дней</span>
              </div>
            )}
            {habit.bestStreak > 0 && (
              <div className="best-streak">
                Лучшая серия: {habit.bestStreak}
              </div>
            )}
          </div>
          
          <div className="habit-progress">
            <div 
              className="habit-progress-bar"
              style={{ 
                width: `${completionRate}%`,
                background: habit.color
              }}
            />
          </div>
        </div>
      </div>
      
      <button
        className="habit-delete"
        onClick={handleDelete}
        aria-label="Удалить привычку"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default HabitItem;

