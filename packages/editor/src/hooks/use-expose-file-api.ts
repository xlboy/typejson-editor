import { type TypeJsonEditorFileAPI } from '../types';
import { type FileManagerAPI } from './use-file-manager';
import { type ModelManagerAPI } from './use-model-manager';
import { useImperativeHandle } from 'react';

export function useExposeFileAPI(
  fileRef: React.RefObject<TypeJsonEditorFileAPI>,
  deps: {
    modelManager: ModelManagerAPI;
    fileManager: FileManagerAPI;
  },
) {
  const { modelManager, fileManager } = deps;

  useImperativeHandle(
    fileRef,
    () =>
      ({
        add(file, isActive = false) {
          fileManager.add(file, isActive);
          modelManager.add(file);
        },
        addMultiple(files) {
          fileManager.addMultiple(files);
          modelManager.addMultiple(files);
        },
        clear() {
          fileManager.clear();
          modelManager.clear();
        },
        get(path) {
          const file = fileManager.get(path);
          const model = modelManager.get(path);
          return file && model ? [file, model] : null;
        },
        getActive() {
          const file = fileManager.getActive();
          if (!file) return null;
          const model = modelManager.get(file.path);
          if (!model) return null;
          return [file, model];
        },
        getAll() {
          return fileManager
            .getAll()
            .map(file => [file, modelManager.get(file.path)])
            .filter(([, model]) => Boolean(model)) as any;
        },
        remove(path) {
          fileManager.remove(path);
          modelManager.remove(path);
        },
        setActive(path) {
          fileManager.setActive(path);
          modelManager.setActive(path);
        },
        update(file) {
          fileManager.update(file);
          modelManager.update(file);
        },
      }) satisfies TypeJsonEditorFileAPI,
  );
}
