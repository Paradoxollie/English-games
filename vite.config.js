import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11']
        })
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: '/index.html',
                leaderboard: '/leaderboard.html'
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
}); 