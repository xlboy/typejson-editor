/// <reference types="vite/client" />

declare module 'prettier/esm/standalone.mjs';
declare module 'prettier/esm/parser-typescript.mjs';

declare global {
  interface Window {
    monaco?: typeof monaco;
  }
}
