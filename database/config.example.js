/**
 * Конфигурация подключения к SQL Server
 * 
 * ИНСТРУКЦИЯ:
 * 1. Скопируйте этот файл как config.js
 * 2. Заполните свои данные подключения
 * 3. НИКОГДА не коммитьте config.js в Git!
 */

module.exports = {
  user: 'sa',                    // Имя пользователя SQL Server
  password: 'ВашПароль',         // Пароль SQL Server
  server: 'localhost',           // Адрес сервера (localhost для локального)
  database: 'HabitTracker',      // Имя базы данных
  options: {
    encrypt: false,              // Используйте true для Azure
    trustServerCertificate: true, // Для локального сервера без сертификата
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};


