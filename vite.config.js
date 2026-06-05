import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El navegador solo habla con Vite (5173). Vite reenvía a Apache → sin CORS.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@lottiefiles/dotlottie-react'],
  },
  // CAMBIA "_____" por el nombre EXACTO de tu repositorio en GitHub
  base: '/OsteoporosisApp/',
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // En dev se permiten ws:// para HMR y 'unsafe-inline' para los módulos de Vite
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://api.dicebear.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' ws://localhost:5173 https://franklinparrales.es",
        "worker-src blob: 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          const [pathname, search] = path.split('?');
          const route = pathname.replace(/^\/api\/?/, '');
          return `/backend/public/api/index.php?route=${route}${search ? '&' + search : ''}`;
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts'))               return 'vendor-charts';
          if (id.includes('node_modules/framer-motion'))          return 'vendor-motion';
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/exceljs'))                return 'vendor-export';
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next') ||
              id.includes('node_modules/i18next-browser'))        return 'vendor-i18n';
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/rsuite'))                 return 'vendor-ui';
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react/'))                 return 'vendor-react';
        },
      },
    },
  },
})