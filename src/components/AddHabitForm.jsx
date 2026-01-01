import { useState } from 'react';
import { X } from 'lucide-react';
import './AddHabitForm.css';

const ICONS = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🍎', '😴', '🎯', '📝', '🎨', '🎵', '🌱', '🔥', '💡'];
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#14b8a6', '#f97316'
];

function AddHabitForm({ onAdd, onClose, canAdd }) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor
      });
      setName('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новая привычка</h2>
          <button className="modal-close" onClick={onClose} aria-label="Закрыть">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="habit-form">
          <div className="form-group">
            <label htmlFor="habit-name">Название привычки</label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Пить воду, Читать книгу..."
              autoFocus
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label>Иконка</label>
            <div className="icon-selector">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Цвет</label>
            <div className="color-selector">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Выбрать цвет ${color}`}
                />
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHabitForm;

