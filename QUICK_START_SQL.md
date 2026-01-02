# ⚡ Быстрый старт: SQL Server

## Шаг 1: Установите SQL Server

1. Скачайте: https://www.microsoft.com/sql-server/sql-server-downloads
2. Выберите **"SQL Server 2025 Developer Edition"** (бесплатно)
3. Установите с настройками по умолчанию
4. **Запомните пароль SA!**

## Шаг 2: Установите SSMS

1. Скачайте: https://aka.ms/ssmsfullsetup
2. Установите

## Шаг 3: Создайте базу данных

1. Откройте SSMS
2. Подключитесь (сервер: `localhost`, логин: `sa`, ваш пароль)
   - **ВАЖНО:** Установите галочку ✅ **"Доверенный сертификат сервера"** (Trust server certificate)
   - Если ошибка, см. `SQL_CONNECTION_FIX.md`
3. Откройте файл `database/create_database.sql`
4. Скопируйте весь код
5. В SSMS: **File → New → Query**
6. Вставьте код и нажмите **F5**
7. Должно появиться "База данных настроена успешно!"

## Шаг 4: Настройте проект

```bash
cd C:\Users\smama\Desktop\IT
npm install mssql bcrypt dotenv
```

## Шаг 5: Создайте config.js

1. Скопируйте `database/config.example.js` → `database/config.js`
2. Откройте `database/config.js`
3. Замените `'ВашПароль'` на ваш пароль SA

## Шаг 6: Протестируйте

```bash
cd database
npm install
node scripts/generate-password-hash.js admin123
```

Скопируйте полученный хеш и обновите пароль админа в БД через SSMS.

## Шаг 7: Готово!

База данных настроена. API endpoints готовы к использованию.

---

**Подробная инструкция:** См. `SQL_SERVER_COMPLETE_SETUP.md`

