import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Адрес nginx-шлюза CRM. Меняйте через переменную окружения GATEWAY при старте:
//   GATEWAY=http://localhost:8081 npm run dev
const GATEWAY = process.env.GATEWAY || 'http://localhost:8081'

// Прокси убирает CORS: фронт ходит на /api и /healthz своего же origin,
// а Vite молча перенаправляет запросы на шлюз.
const proxy = {
  '/api': { target: GATEWAY, changeOrigin: true },
  '/healthz': { target: GATEWAY, changeOrigin: true },
  '/health': { target: GATEWAY, changeOrigin: true },
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5180,
    proxy,
  },
  preview: {
    port: 5180,
    proxy,
  },
})
