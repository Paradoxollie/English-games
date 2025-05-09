import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@app': resolve(__dirname, 'src/app'),
      '@core': resolve(__dirname, 'src/core'),
      '@features': resolve(__dirname, 'src/features'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          vendor: ['chart.js', 'three', 'gsap', 'howler', 'pixi.js', 'matter-js'],
          utils: ['uuid', 'date-fns', 'dompurify', 'marked', 'crypto-js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    port: 4173,
    open: true
  }
});
