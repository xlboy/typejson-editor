/// <reference types="vite/client" />

declare module 'prettier/esm/standalone.mjs';
declare module 'prettier/esm/parser-typescript.mjs';

declare global {
  interface Window {
    monaco?: typeof monaco;
  }
}

declare module 'virtual:icons' {
  const icons: Required<
    Omit<
      import('material-icon-theme').Manifest,
      | 'iconDefinitions'
      | 'light'
      | 'hidesExplorerArrows'
      | 'highContrast'
      | 'folderExpanded'
      | 'folderNamesExpanded'
    >
  >;
  export default icons;
}
