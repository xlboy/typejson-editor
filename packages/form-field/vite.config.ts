import pkgJSON from './package.json';
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      beforeWriteFile: (filePath, content) => {
        fs.outputFileSync(filePath.replace('.d.ts', '.d.cts'), content);
        return { filePath, content };
      },
    }),
    visualizer({ open: false }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/jsx-runtime',
        ...Object.keys(pkgJSON.dependencies),
        ...Object.keys(pkgJSON.peerDependencies),
      ],
    },
  },
});
