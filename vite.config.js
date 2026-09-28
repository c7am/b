import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    // Same-origin by default. Express serves this build and the API from one origin,
    // and the dev server proxies /api and /auth to :3000 (see server.proxy above).
    // Only set VITE_API_URL if the API really lives on a different host.
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL ?? ''),
  },
})
