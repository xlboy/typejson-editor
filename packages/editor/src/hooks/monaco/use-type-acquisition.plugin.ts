import { normalizePath } from '../../utils';
import { FileManagerAPI } from '../use-file-manager';
import { ModelManagerAPI } from '../use-model-manager';
import { setupTypeAcquisition } from '@typescript/ata';
import type * as Monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import type typescript from 'typescript';

export type TypeAcquisitionMonacoPluginOptions =
  | { enabled: false }
  | {
      enabled: true;
      /**
       * 默认从 jsdelivr-cdn 中加载 TS 实例
       */
      ts?:
        | typeof typescript
        | {
            /**
             * // TODO: 可以取一下最新版本的 TS 版本号
             * @default https://cdn.jsdelivr.net/npm/typescript@5.6.2/lib/typescript.min.js
             */
            cdn?: string;
          };
    };

declare const ts: typeof typescript;

export function useTypeAcquisitionMonacoPlugin(
  deps: {
    monaco: typeof Monaco;
    modelManager: ModelManagerAPI;
    fileManager: FileManagerAPI;
  },
  options: TypeAcquisitionMonacoPluginOptions,
) {
  const { monaco, modelManager, fileManager } = deps;

  const pluginRef = useRef<ReturnType<typeof setupTypeAcquisition>>();
  const unloadedContentsRef = useRef<string[]>([]);

  useEffect(() => {
    if (options.enabled) {
      Promise.resolve()
        .then(() => {
          const defaultTSCDN = 'https://cdn.jsdelivr.net/npm/typescript@5.6.2/lib/typescript.min.js';
          if (!options.ts) return getTypescriptFromCDN(defaultTSCDN);
          if ('cdn' in options.ts && options.ts.cdn) return getTypescriptFromCDN(options.ts.cdn!);
          return options.ts as Promise<typeof typescript>;
        })
        .then(ts => {
          pluginRef.current = setupTypeAcquisition({
            projectName: 'typejson-editor',
            typescript: ts,
            logger: console,
            delegate: {
              receivedFile: (code, path) => {
                monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`);
                const uri = monaco.Uri.file(path);
                if (monaco.editor.getModel(uri) === null) {
                  const normalizedPath = normalizePath(path);
                  const fileSource = { path, content: code, readOnly: true, isExternal: true };
                  modelManager.add(normalizedPath, fileSource);
                  fileManager.add(normalizedPath, fileSource, false);
                }
              },
              progress: (downloaded: number, total: number) => {
                // console.debug(`[Typescript ATA] ${downloaded} / ${total}`);
              },
              started: () => {
                console.log('[Typescript ATA] start');
              },
              finished: files => {
                console.log('[Typescript ATA] done');
              },
            },
          });

          unloadedContentsRef.current.forEach(v => {
            pluginRef.current!(v);
          });
          unloadedContentsRef.current = [];
        });
    }
  }, []);

  return {
    load(code: string) {
      if (!pluginRef.current) {
        unloadedContentsRef.current.push(code);
        return;
      }

      pluginRef.current(code);
    },
  };

  function getTypescriptFromCDN(url: string): Promise<typeof typescript> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        if (ts) {
          resolve(ts);
        } else {
          reject(new Error('TypeScript instance not found on window.ts'));
        }
      };
      script.onerror = () => {
        reject(new Error(`Failed to load TypeScript from ${url}`));
      };
      document.head.appendChild(script);
    });
  }
}
