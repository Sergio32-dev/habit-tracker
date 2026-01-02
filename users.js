// pages/api/admin/users.js
import { pool } from '../../lib/db';

export default async function handler(req, res) {
  // Проверяем метод
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Здесь должна быть проверка авторизации и прав админа
  // const session = await getSession({ req });
  // if (!session || session.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }
  
  try {
    // Получаем всех пользователей из базы
    const result = await pool.query(`
      SELECT id, email, name, created_at, role, phone
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      users: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}