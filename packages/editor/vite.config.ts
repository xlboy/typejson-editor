import pkgJSON from './package.json';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),
    // dts({
    //   beforeWriteFile: (filePath, content) => {
    //     fs.outputFileSync(filePath.replace('.d.ts', '.d.cts'), content);
    //     return { filePath, content };
    //   },
    //   rollupTypes: true,
    // }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', ...Object.keys(pkgJSON.dependencies)],
    },
  },
});
