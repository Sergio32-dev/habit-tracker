export default async function handler(req, res) {
  try {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }
    
    // Всегда возвращаем правильную структуру
    const mockUsers = [
      {
        id: 1,
        email: 'admin@example.com',
        name: 'Администратор',
        phone: '+79990000000',
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        email: 'user@test.com',
        name: 'Тестовый пользователь',
        phone: '+79991234567',
        role: 'user',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        email: 'newuser@example.com',
        name: 'Новый пользователь',
        phone: '+79995554433',
        role: 'user',
        created_at: new Date().toISOString()
      }
    ];
    
    // Успешный ответ
    res.status(200).json({
      success: true,
      users: mockUsers,
      pagination: {
        page: 1,
        limit: 50,
        total: mockUsers.length,
        totalPages: 1
      },
      stats: {
        total_users: mockUsers.length,
        today_users: mockUsers.length,
        admin_count: mockUsers.filter(u => u.role === 'admin').length,
        website_users: mockUsers.length
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      users: [] // Всегда возвращаем массив
    });
  }
}
