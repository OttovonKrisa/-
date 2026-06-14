import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Вставьте вместо <имя-репозитория> точное название вашего репозитория на GitHub.
    // Слэши в начале и конце обязательны! Например: base: '/interactive-map/'
    base: '/-/', 
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // ... остальные настройки
  };
});

