// Простой тест для проверки работы API
module.exports = function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'API работает!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

