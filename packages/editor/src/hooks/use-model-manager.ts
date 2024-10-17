import { NormalizedPath, TypeJsonFile } from '../types';
import { useSingleton } from 'foxact/use-singleton';
import type * as Monaco from 'monaco-editor';

export interface ModelManagerAPI {
  clear(): void;
  setActive(path: NormalizedPath): void;
  add(path: NormalizedPath, file: TypeJsonFile): void;
  addMultiple(files: Array<Readonly<[path: NormalizedPath, file: TypeJsonFile]>>): void;
  /** eg: `node_modules/@types/react/index.d.ts` */
  addExtraLib(path: NormalizedPath, libModel: Monaco.editor.ITextModel): void;
  remove(path: NormalizedPath): void;
  getAll(): Record<NormalizedPath, Monaco.editor.ITextModel>;
  get(path: NormalizedPath): Monaco.editor.ITextModel | undefined;
  update(path: NormalizedPath, fileSource: TypeJsonFile): void;
  updateMultiple(files: Array<Readonly<[path: NormalizedPath, fileSource: TypeJsonFile]>>): void;
}

const helpers = {
  getLanguageIdFromExtension(extension: string): string {
    const extensionMap: Record<string, string> = {
      ts: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      json5: 'json',
    };
    return extensionMap[extension] || 'plaintext';
  },
};

export function useModelManager(deps: {
  monaco: typeof Monaco;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
}): ModelManagerAPI {
  const { monaco, editorRef } = deps;

  const models = useSingleton(() => new Map<NormalizedPath, { model: Monaco.editor.ITextModel; readOnly: boolean }>());

  return {
    clear() {
      models.current.forEach(({ model }) => model.dispose());
      models.current.clear();
    },
    setActive(path) {
      const found = models.current.get(path);
      if (found) {
        editorRef.current?.setModel(found.model);
        editorRef.current?.updateOptions({ readOnly: found.readOnly });
      }
    },
    get(path) {
      return models.current.get(path)?.model;
    },
    add(path, fileSource) {
      const fileExtension = path.split('.').pop()?.toLowerCase() || '';
      // 这里如果用 typescript 会令 TS Server 崩溃...所以采用 javascript（具体原因与这些 extraLib 有关）
      const languageId = fileSource.isExternal ? 'javascript' : helpers.getLanguageIdFromExtension(fileExtension);

      const uri = monaco.Uri.parse(new URL(path, 'file:///').href);
      const model = monaco.editor.createModel(fileSource.content, languageId, uri);
      models.current.set(path, { model, readOnly: fileSource.readOnly || false });
    },
    addExtraLib(path, libModel) {
      models.current.set(path, { model: libModel, readOnly: true });
    },
    addMultiple(files) {
      for (const [path, fileSource] of files) {
        this.add(path, fileSource);
      }
    },
    remove(path) {
      const found = models.current.get(path);
      if (found) {
        found.model.dispose();
        models.current.delete(path);
      }
    },
    getAll() {
      const result: Record<NormalizedPath, Monaco.editor.ITextModel> = {};
      models.current.forEach(({ model }, path) => {
        result[path] = model;
      });
      return result;
    },
    update(path, fileSource) {
      const found = models.current.get(path);
      if (found) {
        found.model.setValue(fileSource.content);
        found.readOnly = fileSource.readOnly || false;
      }
    },
    updateMultiple(files) {
      for (const [path, fileSource] of files) {
        const found = models.current.get(path);
        if (found) {
          found.model.setValue(fileSource.content);
          found.readOnly = fileSource.readOnly || false;
        } else {
          this.add(path, fileSource);
        }
      }
    },
  };
}
