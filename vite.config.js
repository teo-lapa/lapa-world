import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/lapa-world/',
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: { output: { manualChunks: { world: ['three'] } } },
  },
  plugins: [VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png', 'icons/*.svg', 'logo-lapa.png'],
    manifest: {
      id: '/lapa-world/',
      name: 'LAPA World',
      short_name: 'LAPA World',
      description: 'Un piccolo mondo di consegne e scoperte.',
      lang: 'it',
      start_url: '/lapa-world/',
      scope: '/lapa-world/',
      display: 'standalone',
      background_color: '#bae1f1',
      theme_color: '#234d3e',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,woff2,webmanifest,mp3}'],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    },
    devOptions: { enabled: false },
  })],
});
