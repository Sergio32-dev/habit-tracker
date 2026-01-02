/**
 * API endpoint для входа пользователей
 * POST /api/auth/login
 */

const { getConnection, sql } = require('../db/connection');
const bcrypt = require('bcrypt');

module.exports = async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Логин и пароль обязательны' 
      });
    }

    const pool = await getConnection();

    // Поиск пользователя
    const result = await pool.request()
      .input('username', sql.NVarChar, username.toLowerCase())
      .query(`
        SELECT id, username, email, password_hash, role, is_active, last_login
        FROM users 
        WHERE LOWER(username) = @username AND is_active = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Неверный логин или пароль' 
      });
    }

    const user = result.recordset[0];

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Неверный логин или пароль' 
      });
    }

    // Обновление last_login
    await pool.request()
      .input('userId', sql.Int, user.id)
      .query('UPDATE users SET last_login = GETDATE() WHERE id = @userId');

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


