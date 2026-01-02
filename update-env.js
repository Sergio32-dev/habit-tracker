// update-env.js
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔁 Обновление .env.local...');

try {
  // 1. Делаем backup
  if (fs.existsSync('.env.local')) {
    fs.copyFileSync('.env.local', '.env.local.backup');
    console.log('✅ Backup создан: .env.local.backup');
  }
  
  // 2. Скачиваем новые значения
  execSync('npx vercel env pull .env.local', { stdio: 'inherit' });
  
  // 3. Восстанавливаем локальные переменные
  if (fs.existsSync('.env.local.overrides')) {
    const overrides = fs.readFileSync('.env.local.overrides', 'utf8');
    fs.appendFileSync('.env.local', '\n' + overrides);
    console.log('✅ Локальные переменные добавлены');
  }
  
  console.log('🎉 .env.local обновлен!');
} catch (error) {
  console.error('❌ Ошибка:', error.message);
}