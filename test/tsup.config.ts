import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./bb.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
});
