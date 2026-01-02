/**
 * Скрипт для генерации хешей паролей (bcrypt)
 * 
 * Использование:
 * node scripts/generate-password-hash.js admin123
 */

const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function main() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('Использование: node generate-password-hash.js <пароль>');
    console.log('Пример: node generate-password-hash.js admin123');
    process.exit(1);
  }

  try {
    const hash = await generateHash(password);
    console.log('\n✅ Хеш пароля сгенерирован:');
    console.log('Пароль:', password);
    console.log('Хеш:', hash);
    console.log('\nИспользуйте этот хеш в SQL запросе:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';`);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

main();


