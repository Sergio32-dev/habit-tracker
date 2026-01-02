import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PremiumProvider } from './contexts/PremiumContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './styles/enhanced.css';
import './styles/themes.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </AuthProvider>
  </React.StrictMode>
);

