import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка данных пользователя из localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Сначала проверяем предустановленных пользователей
    const defaultUsers = {
      admin: { username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com' },
      user: { username: 'user', password: 'user123', role: 'user', email: 'user@example.com' }
    };

    const defaultUser = defaultUsers[username.toLowerCase()];
    
    if (defaultUser && defaultUser.password === password) {
      const userData = {
        username: defaultUser.username,
        email: defaultUser.email,
        role: defaultUser.role,
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    // Затем проверяем зарегистрированных пользователей
    const registeredUsers = localStorage.getItem('registeredUsers');
    if (registeredUsers) {
      try {
        const users = JSON.parse(registeredUsers);
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (foundUser && foundUser.password === password) {
          const userData = {
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role || 'user',
            loginTime: new Date().toISOString()
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return { success: true, user: userData };
        }
      } catch (e) {
        console.error('Ошибка загрузки пользователей:', e);
      }
    }

    return { success: false, error: 'Неверный логин или пароль' };
  };

  const register = (username, email, password) => {
    // Проверяем предустановленных пользователей
    const defaultUsers = ['admin', 'user'];
    if (defaultUsers.includes(username.toLowerCase())) {
      return { success: false, error: 'Этот логин уже занят' };
    }

    // Загружаем существующих пользователей
    let users = [];
    const existingUsers = localStorage.getItem('registeredUsers');
    if (existingUsers) {
      try {
        users = JSON.parse(existingUsers);
      } catch (e) {
        console.error('Ошибка загрузки пользователей:', e);
      }
    }

    // Проверяем, не занят ли логин или email
    const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (usernameExists) {
      return { success: false, error: 'Этот логин уже занят' };
    }
    
    if (emailExists) {
      return { success: false, error: 'Этот email уже используется' };
    }

    // Создаем нового пользователя
    const newUser = {
      username,
      email,
      password, // В реальном приложении пароль должен быть зашифрован!
      role: 'user',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Автоматически входим после регистрации
    const userData = {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      loginTime: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

