import materialIcon from './vite-plugins/material-icon';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), materialIcon()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
