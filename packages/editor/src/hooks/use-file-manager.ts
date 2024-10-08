import { type TypeJsonFile } from '../types';
import { useRef, useState } from 'react';

export interface FileManagerAPI {
  add(file: TypeJsonFile, isActive: boolean): void;
  addMultiple(files: TypeJsonFile[]): void;
  clear(): void;
  get(path: TypeJsonFile['path']): TypeJsonFile | undefined;
  getActive(): TypeJsonFile | undefined;
  getAll(): TypeJsonFile[];
  remove(path: TypeJsonFile['path']): void;
  setActive(path: TypeJsonFile['path']): void;
  update(newFile: TypeJsonFile): void;
  updateActiveContent(newContent: string): void;
}

const useRefState = <T>(initialValue: T) => {
  const ref = useRef<T>(initialValue);
  return [ref, (value: T) => (ref.current = value)] as const;
};

export function useFileManager(): FileManagerAPI {
  const [files, setFiles] = useRefState<TypeJsonFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useRefState<TypeJsonFile['path']>('');

  return {
    add(file, isActive) {
      setFiles([...files.current, file]);
      if (isActive) {
        setActiveFilePath(file.path);
      }
    },
    addMultiple(newFiles) {
      setFiles([...files.current, ...newFiles]);
    },
    clear() {
      setFiles([]);
      setActiveFilePath('');
    },
    get(path) {
      return files.current.find(file => file.path === path);
    },
    getActive() {
      return files.current.find(file => file.path === activeFilePath.current);
    },
    getAll() {
      return files.current;
    },
    remove(path) {
      const newFiles = files.current.filter(file => file.path !== path);
      setFiles(newFiles);
    },
    setActive(path) {
      setActiveFilePath(path);
    },
    update(newFile) {
      const newFiles = files.current.map(curFile => (curFile.path === newFile.path ? newFile : curFile));
      setFiles(newFiles);
    },
    updateActiveContent(newContent) {
      const activeFile = this.getActive();
      if (!activeFile) return;
      this.update({ ...activeFile, content: newContent });
    },
  };
}
