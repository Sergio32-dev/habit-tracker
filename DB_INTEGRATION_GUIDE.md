# 🔗 Полное руководство по интеграции БД в проект

## ⚠️ Проблема: "Unexpected token 'c'"

Эта ошибка возникает потому, что **Vite dev server не может обрабатывать API endpoints напрямую**. API endpoints работают только на Vercel или через Vercel CLI локально.

---

## ✅ Решение 1: Использовать Vercel CLI для локальной разработки (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Установите зависимости

```bash
cd C:\Users\smama\Desktop\IT
npm install mssql bcrypt dotenv
```

### Шаг 2: Установите Vercel CLI (если еще не установлен)

```bash
npm install -g vercel
```

### Шаг 3: Создайте `.env.local` файл

Создайте файл `.env.local` в корне проекта:

```env
DB_USER=sa
DB_PASSWORD=ваш_пароль_SA
DB_SERVER=localhost
DB_DATABASE=HabitTracker
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

**⚠️ НЕ КОММИТЬТЕ `.env.local` в Git!** (уже в .gitignore)

### Шаг 4: Запустите проект через Vercel CLI

```bash
npx vercel dev
```

Это запустит:
- Frontend на `http://localhost:3000`
- API endpoints на `http://localhost:3000/api/*`

Теперь API endpoints будут работать локально!

---

## ✅ Решение 2: Обновить AuthContext для работы с API (после настройки Vercel CLI)

Обновим `src/contexts/AuthContext.jsx` для использования API endpoints вместо localStorage.

---

## ✅ Решение 3: Для продакшена (Vercel)

На Vercel API endpoints работают автоматически! Просто:

1. Добавьте переменные окружения в Vercel Dashboard:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_SERVER` (адрес вашего SQL Server)
   - `DB_DATABASE=HabitTracker`
   - `DB_ENCRYPT=true` (для облачного SQL)
   - `DB_TRUST_CERT=true`

2. Задеплойте проект:
   ```bash
   vercel --prod
   ```

---

## 📝 Чеклист интеграции:

- [ ] Установлены зависимости: `npm install mssql bcrypt dotenv`
- [ ] Установлен Vercel CLI: `npm install -g vercel`
- [ ] Создан `.env.local` с данными подключения
- [ ] База данных создана в SQL Server
- [ ] Запуск через `npx vercel dev` работает
- [ ] API endpoints тестируются и работают
- [ ] AuthContext обновлен для работы с API (опционально)

---

## 🔍 Тестирование API endpoints

После запуска `npx vercel dev`, протестируйте API:

**Регистрация:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

**Вход:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

---

## ⚠️ Важно:

1. **Для локальной разработки используйте `npx vercel dev`**, а не `npm run dev`
2. **API endpoints работают только через Vercel CLI или на Vercel**
3. **Vite dev server (`npm run dev`) НЕ поддерживает API endpoints**
4. **Для продакшена используйте облачный SQL Server** (Azure SQL Database, AWS RDS и т.д.)

---

**Следуйте Решению 1 для быстрого старта! 🚀**


