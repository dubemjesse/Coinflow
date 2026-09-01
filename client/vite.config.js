import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

// Multi-page app: one entry per HTML file. Phase 1 keeps the original
// vanilla-JS pages intact — Vite just adds a dev server, env injection and a
// production build. The client is wired to the API in a later phase.
export default defineConfig({
  root,
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(root, 'index.html'),
        transactions: resolve(root, 'transactions.html'),
        reports: resolve(root, 'reports.html'),
        reminders: resolve(root, 'reminders.html'),
      },
    },
  },
  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
