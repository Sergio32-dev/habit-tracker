/**
 * Vercel Serverless Function для создания платежа через ЮKassa
 * Этот файл создаст endpoint: /api/yookassa/create-payment
 */

// Тестовые ключи ЮKassa
const YOOKASSA_SHOP_ID = '1240929';
const YOOKASSA_SECRET_KEY = 'test_l4MEO0hxZuAV1WhE2XXxLqIUQ4qCjSD-AmZpIz7AVqA';
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

/**
 * Генерирует уникальный ключ для идемпотентности
 */
function generateIdempotenceKey() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Создает базовую авторизацию для запросов к ЮKassa API
 */
function getAuthHeader() {
  const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
  return `Basic ${auth}`;
}

// Используем CommonJS для совместимости с Vercel
module.exports = async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planType, email, phone, userId } = req.body;

    if (!planType || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'planType и email обязательны' 
      });
    }

    // В реальном приложении цены должны браться из базы данных
    // Здесь используем значения по умолчанию
    // Админ может изменить цены через админ-панель, но они сохраняются только на клиенте
    // Для продакшена нужно хранить цены в базе данных
    const prices = {
      monthly: 29900, // 299 руб в копейках
      yearly: 199900  // 1999 руб в копейках
    };

    const descriptions = {
      monthly: 'Премиум подписка на 1 месяц',
      yearly: 'Премиум подписка на 1 год'
    };

    // Получаем URL для возврата
    const origin = req.headers.origin || req.headers.referer || 'https://your-app.vercel.app';
    const returnUrl = origin.replace(/\/$/, '');

    const paymentData = {
      amount: {
        value: (prices[planType] / 100).toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      capture: true,
      description: descriptions[planType],
      metadata: {
        planType: planType,
        userId: userId || 'anonymous'
      }
    };

    // Добавляем receipt если есть email
    if (email) {
      paymentData.receipt = {
        customer: {
          email: email,
          ...(phone && { phone: phone })
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
      };
    }

    // Создаем платеж через API ЮKassa
    const yookassaResponse = await fetch(`${YOOKASSA_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': generateIdempotenceKey(),
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(paymentData)
    });

    const yookassaData = await yookassaResponse.json();

    if (!yookassaResponse.ok) {
      console.error('Ошибка ЮKassa API:', yookassaData);
      return res.status(yookassaResponse.status).json({ 
        success: false,
        error: yookassaData.description || 'Ошибка создания платежа',
        details: yookassaData
      });
    }

    if (yookassaData.id && yookassaData.confirmation && yookassaData.confirmation.confirmation_url) {
      return res.status(200).json({
        success: true,
        paymentUrl: yookassaData.confirmation.confirmation_url,
        paymentId: yookassaData.id
      });
    } else {
      return res.status(500).json({ 
        success: false,
        error: 'Не получен URL для оплаты',
        payment: yookassaData
      });
    }

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Внутренняя ошибка сервера'
    });
  }
};
