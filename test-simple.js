// test-simple.js
console.log('🚀 Тест запущен!');

// Проверяем .env.local
require('dotenv').config({ path: '.env.local' });

console.log('📁 Загружен .env.local');

// Проверяем переменные
const url = process.env.POSTGRES_URL;
console.log('🔗 POSTGRES_URL:', url ? 'Есть!' : 'Нет!');

if (url) {
  console.log('📏 Длина строки:', url.length);
  console.log('🔍 Начинается с:', url.substring(0, 30) + '...');
  
  // Быстрая проверка формата
  if (url.includes('postgresql://')) {
    console.log('✅ Формат правильный (postgresql://)');
  } else {
    console.log('❌ Неверный формат строки подключения');
  }
}

console.log('🏁 Тест завершен');
process.exit(0);