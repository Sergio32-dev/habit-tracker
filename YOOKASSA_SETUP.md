В# 💳 Настройка ЮKassa (Яндекс.Касса) для реальных платежей

## 🇷🇺 Российская платежная система

ЮKassa (Яндекс.Касса) - это российская платежная система для приема платежей в интернете.

**Преимущества:**
- ✅ Работает с российскими банками (VISA, Mastercard, МИР)
- ✅ Принимает платежи от российских пользователей
- ✅ Поддержка рекуррентных платежей (подписки)
- ✅ Низкие комиссии (2.8% + 10₽ за платеж)
- ✅ Безопасность (PCI DSS Level 1)

---

## 📋 Шаг 1: Регистрация в ЮKassa

1. Перейдите на **https://yookassa.ru**
2. Нажмите **"Подключиться"** или **"Регистрация"**
3. Выберите тип бизнеса:
   - **ИП** (Индивидуальный предприниматель)
   - **ООО** (Общество с ограниченной ответственностью)
   - **Самозанятый**
   - **Физлицо** (для тестирования)

4. Заполните данные:
   - ФИО
   - Email
   - Телефон
   - Данные организации (если ИП/ООО)

5. Подтвердите email и телефон

---

## 🔑 Шаг 2: Получение ключей API

1. В личном кабинете ЮKassa перейдите в **"Настройки" → "Ключи API"**

2. Скопируйте:
   - **shopId** (ID магазина) - начинается с цифр
   - **Секретный ключ** (Secret Key) - начинается с `live_` или `test_`

3. ⚠️ **Важно:** 
   - Есть **тестовый** и **боевой** режимы
   - Тестовый: ключи начинаются с `test_`
   - Боевой: ключи начинаются с `live_`

---

## 🔧 Шаг 3: Создание Backend API

ЮKassa требует, чтобы запросы на создание платежей шли **только с вашего сервера** (для безопасности).

### Вариант А: Node.js Backend (рекомендуется)

Создайте файл `server/api/yookassa/create-payment.js`:

```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Ключи из переменных окружения
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

router.post('/create-payment', async (req, res) => {
  try {
    const { planType, email, phone, userId } = req.body;

    const prices = {
      monthly: 29900, // 299 руб в копейках
      yearly: 199900
    };

    const descriptions = {
      monthly: 'Премиум подписка на 1 месяц',
      yearly: 'Премиум подписка на 1 год'
    };

    // Создаем платеж через API ЮKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': uuidv4(), // уникальный ключ для идемпотентности
        'Authorization': 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64')
      },
      body: JSON.stringify({
        amount: {
          value: (prices[planType] / 100).toFixed(2),
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.FRONTEND_URL}/payment-success`
        },
        capture: true,
        description: descriptions[planType],
        metadata: {
          planType: planType,
          userId: userId
        },
        receipt: {
          customer: {
            email: email,
            phone: phone || undefined
          },
          items: [
            {
              description: descriptions[planType],
              quantity: '1.00',
              amount: {
                value: (prices[planType] / 100).toFixed(2),
                currency: 'RUB'
              },
              vat_code: 1 // НДС не облагается
            }
          ]
        }
      })
    });

    const payment = await response.json();

    if (payment.id && payment.confirmation && payment.confirmation.confirmation_url) {
      res.json({
        success: true,
        paymentId: payment.id,
        paymentUrl: payment.confirmation.confirmation_url
      });
    } else {
      throw new Error('Ошибка создания платежа');
    }

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

### Вариант Б: Vercel Serverless Function

Создайте файл `api/yookassa/create-payment.js`:

