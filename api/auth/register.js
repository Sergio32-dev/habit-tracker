/**
 * API endpoint для регистрации пользователей
 * POST /api/auth/register
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
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Все поля обязательны' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'Логин должен содержать минимум 3 символа' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Некорректный email' 
      });
    }

    const pool = await getConnection();

    // Проверка существования пользователя
    const checkUser = await pool.request()
      .input('username', sql.NVarChar, username.toLowerCase())
      .input('email', sql.NVarChar, email.toLowerCase())
      .query(`
        SELECT id FROM users 
        WHERE LOWER(username) = @username OR LOWER(email) = @email
      `);

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'Пользователь с таким логином или email уже существует' 
      });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание пользователя
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('passwordHash', sql.NVarChar, passwordHash)
      .query(`
        INSERT INTO users (username, email, password_hash, role)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.created_at
        VALUES (@username, @email, @passwordHash, 'user')
      `);

    const user = result.recordset[0];

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      message: 'Пользователь успешно зарегистрирован'
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


