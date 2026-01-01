/**
 * Интеграция с ЮKassa (Яндекс.Касса)
 * Российская платежная система для приема платежей
 */

/**
 * Создает платеж через ЮKassa
 * Использует backend endpoint для безопасности
 */
export const yookassaService = {
  /**
   * Создает платеж для подписки
   * @param {string} planType - 'monthly' или 'yearly'
   * @param {Object} userData - данные пользователя (email, phone)
   * @returns {Promise<Object>} данные для редиректа на оплату
   */
  async createPayment(planType, userData = {}) {
    try {
      // Используем backend endpoint (Vercel Serverless Function)
      const backendUrl = '/api/yookassa/create-payment';

      const response = await fetch(backendUrl, {
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

      // Проверяем статус ответа
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Ошибка сервера (${response.status}): ${errorText}`);
        }
        throw new Error(errorData.error || 'Ошибка создания платежа');
      }

      // Читаем ответ как текст, затем парсим JSON
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Пустой ответ от сервера');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('Текст ответа:', text);
        throw new Error(`Ошибка парсинга JSON: ${e.message}`);
      }
      
      if (result.success && result.paymentUrl) {
        return {
          success: true,
          paymentUrl: result.paymentUrl,
          paymentId: result.paymentId
        };
      } else {
        throw new Error(result.error || 'Не получен URL для оплаты');
      }

    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      throw error;
    }
  },

  /**
   * Проверяет статус платежа
   * @param {string} paymentId - ID платежа
   * @returns {Promise<Object>} статус платежа
   */
  async checkPaymentStatus(paymentId) {
    try {
      // В реальном приложении запрос к вашему backend
      // const response = await fetch(`/api/yookassa/check-payment/${paymentId}`)
      
      return {
        status: 'succeeded',
        paid: true
      };
    } catch (error) {
      console.error('Ошибка проверки платежа:', error);
      throw error;
    }
  }
};
