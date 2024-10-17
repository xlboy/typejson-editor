import { NormalizedPath, type TypeJsonFile } from '../types';
import { useSingleton } from 'foxact/use-singleton';
import { useRef } from 'react';

export interface FileManagerAPI {
  add(path: NormalizedPath, fileSource: TypeJsonFile, isActive: boolean): void;
  addMultiple(files: Array<Readonly<[path: NormalizedPath, fileSource: TypeJsonFile]>>): void;
  clear(): void;
  get(path: NormalizedPath): TypeJsonFile | undefined;
  getActive(): TypeJsonFile | undefined;
  getAll(): Array<[NormalizedPath, TypeJsonFile]>;
  remove(path: NormalizedPath): void;
  setActive(path: NormalizedPath): void;
  update(path: NormalizedPath, fileSource: TypeJsonFile): void;
  updateMultiple(files: Array<Readonly<[path: NormalizedPath, fileSource: TypeJsonFile]>>): void;
  updateActiveContent(newContent: string): void;
}

const useRefState = <T>(initialValue: T) => {
  const ref = useRef<T>(initialValue);
  return [ref, (value: T) => (ref.current = value)] as const;
};

export function useFileManager(): FileManagerAPI {
  const fileMap = useSingleton(() => new Map<NormalizedPath, TypeJsonFile>());
  const [activeFilePath, setActiveFilePath] = useRefState<NormalizedPath>('');

  return {
    add(path, fileSource, isActive) {
      fileMap.current.set(path, fileSource);
      if (isActive) {
        setActiveFilePath(fileSource.path);
      }
    },
    addMultiple(files) {
      for (const [path, fileSource] of files) {
        fileMap.current.set(path, fileSource);
      }
    },
    clear() {
      fileMap.current.clear();
      setActiveFilePath('');
    },
    get(path) {
      return fileMap.current.get(path);
    },
    getActive() {
      return fileMap.current.get(activeFilePath.current);
    },
    getAll() {
      return Array.from(fileMap.current.entries());
    },
    remove(path) {
      fileMap.current.delete(path);
    },
    setActive(path) {
      setActiveFilePath(path);
    },
    update(path, fileSource) {
      fileMap.current.set(path, fileSource);
    },
    updateMultiple(files) {
      for (const [path, fileSource] of files) {
        if (fileMap.current.has(path)) {
          this.update(path, fileSource);
        } else {
          this.add(path, fileSource, false);
        }
      }
    },
    updateActiveContent(newContent) {
      const activeFile = this.getActive();
      if (!activeFile) return;
      activeFile.content = newContent;
    },
  };
}
