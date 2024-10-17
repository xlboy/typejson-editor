import type { Prettier } from './prettier';
import type { Options } from 'prettier';
import prettier from 'prettier/esm/standalone.mjs';

const defaults = {
  printWidth: 80,
  useTabs: false,
  semi: false,
  trailingComma: 'all',
  bracketSameLine: false,
};

const plugins = [
  {
    detect: (parser: string) =>
      /^[mc]?jsx?$/.test(parser) ? 'babel' : /^[mc]?tsx?$/.test(parser) ? 'babel-ts' : parser,
    load: () => import('prettier/esm/parser-typescript.mjs').then(m => m.default),
  },
];

async function getOptions(options?: Options) {
  let parser = options?.parser || /(?:\.([^.]+))?$/.exec(options?.filepath || '')?.[1];

  if (typeof parser === 'string') {
    for (const plugin of plugins) {
      const found = plugin.detect(parser);
      if (found) {
        return {
          ...defaults,
          ...options,
          parser: found,
          plugins: [await plugin.load()],
        };
      }
    }
  }

  return {
    ...defaults,
    ...options,
    plugins: Promise.all(plugins.map(plugin => plugin.load())),
  };
}

const api: Prettier = {
  async format(source, options) {
    return prettier.format(source, await getOptions(options));
  },

  async formatWithCursor(source, options) {
    return prettier.formatWithCursor(source, await getOptions(options));
  },
};

export default api;
