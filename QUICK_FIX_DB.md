# ⚡ Быстрое решение проблемы с БД

## ❌ Ошибка: "Unexpected token 'c', "const { ge"... is not valid JSON"

**Причина:** Vite dev server не может обрабатывать API endpoints. Нужен Vercel CLI.

---

## ✅ Решение за 3 шага:

### Шаг 1: Установите зависимости

```bash
cd C:\Users\smama\Desktop\IT
npm install mssql bcrypt dotenv
```

### Шаг 2: Создайте `.env.local`

Создайте файл `.env.local` в папке проекта:

```env
DB_USER=sa
DB_PASSWORD=ваш_пароль
DB_SERVER=localhost
DB_DATABASE=HabitTracker
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### Шаг 3: Запустите через Vercel CLI

```bash
npx vercel dev
```

Вместо `npm run dev` используйте `npx vercel dev`!

---

## ✅ Готово!

Теперь API endpoints будут работать на `http://localhost:3000/api/*`

**Для продакшена:** Задеплойте на Vercel - API endpoints работают автоматически!

---

**Подробнее:** См. `DB_INTEGRATION_GUIDE.md`


