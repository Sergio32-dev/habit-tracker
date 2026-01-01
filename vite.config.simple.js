// Упрощенная версия без PWA (для деплоя, если PWA вызывает ошибки)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});

