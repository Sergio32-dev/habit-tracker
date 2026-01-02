/**
 * Скрипт для тестирования подключения к SQL Server
 * 
 * Использование:
 * node scripts/test-connection.js
 */

const sql = require('mssql');
const config = require('../config');

async function testConnection() {
  try {
    console.log('Попытка подключения к SQL Server...');
    console.log(`Server: ${config.server}`);
    console.log(`Database: ${config.database}`);
    console.log(`User: ${config.user}`);
    
    const pool = await sql.connect(config);
    
    console.log('\n✅ Подключение успешно!');
    
    // Тестируем запрос
    const result = await pool.request().query('SELECT @@VERSION AS Version');
    console.log('\nВерсия SQL Server:');
    console.log(result.recordset[0].Version);
    
    // Проверяем существование базы данных
    const dbCheck = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = '${config.database}'
    `);
    
    if (dbCheck.recordset.length > 0) {
      console.log(`\n✅ База данных '${config.database}' найдена.`);
    } else {
      console.log(`\n❌ База данных '${config.database}' не найдена.`);
      console.log('Создайте базу данных используя create_database.sql');
    }
    
    await pool.close();
    console.log('\n✅ Тест завершен успешно!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(error.message);
    console.error('\nПроверьте:');
    console.error('1. SQL Server запущен');
    console.error('2. Правильные учетные данные в config.js');
    console.error('3. База данных создана');
    process.exit(1);
  }
}

testConnection();


