import { ModelManagerAPI } from '../use-model-manager';
import { useSingleton } from 'foxact/use-singleton';
import type * as Monaco from 'monaco-editor';
import { useEffect } from 'react';

export function useMonacoEditorEvents(deps: {
  monaco: typeof Monaco;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
  modelManager: ModelManagerAPI;
}) {
  const { monaco, editorRef, modelManager } = deps;

  const disposables = useSingleton(() => new Set<Monaco.IDisposable>());

  useEffect(() => {
    initEditorEvents();

    return () => {
      disposables.current.forEach(d => d.dispose());
    };
  }, []);

  function initEditorEvents() {
    const opener = monaco.editor.registerEditorOpener({
      openCodeEditor(source, uri, selectionOrPosition) {
        const model = modelManager.get(uri.path);
        if (model) {
          if (model.metadata?.isExternal) {
            monaco.editor.setModelLanguage(model, 'typescript');
          }
          editorRef.current?.setModel(model);
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
