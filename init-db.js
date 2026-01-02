import { pool } from '../../lib/db';

export default async function handler(req, res) {
  // Базовая защита (в реальном проекте используйте JWT)
  const adminToken = req.headers['x-admin-token'];
  if (process.env.ADMIN_TOKEN && adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const { page = 1, limit = 50, search = '', sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        u.id, u.email, u.name, u.phone, u.role, 
        u.status, u.source, u.metadata,
        u.created_at, u.updated_at,
        r.ip_address, r.user_agent, r.referrer
      FROM users u
      LEFT JOIN registration_logs r ON u.id = r.user_id
    `;
    
    const params = [];
    let whereClauses = [];
    
    if (search) {
      whereClauses.push(`
        (u.email ILIKE $${params.length + 1} OR 
         u.name ILIKE $${params.length + 1} OR 
         u.phone ILIKE $${params.length + 1})
      `);
      params.push(`%${search}%`);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    // Сортировка
    const sortOptions = {
      newest: 'u.created_at DESC',
      oldest: 'u.created_at ASC',
      name: 'u.name ASC',
      email: 'u.email ASC'
    };
    
    query += ` ORDER BY ${sortOptions[sort] || 'u.created_at DESC'}`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    // Получаем пользователей
    const usersResult = await pool.query(query, params);
    
    // Получаем общее количество для пагинации
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users u
      ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    
    // Статистика
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN source = 'website' THEN 1 END) as website_users
      FROM users
    `);
    
    res.status(200).json({
      success: true,
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      },
      stats: statsQuery.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}