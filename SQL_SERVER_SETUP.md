# 🗄️ Подключение SQL Server к проекту

## Установка SQL Server

### Вариант 1: SQL Server 2025 Developer Edition (бесплатно)

1. **Скачайте SQL Server 2025 Developer Edition:**
   - Перейдите на: https://www.microsoft.com/sql-server/sql-server-downloads
   - Выберите "SQL Server 2025 Developer Edition"
   - Скачайте установщик

2. **Установите SQL Server:**
   - Запустите установщик
   - Выберите "Basic" для быстрой установки
   - Или "Custom" для настройки параметров
   - Запомните пароль для учетной записи SA (системный администратор)

3. **Установите SQL Server Management Studio (SSMS):**
   - Скачайте SSMS: https://aka.ms/ssmsfullsetup
   - Установите для управления базой данных

---

## Создание базы данных

### Через SQL Server Management Studio (SSMS):

1. Откройте SSMS
2. Подключитесь к серверу:
   - Server name: `localhost` или `(localdb)\MSSQLLocalDB`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: ваш пароль

3. Создайте базу данных:
   ```sql
   CREATE DATABASE HabitTracker;
   GO

   USE HabitTracker;
   GO
   ```

4. Создайте таблицу пользователей:
   ```sql
   CREATE TABLE users (
       id INT PRIMARY KEY IDENTITY(1,1),
       username NVARCHAR(50) UNIQUE NOT NULL,
       email NVARCHAR(100) UNIQUE NOT NULL,
       password_hash NVARCHAR(255) NOT NULL,
       role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
       created_at DATETIME2 DEFAULT GETDATE(),
       updated_at DATETIME2 DEFAULT GETDATE()
   );
   GO
   ```

5. Создайте таблицу привычек:
   ```sql
   CREATE TABLE habits (
       id INT PRIMARY KEY IDENTITY(1,1),
       user_id INT NOT NULL,
       name NVARCHAR(200) NOT NULL,
       icon NVARCHAR(10) DEFAULT '⭐',
       color NVARCHAR(20) DEFAULT '#6366f1',
       created_at DATETIME2 DEFAULT GETDATE(),
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   GO
   ```

6. Создайте таблицу выполненных задач:
   ```sql
   CREATE TABLE habit_completions (
       id INT PRIMARY KEY IDENTITY(1,1),
       habit_id INT NOT NULL,
       completion_date DATE NOT NULL,
       created_at DATETIME2 DEFAULT GETDATE(),
       FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
       UNIQUE(habit_id, completion_date)
   );
   GO
   ```

7. Создайте таблицу подписок:
   ```sql
   CREATE TABLE subscriptions (
       id INT PRIMARY KEY IDENTITY(1,1),
       user_id INT NOT NULL,
       plan_type NVARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
       start_date DATETIME2 NOT NULL,
       end_date DATETIME2 NOT NULL,
       payment_id NVARCHAR(100),
       status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
       created_at DATETIME2 DEFAULT GETDATE(),
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   GO
   ```

---

## Настройка подключения в Node.js

### 1. Установите драйвер SQL Server:

```bash
npm install mssql
```

### 2. Создайте файл конфигурации:

`config/database.js`:
```javascript
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'ВашПароль',
  server: 'localhost',
  database: 'HabitTracker',
  options: {
    encrypt: true, // Используйте для Azure
    trustServerCertificate: true // Для локального сервера
  }
};

async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('Ошибка подключения к БД:', error);
    throw error;
  }
}

module.exports = { sql, getConnection };
```

---

## Создание API endpoints

### Пример: `api/auth/login.js`:

```javascript
const { sql, getConnection } = require('../../config/database');
const bcrypt = require('bcrypt');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const pool = await getConnection();

    // Поиск пользователя
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = result.recordset[0];

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Генерация JWT токена
    const token = generateJWT(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
```

---

## Шифрование паролей

Установите bcrypt:
```bash
npm install bcrypt
```

Пример хеширования:
```javascript
const bcrypt = require('bcrypt');

// При регистрации
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Сохранить passwordHash в БД
```

---

## Переменные окружения

Создайте `.env` файл:
```
DB_USER=sa
DB_PASSWORD=ВашПароль
DB_SERVER=localhost
DB_DATABASE=HabitTracker
JWT_SECRET=ваш-секретный-ключ
```

Используйте `dotenv`:
```bash
npm install dotenv
```

---

## Миграция данных из localStorage

Когда будете готовы перенести данные:

1. Экспортируйте данные из localStorage
2. Импортируйте в SQL Server через скрипт
3. Обновите AuthContext для использования API

---

**Готово! Структура БД и примеры кода подготовлены! 🎉**


