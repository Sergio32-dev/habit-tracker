// setup-database.js
const { pool } = require('./lib/db');

async function setupDatabase() {
  try {
    console.log('🔧 Настройка базы данных...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Таблица users создана/проверена');
    
    // Добавим тестового админа если нет пользователей
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO users (email, name, role, password_hash) 
        VALUES ($1, $2, $3, $4)
      `, ['admin@example.com', 'Администратор', 'admin', 'hashed_password_here']);
      console.log('✅ Тестовый админ добавлен');
    }
    
    console.log('🎉 База данных готова!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка настройки БД:', error);
    process.exit(1);
  }
}

setupDatabase();