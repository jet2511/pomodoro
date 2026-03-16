import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Replace 'pomodoro' with your actual repository name if different
  base: '/pomodoro/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'audio/*.mp3'],
      manifest: {
        name: 'FocusTimer',
        short_name: 'FocusTimer',
        description: 'A beautiful, interactive Pomodoro timer to help you focus and manage tasks.',
        theme_color: '#ba4949',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
