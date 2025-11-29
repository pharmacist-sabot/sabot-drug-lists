// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // อัปเดตเนื้อหาใหม่อัตโนมัติเมื่อมีการ deploy
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'บัญชียาโรงพยาบาลสระโบสถ์',
        short_name: 'Sabot DrugList',
        description: 'ระบบจัดการบัญชียาโรงพยาบาลสระโบสถ์',
        theme_color: '#3b82f6',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
})