```javascript
const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
  const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
  const FRONTEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.FRONTEND_URL;

  try {
    const { planType, email, phone, userId } = req.body;

    const prices = {
      monthly: 29900,
      yearly: 199900
    };

    const descriptions = {
      monthly: 'Премиум подписка на 1 месяц',
      yearly: 'Премиум подписка на 1 год'
    };

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': uuidv4(),
        'Authorization': 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64')
      },
      body: JSON.stringify({
        amount: {
          value: (prices[planType] / 100).toFixed(2),
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: `${FRONTEND_URL}/payment-success`
        },
        capture: true,
        description: descriptions[planType],
        metadata: {
          planType,
          userId
        },
        receipt: {
          customer: {
            email,
            phone: phone || undefined
          },
          items: [
            {
              description: descriptions[planType],
              quantity: '1.00',
              amount: {
                value: (prices[planType] / 100).toFixed(2),
                currency: 'RUB'
              },
              vat_code: 1
            }
          ]
        }
      })
    });

    const payment = await response.json();

    if (payment.id && payment.confirmation?.confirmation_url) {
      return res.json({
        success: true,
        paymentId: payment.id,
        paymentUrl: payment.confirmation.confirmation_url
      });
    }

    throw new Error(payment.description || 'Ошибка создания платежа');

  } catch (error) {
    console.error('Ошибка:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

---

## 🔄 Шаг 4: Обновление Frontend

1. Откройте `src/services/yookassaService.js`

2. Замените метод `createPayment`:

```javascript
async createPayment(planType, userData = {}) {
  try {
    const response = await fetch('/api/yookassa/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planType,
        email: userData.email,
        phone: userData.phone,
        userId: userData.userId || localStorage.getItem('userId')
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        paymentUrl: result.paymentUrl,
        paymentId: result.paymentId
      };
    } else {
      throw new Error(result.error || 'Ошибка создания платежа');
    }
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    throw error;
  }
}
```

---

## 🔐 Шаг 5: Настройка переменных окружения

### Для локальной разработки:

Создайте файл `.env.local`:
```
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_секретный_ключ
FRONTEND_URL=http://localhost:5173
```

### Для Vercel:

1. Перейдите в настройки проекта Vercel
2. **Settings → Environment Variables**
3. Добавьте:
   - `YOOKASSA_SHOP_ID` = ваш shop ID
   - `YOOKASSA_SECRET_KEY` = ваш секретный ключ
   - `FRONTEND_URL` = ваш домен (например: `https://your-app.vercel.app`)

---

## ✅ Шаг 6: Обработка успешной оплаты

Создайте страницу `src/pages/PaymentSuccess.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePremium } from '../contexts/PremiumContext';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activatePremium } = usePremium();
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (paymentId) {
      // Проверяем статус платежа и активируем премиум
      // В реальном приложении здесь будет запрос к backend
      activatePremium(30); // или 365 для годовой подписки
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [paymentId, activatePremium, navigate]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Check size={64} color="#10b981" />
      <h2>Платеж успешен!</h2>
      <p>Премиум подписка активирована</p>
    </div>
  );
}
```

---

## 🧪 Шаг 7: Тестирование

### Тестовые карты ЮKassa:

1. **Успешная оплата:**
   - Номер: `5555 5555 5555 4444`
   - Срок: любая будущая дата
   - CVC: любой 3-значный код

2. **Отклоненная карта:**
   - Номер: `5555 5555 5555 4477`

3. **3D Secure:**
   - Номер: `5555 5555 5555 4444`
   - Будет запрошен код из SMS

---

## 📱 Шаг 8: Webhook для обработки событий

Создайте endpoint для получения уведомлений от ЮKassa:

```javascript
// api/yookassa/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;
  
  if (event.event === 'payment.succeeded') {
    const payment = event.object;
    
    // Активируйте премиум для пользователя
    const planType = payment.metadata?.planType;
    const userId = payment.metadata?.userId;
    const days = planType === 'yearly' ? 365 : 30;
    
    // Сохраните в базу данных
    // await activatePremiumForUser(userId, days);
  }

  return res.json({ received: true });
}
```

Настройте webhook в личном кабинете ЮKassa:
- URL: `https://your-domain.com/api/yookassa/webhook`
- События: `payment.succeeded`, `payment.canceled`

---

## 💰 Комиссии ЮKassa

- **Банковские карты:** 2.8% + 10₽ за платеж
- **Электронные кошельки:** от 3%
- **Наличные:** от 2%

Минимальная сумма платежа: 1₽
Максимальная сумма: без ограничений

---

## 📚 Документация

- **Официальная документация:** https://yookassa.ru/developers/api
- **API Reference:** https://yookassa.ru/developers/api#create_payment
- **Тестирование:** https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing

---

## ✅ Чеклист

- [ ] Зарегистрированы в ЮKassa
- [ ] Получены ключи API (shopId и Secret Key)
- [ ] Создан backend endpoint для создания платежей
- [ ] Настроены переменные окружения
- [ ] Обновлен frontend для работы с реальным API
- [ ] Создана страница успешной оплаты
- [ ] Настроен webhook (опционально)
- [ ] Протестировано с тестовыми картами

---

**Готово! Теперь у вас настроена реальная российская платежная система! 🇷🇺💳**


