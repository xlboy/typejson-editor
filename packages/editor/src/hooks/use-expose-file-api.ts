import { type TypeJsonEditorFileAPI, type TypeJsonFile } from '../types';
import { type ModelManagerAPI } from './use-model-manager';
import * as Monaco from 'monaco-editor';
import { useImperativeHandle } from 'react';

export function useExposeFileAPI(
  fileRef: React.RefObject<TypeJsonEditorFileAPI>,
  deps: {
    modelManager: ModelManagerAPI;
  },
) {
  const { modelManager } = deps;

  const getTypeJsonFile = (model: Monaco.editor.ITextModel) =>
    ({
      path: model.uri.path,
      content: model.getValue(),
      readOnly: model.metadata?.readOnly || false,
      isExternal: model.metadata?.isExternal || false,
    }) satisfies TypeJsonFile;

  useImperativeHandle(
    fileRef,
    () =>
      ({
        updateOrAdd(file) {
          modelManager.updateOrAdd(file);
        },
        updateOrAddMultiple(files) {
          modelManager.updateOrAddMultiple(files);
        },
        clear() {
          modelManager.clear();
        },
        get(path) {
          const model = modelManager.get(path);
          if (!model) return null;
          return [getTypeJsonFile(model), model];
        },
        getActive() {
          const model = modelManager.getActive();
          if (!model) return null;
          return [getTypeJsonFile(model), model];
        },
        getAll() {
          return modelManager.getAll().map(model => [getTypeJsonFile(model), model]);
        },
        remove(path) {
          modelManager.remove(path);
        },
        setActive(path) {
          modelManager.setActive(path);
        },
      }) satisfies TypeJsonEditorFileAPI,
  );
}
