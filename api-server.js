const express = require('express');
const app = express();
const PORT = 3001;

app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: [
      {id: 1, name: "API User", email: "api@test.com", phone: "+79990000000", role: "user"}
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
});