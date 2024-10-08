import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      path: 'rollup-plugin-node-polyfills/polyfills/path',
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: chunkInfo => {
          if (chunkInfo.name === 'vendor') {
            return 'vendor.min.js';
          }
          return '[name].js';
        },
        assetFileNames: `[name].[ext]`,
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
