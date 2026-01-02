-- =============================================
-- Создание пользователей с правильными хешами
-- =============================================
-- 
-- ИНСТРУКЦИЯ:
-- 1. Сначала сгенерируйте хеши через Node.js:
--    node scripts/generate-password-hash.js admin123
--    node scripts/generate-password-hash.js user123
--
-- 2. Замените ВАШ_ХЕШ_ADMIN и ВАШ_ХЕШ_USER на реальные хеши
--
-- 3. Выполните этот скрипт в SSMS
-- =============================================

USE HabitTracker;
GO

-- Удаляем старых пользователей (если есть)
DELETE FROM users WHERE username IN ('admin', 'user');
GO

-- Создаем админа
-- ЗАМЕНИТЕ 'ВАШ_ХЕШ_ADMIN' на хеш от 'admin123'
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
    'admin',
    'admin@habitracker.com',
    'ВАШ_ХЕШ_ADMIN',  -- Замените на реальный хеш!
    'admin',
    1
);
GO

-- Создаем тестового пользователя
-- ЗАМЕНИТЕ 'ВАШ_ХЕШ_USER' на хеш от 'user123'
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
    'user',
    'user@habitracker.com',
    'ВАШ_ХЕШ_USER',  -- Замените на реальный хеш!
    'user',
    1
);
GO

PRINT 'Пользователи созданы успешно!';
PRINT 'ВАЖНО: Убедитесь что вы заменили хеши на реальные!';
GO


