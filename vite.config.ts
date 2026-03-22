import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/lotto/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '로또 긁긁',
        short_name: '로또긁긁',
        description: '로또 당첨번호를 즉석복권처럼 긁어서 확인하세요',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/lotto/',
        scope: '/lotto/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,wav}'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/rounds\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lotto-data',
              expiration: { maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    })
  ]
})
