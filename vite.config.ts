import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/lotto/',
  plugins: [
    react(),
    tailwindcss(),
    // PWA 캐시 임시 비활성화 (사운드 테스트 중)
    // TODO: 테스트 완료 후 캐시 복원
    VitePWA({
      selfDestroying: true,
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
      }
    })
  ]
})
