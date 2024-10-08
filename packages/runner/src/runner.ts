import { convertToJs, parseImports } from './helpers';
import type { TypeJsonFile, TypeJsonRunnerOptions } from './types';
import { Nodebox } from '@codesandbox/nodebox';
import { merge } from 'lodash-es';
import type { PackageJson } from 'type-fest';

export class TypeJsonRunner {
  private nodebox?: Nodebox;
  private options: Required<TypeJsonRunnerOptions>;

  private readonly config = {
    runtimeId: Math.random().toString(36).substring(2, 15),
  };

  constructor(_options?: Partial<TypeJsonRunnerOptions>) {
    this.options = merge(
      {
        nodeboxIframeId: 'type-json-editor-nodebox-iframe',
      } satisfies Partial<TypeJsonRunnerOptions>,
      _options,
    ) as any;
    this.init();
  }

  async setFiles(files: Array<TypeJsonFile>) {
    if (!this.nodebox) {
      throw new Error('Nodebox is not initialized. Please ensure init() has completed successfully.');
    }

    const parsedFileMap: Record<TypeJsonFile['path'], string> = {};
    const fileDependencies: Set<string> = new Set();

    for (const f of files) {
      const fileExtension = f.path.split('.').pop()?.toLowerCase() || '';

      const isJS = /^(js|jsx)$/.test(fileExtension);
      const isTS = /^(ts|tsx)$/.test(fileExtension);

      if (!isJS && !isTS) {
        parsedFileMap[f.path] = f.content;
        continue;
      }

      const jsCode = isTS ? convertToJs(f.content) : f.content;
      parsedFileMap[f.path.replace('.ts', '.js')] = jsCode;

      const imports = parseImports(jsCode);
      imports.filter(v => !v.startsWith('.')).forEach(v => fileDependencies.add(v));
    }

    await this.nodebox.fs.init({
      'package.json': JSON.stringify({
        dependencies: Array.from(fileDependencies).reduce((acc, cur) => ({ ...acc, [cur]: '*' }), {}),
      } satisfies PackageJson),
      ...parsedFileMap,
    });
  }

  async run(options?: { files?: Array<TypeJsonFile> }) {
    if (!this.nodebox) {
      throw new Error('Nodebox is not initialized. Please ensure init() has completed successfully.');
    }

    if (options?.files) {
      await this.setFiles(options.files);
    }

    return new Promise(async (resolve, reject) => {
      const shell = this.nodebox!.shell.create();
      const configOutputPrefix = 'TypeJson Runner Config:';
      shell.stdout.on('data', data => {
        if (data.startsWith(configOutputPrefix)) {
          const configStr = data.slice(configOutputPrefix.length);
          resolve(JSON.parse(configStr));
        } else {
          console.log('TypeJson Runner Output:', data);
        }
      });
      shell.stderr.on('data', data => {
        console.error('TypeJson Runner Error:', data);
        reject(data);
      });

      await shell.runCommand('node', [`${this.config.runtimeId}.js`]);
    });
  }

  destroy() {
    const iframe = document.getElementById(this.options.nodeboxIframeId);
    if (iframe) {
      document.body.removeChild(iframe);
    }
    this.nodebox = undefined;
  }

  private async init() {
    const ctx = this;

    initNodeboxIframe();
    await initNodeboxConnect();

    if (this.nodebox) {
      if (this.options?.files) {
        this.setFiles(this.options.files);
      }
      this.nodebox.fs.init({
        [`${this.config.runtimeId}.js`]: `
        import config from './'
        console.log("TypeJson Runner Config:" + JSON.stringify(config))
        `,
      });
    }

    async function initNodeboxConnect() {
      const iframeEl = document.getElementById(ctx.options.nodeboxIframeId) as HTMLIFrameElement | undefined;
      if (!iframeEl)
        throw new Error('Nodebox iframe element not found. Make sure initNodeboxIframe() was called first.');

      const nodebox = new Nodebox({ iframe: iframeEl });
      await nodebox.connect();
      ctx.nodebox = nodebox;
    }

    function initNodeboxIframe() {
      const iframe = document.createElement('iframe');
      iframe.id = ctx.options.nodeboxIframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
  }
}
