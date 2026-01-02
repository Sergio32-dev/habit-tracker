/**
 * Vercel Serverless Function для проверки статуса платежа ЮKassa
 */

const YOOKASSA_SHOP_ID = '1240929';
const YOOKASSA_SECRET_KEY = 'test_l4MEO0hxZuAV1WhE2XXxLqIUQ4qCjSD-AmZpIz7AVqA';
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

function getAuthHeader() {
  const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
  return `Basic ${auth}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false,
        error: 'paymentId обязателен' 
      });
    }

    const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader()
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        success: false,
        error: error.description || 'Ошибка проверки платежа'
      });
    }

    const payment = await response.json();
    
    return res.status(200).json({
      success: true,
      status: payment.status,
      paid: payment.status === 'succeeded',
      payment: payment
    });

  } catch (error) {
    console.error('Ошибка проверки платежа:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Внутренняя ошибка сервера'
    });
  }
};


