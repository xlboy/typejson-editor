import { useMonacoEditorEvents } from './hooks/monaco/use-editor-events';
import { useInitMonacoSetting } from './hooks/monaco/use-init-setting';
import { useTwoslashInlayMonacoPlugin } from './hooks/monaco/use-twoslash-inlay.plugin';
import { useTypeAcquisitionMonacoPlugin } from './hooks/monaco/use-type-acquisition.plugin';
import { useVimMonacoPlugin } from './hooks/monaco/use-vim.plugin';
import { useExposeFileAPI } from './hooks/use-expose-file-api';
import { useExposeValidationAPI } from './hooks/use-expose-validation-api';
import { useFileManager } from './hooks/use-file-manager';
import { useModelManager } from './hooks/use-model-manager';
import { TypeJsonEditorFileAPI, TypeJsonEditorProps, TypeJsonEditorValidationAPI } from './types';
import { normalizePath } from './utils';
import type * as Monaco from 'monaco-editor';
import { memo, useEffect, useRef } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

function TypeJsonEditor(props: TypeJsonEditorProps) {
  const { monaco } = props;
  const mountedDOMRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const modelManager = useModelManager({ monaco, editorRef });
  const fileManager = useFileManager();

  useInitMonacoSetting(monaco);

  useTwoslashInlayMonacoPlugin(monaco, { enabled: props.plugins?.twoslashInlay?.enabled ?? true });
  useVimMonacoPlugin(editorRef, { enabled: props.plugins?.vim?.enabled ?? false });
  const { load: loadTypeLib } = useTypeAcquisitionMonacoPlugin(
    { monaco, modelManager, fileManager },
    !!props.plugins?.typeAcquisition?.enabled
      ? { enabled: true, ts: props.plugins?.typeAcquisition?.ts }
      : { enabled: false },
  );

  useMonacoEditorEvents({ monaco, editorRef, fileManager, modelManager });

  const defaultFileRef = useRef<TypeJsonEditorFileAPI>(null);
  const fileRef = props.fileRef || defaultFileRef;
  useExposeFileAPI(fileRef, { modelManager, fileManager });
  const defaultValidationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const validationRef = props.validationRef || defaultValidationRef;
  useExposeValidationAPI(validationRef, { monaco, modelManager });

  const debouncedLoadTypeLib = useDebounceCallback((code: string) => loadTypeLib(code), 500);

  useEffect(() => {
    if (mountedDOMRef.current) {
      editorRef.current = monaco.editor.create(mountedDOMRef.current, {
        automaticLayout: true,
        ...props.editorOptions,
      });

      props.onCreated?.(editorRef.current);

      if (props.initialFiles && props.plugins?.typeAcquisition?.enabled) {
        props.initialFiles.forEach(f => loadTypeLib(f.content));
      }

      if (props.initialFiles) {
        fileRef.current?.addMultiple(props.initialFiles);
      }

      if (props.initialActiveFile) {
        fileRef.current?.setActive(props.initialActiveFile);
      }

      const disposables: Monaco.IDisposable[] = [
        editorRef.current.onDidChangeModel(e => {
          monaco.Uri;
          const newUrl = e.newModelUrl?.toString(true);
          let normalizedUrl = newUrl?.replace(/^file:\/+/, '');
          if (!normalizedUrl) return;
          normalizedUrl = normalizePath(normalizedUrl);

          fileManager.setActive(normalizedUrl);

          const activeFile = fileRef.current?.getActive();
          if (!activeFile) return;

          const [activeFileSource, activeFileModel] = activeFile;

          if (props.plugins?.typeAcquisition?.enabled) {
            debouncedLoadTypeLib(activeFileSource.content);
          }
          props.onActiveFileChange?.(activeFileSource.path, activeFileModel);
        }),
        editorRef.current.onDidChangeModelContent(e => {
          const newValue = editorRef.current?.getValue() || '';
          fileManager.updateActiveContent(newValue);

          const activeFile = fileRef.current?.getActive();
          if (!activeFile) return;

          const [{ path: activeFilePath }] = activeFile;
          if (props.plugins?.typeAcquisition?.enabled) {
            debouncedLoadTypeLib(newValue);
          }
          props.onActiveFileContentChange?.(activeFilePath, newValue);
        }),
      ];

      return () => {
        disposables.forEach(d => d.dispose());
      };
    }
  }, []);

  return (
    <div ref={mountedDOMRef} className={props.className} style={{ width: '100%', height: '100%', ...props.styles }} />
  );
}

export default memo(TypeJsonEditor);
