// test-connection.js
const { Client } = require('pg');

// Загружаем переменные из .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Проверяем подключение к Neon Postgres...\n');

// Проверяем наличие переменных
if (!process.env.POSTGRES_URL) {
  console.error('❌ ОШИБКА: POSTGRES_URL не найден в .env.local');
  console.log('Проверьте что:');
  console.log('1. Файл .env.local существует');
  console.log('2. В нем есть POSTGRES_URL=...');
  console.log('3. Выполнили: npx vercel env pull .env.local');
  process.exit(1);
}

console.log('✅ POSTGRES_URL найден');
console.log('Хост:', process.env.POSTGRES_HOST || 'не указан');
console.log('База данных:', process.env.POSTGRES_DATABASE || 'не указана');

// Создаем клиент БД
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Важно для Neon!
  }
});

// Тестируем подключение
async function testConnection() {
  console.log('\n🔄 Пытаемся подключиться к базе данных...');
  
  try {
    // 1. Подключаемся
    await client.connect();
    console.log('✅ Успешное подключение к базе данных!');
    
    // 2. Проверяем версию PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Версия PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
    
    // 3. Проверяем список таблиц (если есть)
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Найденные таблицы:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('📭 Таблицы не найдены (база пустая)');
    }
    
    // 4. Создаем тестовую таблицу (опционально)
    console.log('\n🧪 Создаем тестовую таблицу...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Тестовая таблица создана/проверена');
    
    // 5. Добавляем тестовую запись
    await client.query(
      'INSERT INTO test_connection (message) VALUES ($1)',
      ['Тестовое подключение из Node.js успешно!']
    );
    console.log('✅ Тестовая запись добавлена');
    
    // 6. Читаем тестовые записи
    const selectResult = await client.query(
      'SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log('\n📝 Последние записи в тестовой таблице:');
    selectResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. [${row.created_at.toLocaleString()}] ${row.message}`);
    });
    
  } catch (error) {
    console.error('\n❌ ОШИБКА ПОДКЛЮЧЕНИЯ:');
    console.error('   Сообщение:', error.message);
    console.error('\n🔧 Возможные решения:');
    console.error('   1. Проверьте строку подключения в .env.local');
    console.error('   2. Убедитесь что база данных создана в Neon');
    console.error('   3. Проверьте интернет-соединение');
    console.error('   4. Убедитесь что IP не заблокирован (Neon требует IP whitelist)');
    
    // Показываем детали ошибки для отладки
    console.error('\n🔍 Детали ошибки:', error.code);
    
  } finally {
    // Всегда закрываем подключение
    if (client) {
      await client.end();
      console.log('\n🔒 Подключение закрыто');
    }
    process.exit(0);
  }
}

// Запускаем тест
testConnection();