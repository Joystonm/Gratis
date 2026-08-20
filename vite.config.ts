import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'konva-vendor': ['konva', 'react-konva'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'state-vendor': ['zustand'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['konva', 'react-konva'],
  },
})
