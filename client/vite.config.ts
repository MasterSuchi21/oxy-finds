import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Avoids needing a configured CORS origin in dev: the browser hits 5173,
      // the dev server proxies /api → 4000 locally.
      '/api': 'http://localhost:4000',
    },
  },
  preview: {
    port: 5173,
  },
});
