import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import babel from 'vite-plugin-babel';

export default defineConfig({
  base: '/pomodoro/',
  // Disable esbuild transformer — use Babel (pure JS) instead to avoid spawn EPERM on Windows sandbox
  esbuild: false,
  plugins: [
    babel({
      babelConfig: {
        presets: ['@babel/preset-typescript'],
      },
      include: [/\.[jt]sx?$/],
    }),
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
    sourcemap: false,
    target: 'es2015',
  },
  optimizeDeps: {
    // Disable esbuild-based dependency pre-bundling (not needed in dev when deps are already ESM)
    noDiscovery: true,
    include: [],
  }
});
