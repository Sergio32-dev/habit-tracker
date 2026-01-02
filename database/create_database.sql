-- =============================================
-- Создание базы данных HabitTracker
-- =============================================

-- Создание базы данных
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HabitTracker')
BEGIN
    CREATE DATABASE HabitTracker;
    PRINT 'База данных HabitTracker создана успешно.';
END
ELSE
BEGIN
    PRINT 'База данных HabitTracker уже существует.';
END
GO

USE HabitTracker;
GO

-- =============================================
-- Таблица пользователей
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        last_login DATETIME2 NULL,
        is_active BIT DEFAULT 1
    );
    
    CREATE INDEX IX_users_username ON users(username);
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_role ON users(role);
    
    PRINT 'Таблица users создана успешно.';
END
ELSE
BEGIN
    PRINT 'Таблица users уже существует.';
END
GO

-- =============================================
-- Таблица привычек
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[habits]') AND type in (N'U'))
BEGIN
    CREATE TABLE habits (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        name NVARCHAR(200) NOT NULL,
        icon NVARCHAR(10) DEFAULT '⭐',
        color NVARCHAR(20) DEFAULT '#6366f1',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_habits_user_id ON habits(user_id);
    
    PRINT 'Таблица habits создана успешно.';
END
ELSE
BEGIN
    PRINT 'Таблица habits уже существует.';
END
GO

-- =============================================
-- Таблица выполненных задач
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[habit_completions]') AND type in (N'U'))
BEGIN
    CREATE TABLE habit_completions (
        id INT PRIMARY KEY IDENTITY(1,1),
        habit_id INT NOT NULL,
        completion_date DATE NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        UNIQUE(habit_id, completion_date)
    );
    
    CREATE INDEX IX_habit_completions_habit_id ON habit_completions(habit_id);
    CREATE INDEX IX_habit_completions_date ON habit_completions(completion_date);
    
    PRINT 'Таблица habit_completions создана успешно.';
END
ELSE
BEGIN
    PRINT 'Таблица habit_completions уже существует.';
END
GO

-- =============================================
-- Таблица подписок
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[subscriptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE subscriptions (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        plan_type NVARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
        start_date DATETIME2 NOT NULL,
        end_date DATETIME2 NOT NULL,
        payment_id NVARCHAR(100) NULL,
        payment_provider NVARCHAR(50) DEFAULT 'yookassa',
        status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
        amount DECIMAL(10,2) NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IX_subscriptions_status ON subscriptions(status);
    
    PRINT 'Таблица subscriptions создана успешно.';
END
ELSE
BEGIN
    PRINT 'Таблица subscriptions уже существует.';
END
GO

-- =============================================
-- Создание триггера для обновления updated_at
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TR_users_updated_at]') AND type = 'TR')
BEGIN
    EXEC('
    CREATE TRIGGER TR_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE users
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id;
    END
    ');
    PRINT 'Триггер TR_users_updated_at создан успешно.';
END
GO

-- =============================================
-- Создание первого админа (пароль: admin123)
-- Пароль будет захеширован через bcrypt: $2a$10$rBV2jDe...
-- Для тестирования можно использовать временный пароль
-- =============================================
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    -- ВАЖНО: Замените 'temp_hash' на реальный хеш bcrypt от 'admin123'
    -- Для генерации используйте Node.js: const hash = await bcrypt.hash('admin123', 10);
    INSERT INTO users (username, email, password_hash, role, is_active)
    VALUES ('admin', 'admin@habitracker.com', '$2a$10$rBV2jDeXAnFj5iK3H4Xj5eX5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5v', 'admin', 1);
    PRINT 'Администратор admin создан. Пароль: admin123 (нужно обновить хеш!)';
END
GO

-- =============================================
-- Создание тестового пользователя (пароль: user123)
-- =============================================
IF NOT EXISTS (SELECT * FROM users WHERE username = 'user')
BEGIN
    -- ВАЖНО: Замените 'temp_hash' на реальный хеш bcrypt от 'user123'
    INSERT INTO users (username, email, password_hash, role, is_active)
    VALUES ('user', 'user@habitracker.com', '$2a$10$rBV2jDeXAnFj5iK3H4Xj5eX5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5v', 'user', 1);
    PRINT 'Тестовый пользователь user создан. Пароль: user123 (нужно обновить хеш!)';
END
GO

PRINT '';
PRINT '=============================================';
PRINT 'База данных настроена успешно!';
PRINT 'ВАЖНО: Обновите password_hash для admin и user через API регистрации или вручную!';
PRINT '=============================================';
GO


