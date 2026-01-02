/**
 * Подключение к SQL Server
 * Для использования в Vercel Serverless Functions
 */

const sql = require('mssql');

// Конфигурация из переменных окружения (Vercel)
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'HabitTracker',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
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

let pool = null;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('Подключение к БД установлено');
    }
    return pool;
  } catch (error) {
    console.error('Ошибка подключения к БД:', error);
    throw error;
  }
}

async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Подключение к БД закрыто');
    }
  } catch (error) {
    console.error('Ошибка закрытия подключения:', error);
  }
}

module.exports = {
  sql,
  getConnection,
  closeConnection,
  config
};


