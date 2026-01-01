import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PremiumProvider } from './contexts/PremiumContext';
import './index.css';
import './styles/enhanced.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PremiumProvider>
      <App />
    </PremiumProvider>
  </React.StrictMode>
);

