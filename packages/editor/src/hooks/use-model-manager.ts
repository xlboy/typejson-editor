import type { TypeJsonFile } from '../types';
import type * as Monaco from 'monaco-editor';

export interface ModelManagerAPI {
  clear(): void;
  getActive(): Monaco.editor.ITextModel | null;
  setActive(path: string): void;
  remove(path: string): void;
  getAll(): Monaco.editor.ITextModel[];
  get(path: string): Monaco.editor.ITextModel | null;
  updateOrAdd(file: TypeJsonFile): void;
  updateOrAddMultiple(files: TypeJsonFile[]): void;
}

declare module 'monaco-editor' {
  namespace editor {
    interface ITextModel {
      metadata?: {
        readOnly: boolean;
        isExternal?: boolean;
      };
    }
  }
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

  const getMonacoUri = (path: string) => monaco.Uri.parse(new URL(path, 'file:///').href);

  return {
    clear() {
      monaco.editor.getModels().forEach(model => model.dispose());
    },
    getActive() {
      return editorRef.current?.getModel() || null;
    },
    setActive(path) {
      const model = this.get(path);
      if (model) {
        editorRef.current?.setModel(model);
        editorRef.current?.updateOptions({ readOnly: model.metadata?.readOnly || false });
      }
    },
    get(path) {
      return monaco.editor.getModel(getMonacoUri(path));
    },
    remove(path) {
      this.get(path)?.dispose();
    },
    getAll() {
      return monaco.editor.getModels();
    },
    updateOrAdd(file) {
      const model = this.get(file.path);
      if (model) {
        if (model.getValue() !== file.content) {
          model.setValue(file.content);
        }
        model.metadata = {
          readOnly: file.readOnly || false,
          isExternal: file.isExternal || false,
        };
      } else {
        const fileExtension = file.path.split('.').pop()?.toLowerCase() || '';
        // 这里如果用 typescript 会令 TS Server 崩溃...所以采用 javascript（具体原因与这些 extraLib 有关）
        const languageId = file.isExternal ? 'javascript' : helpers.getLanguageIdFromExtension(fileExtension);
        const model = monaco.editor.createModel(file.content, languageId, getMonacoUri(file.path));
        model.metadata = {
          readOnly: file.readOnly || false,
          isExternal: file.isExternal || false,
        };
      }
    },
    updateOrAddMultiple(files) {
      for (const file of files) this.updateOrAdd(file);
    },
  };
}
