import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Mock lucide-react with stubs during tests to avoid jsdom icon errors
  resolve: {
    alias: isTest
      ? { 'lucide-react': resolve(__dirname, 'src/__mocks__/lucide-react.js') }
      : {},
  },

  // 🚀 EFFICIENCY: Build optimizations
  build: {
    target: 'esnext',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Code splitting: separate vendor chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/@google/generative-ai')) {
            return 'ai-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        },
      },
    },
    // Warn on chunks > 500kb
    chunkSizeWarningLimit: 500,
  },

  // 🚀 EFFICIENCY: Dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },

  // ✅ TESTING: Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
    alias: {
      'lucide-react': resolve(__dirname, 'src/__mocks__/lucide-react.js'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

