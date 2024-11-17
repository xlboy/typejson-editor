import fs from 'fs-extra';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['vite.config.ts'],
      beforeWriteFile: (filePath, content) => {
        fs.outputFileSync(filePath.replace('.d.ts', '.d.mts'), content);
        return { filePath, content };
      },
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
  },
});
