import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'sonner'],
          icons: ['react-icons'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
    host: '127.0.0.1', // Use IPv4 explicitly to avoid IPv6 permission issues on Windows
    strictPort: true, // Try next available port if 5173 is busy
  },
  preview: {
    port: 4173,
    host: '127.0.0.1',
  },
});