import { TypeJsonFile } from '../types';
import { useSingleton } from 'foxact/use-singleton';
import type * as Monaco from 'monaco-editor';

export interface ModelManagerAPI {
  clear(): void;
  setActive(path: string): void;
  add(file: TypeJsonFile): void;
  add(path: string, model: Monaco.editor.ITextModel): void;
  addMultiple(files: TypeJsonFile[]): void;
  remove(path: string): void;
  getAll(): Record<TypeJsonFile['path'], Monaco.editor.ITextModel>;
  get(path: string): Monaco.editor.ITextModel | undefined;
  update(file: TypeJsonFile): void;
  $$getModelMap(): Map<TypeJsonFile['path'], { model: Monaco.editor.ITextModel; readOnly: boolean }>;
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

export function useModelManager(options: {
  monaco: typeof Monaco;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
}): ModelManagerAPI {
  const { monaco, editorRef } = options;

  const models = useSingleton(
    () => new Map<TypeJsonFile['path'], { model: Monaco.editor.ITextModel; readOnly: boolean }>(),
  );

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
    add(...args: [TypeJsonFile] | [string, Monaco.editor.ITextModel]) {
      if (args.length === 1) {
        const file = args[0];
        const fileExtension = file.path.split('.').pop()?.toLowerCase() || '';
        const languageId = helpers.getLanguageIdFromExtension(fileExtension);

        const uri = monaco.Uri.parse(new URL(file.path, 'file:///').href);
        const model = monaco.editor.createModel(file.content, languageId, uri);
        models.current.set(file.path, { model, readOnly: file.readOnly || false });
      } else {
        const [path, model] = args;
        models.current.set(path, { model, readOnly: false });
      }
    },
    addMultiple(files) {
      files.forEach(file => this.add(file));
    },
    remove(path) {
      const found = models.current.get(path);
      if (found) {
        found.model.dispose();
        models.current.delete(path);
      }
    },
    getAll() {
      const result: Record<TypeJsonFile['path'], Monaco.editor.ITextModel> = {};
      models.current.forEach(({ model }, path) => {
        result[path] = model;
      });
      return result;
    },
    update(file) {
      const found = models.current.get(file.path);
      if (found) {
        found.model.setValue(file.content);
        found.readOnly = file.readOnly || false;
      }
    },
    $$getModelMap() {
      return models.current;
    },
  };
}
