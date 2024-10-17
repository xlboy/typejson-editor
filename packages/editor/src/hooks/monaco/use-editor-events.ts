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
        const filePath = resource.path.replace(/^\//, '');
        const file = fileManager.get(filePath);
        if (file) {
          if (file.isExternal) {
            const model = modelManager.get(file.path);
            if (model) monaco.editor.setModelLanguage(model, 'typescript');
          }
          modelManager.setActive(file.path);
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
