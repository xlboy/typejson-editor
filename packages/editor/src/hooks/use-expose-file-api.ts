import { type TypeJsonEditorFileAPI } from '../types';
import { normalizePath } from '../utils';
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
          const normalizedPath = normalizePath(file.path);
          fileManager.add(normalizedPath, file, isActive);
          modelManager.add(normalizedPath, file);
        },
        addMultiple(files) {
          const normalizeFiles = files.map(f => [normalizePath(f.path), f] as const);
          fileManager.addMultiple(normalizeFiles);
          modelManager.addMultiple(normalizeFiles);
        },
        clear() {
          fileManager.clear();
          modelManager.clear();
        },
        get(path) {
          const normalizedPath = normalizePath(path);
          const file = fileManager.get(normalizedPath);
          const model = modelManager.get(normalizedPath);
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
            .map(([path, file]) => [file, modelManager.get(path)])
            .filter(([, model]) => Boolean(model)) as any;
        },
        remove(path) {
          const normalizedPath = normalizePath(path);
          fileManager.remove(normalizedPath);
          modelManager.remove(normalizedPath);
        },
        setActive(path) {
          const normalizedPath = normalizePath(path);
          fileManager.setActive(normalizedPath);
          modelManager.setActive(normalizedPath);
        },
        update(file) {
          const normalizedPath = normalizePath(file.path);
          fileManager.update(normalizedPath, file);
          modelManager.update(normalizedPath, file);
        },
        updateOrAddMultiple(files) {
          const normalizeFiles = files.map(f => [normalizePath(f.path), f] as const);
          fileManager.updateMultiple(normalizeFiles);
          modelManager.updateMultiple(normalizeFiles);
        },
      }) satisfies TypeJsonEditorFileAPI,
  );
}
