import HabitItem from './HabitItem';
import './HabitList.css';

function HabitList({ habits, onToggle, onDelete }) {
  if (habits.length === 0) {
    return (
      <div className="habit-list empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>Нет привычек</h2>
          <p>Нажмите кнопку "+" внизу, чтобы добавить первую привычку</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-list">
      {habits.map(habit => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default HabitList;

