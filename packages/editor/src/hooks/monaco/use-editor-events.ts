import { normalizePath } from '../../utils';
import { FileManagerAPI } from '../use-file-manager';
import { ModelManagerAPI } from '../use-model-manager';
import { useSingleton } from 'foxact/use-singleton';
import type * as Monaco from 'monaco-editor';
import { useEffect } from 'react';

export function useMonacoEditorEvents(deps: {
  monaco: typeof Monaco;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
  fileManager: FileManagerAPI;
  modelManager: ModelManagerAPI;
}) {
  const { monaco, editorRef, fileManager, modelManager } = deps;

  const disposables = useSingleton(() => new Set<Monaco.IDisposable>());

  useEffect(() => {
    initEditorEvents();

    return () => {
      disposables.current.forEach(d => d.dispose());
    };
  }, []);

  function initEditorEvents() {
    const opener = monaco.editor.registerEditorOpener({
      openCodeEditor(source, resource, selectionOrPosition) {
        const normalizedPath = normalizePath(resource.path);
        const file = fileManager.get(normalizedPath);
        if (file) {
          if (file.isExternal) {
            const model = modelManager.get(normalizedPath);
            if (model) monaco.editor.setModelLanguage(model, 'typescript');
          }
          modelManager.setActive(normalizedPath);
          if (selectionOrPosition) {
            editorRef.current?.setSelection(selectionOrPosition as any);
          }
          return true;
        }

        return false;
      },
    });

    disposables.current.add(opener);
  }
}
