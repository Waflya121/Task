import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-сервер обязан слушать порт 3000: на него завязаны CORS бэкенда
// и ссылка подтверждения email (http://localhost:3000/confirm?token=...)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
  },
});
