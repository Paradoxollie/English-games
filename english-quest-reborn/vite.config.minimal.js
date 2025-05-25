import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3003,
    open: false,
    hmr: false, // Désactiver complètement HMR
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Désactiver toutes les transformations qui peuvent causer des problèmes
  plugins: [],
  // Éviter les optimisations qui peuvent causer des conflits
  optimizeDeps: {
    disabled: true
  }
}); 