import type { FileTreeNode, OriginFile } from './types';
import { useGlobalStore } from '@/stores/global';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface FileExplorerStoreState {
  isInitialized: boolean;
  originFiles: OriginFile[];
}

interface FileExplorerStoreActions {
  initialize: () => void;
  refreshOriginFiles: () => void;
}

export type FileExplorerStore = FileExplorerStoreState & FileExplorerStoreActions;

export const useFileExplorerStore = create<FileExplorerStore>()(
  immer(set => ({
    //#region  //*=========== state ===========
    isInitialized: false,
    originFiles: [],
    //#endregion  //*======== state ===========
    //#region  //*=========== actions ===========
    initialize() {
      if (this.isInitialized) return;

      const { monaco } = useGlobalStore.getState();
      if (!monaco) throw new Error('monaco is not initialized');

      monaco.editor.onDidCreateModel(() => {
        this.refreshOriginFiles();
      });

      monaco.editor.onWillDisposeModel(() => {
        setTimeout(() => this.refreshOriginFiles(), 0);
      });

      set({ isInitialized: true });
    },
    refreshOriginFiles() {
      const { monaco } = useGlobalStore.getState();
      if (!monaco) return;

      const models = monaco.editor.getModels();
      const originFiles = models.map(model => ({
        name: model.uri.path.split('/').pop() || '',
        fullPath: model.uri.path,
        dirPath: model.uri.path.replace(/\/[^/]+$/, ''),
        readOnly: model.metadata?.readOnly || false,
      }));
      set({ originFiles });
    },
    //#endregion  //*======== actions ===========
  })),
);

export const useComputedFileExplorerState = () => {
  return {
    get fileTree(): FileTreeNode[] {
      return [];
    },
  };
};
