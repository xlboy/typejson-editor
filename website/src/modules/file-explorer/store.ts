import { buildFileTree } from './helpers';
import type { ContextMenuData, DirectoryNode, FileTreeNode, OriginFile } from './types';
import { useGlobalStore } from '@/stores/global';
import { enableMapSet } from 'immer';
import { useMemo } from 'react';
import { TriggerEvent } from 'react-contexify';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

enableMapSet();

interface FileExplorerStoreState {
  isInitialized: boolean;
  expandedDirNodes: Set<DirectoryNode['id']>;
  originFiles: OriginFile[];
  contextMenuTriggerEvent: TriggerEvent | null;
  contextMenuData: ContextMenuData | null;
}

interface FileExplorerStoreActions {
  initialize: () => void;
  refreshOriginFiles: () => void;
  toggleExpandedDirNode: (id: DirectoryNode['id']) => void;
  showContextMenu: (event: TriggerEvent, data: ContextMenuData) => void;
}

export type FileExplorerStore = FileExplorerStoreState & FileExplorerStoreActions;

export const useFileExplorerStore = create<FileExplorerStore>()(
  immer(set => ({
    //#region  //*=========== state ===========
    isInitialized: false,
    expandedDirNodes: new Set(),
    originFiles: [],
    contextMenuTriggerEvent: null,
    contextMenuData: null,
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
        dirPath: model.uri.path.replace(/\/[^/]+$/, '') || '/',
        readOnly: model.metadata?.readOnly || false,
      }));
      set({ originFiles });
    },
    toggleExpandedDirNode(id) {
      set(state => {
        state.expandedDirNodes.has(id)
          ? state.expandedDirNodes.delete(id)
          : state.expandedDirNodes.add(id);
      });
    },
    showContextMenu(event, data) {
      set({ contextMenuTriggerEvent: event, contextMenuData: data });
    },
    //#endregion  //*======== actions ===========
  })),
);

export const useComputedFileExplorerState = () => {
  return {
    get fileTree(): FileTreeNode[] {
      const { originFiles } = useFileExplorerStore();

      return [
        {
          type: 'directory',
          name: 'utils',
          id: '/src/utils',
          dirPath: '/src/utils',
          children: [
            {
              type: 'file',
              id: '/src/utils/config.ts',
              origin: {
                name: 'config.ts',
                fullPath: '/src/utils/config.ts',
                dirPath: '/src/utils',
                readOnly: false,
              },
            },
            {
              type: 'file',
              id: '/src/utils/index.ts',
              origin: {
                name: 'index.ts',
                fullPath: '/src/utils/index.ts',
                dirPath: '/src/utils',
                readOnly: false,
              },
            },
          ],
        },
        {
          type: 'file',
          id: '/src/apple.ts',
          origin: {
            name: 'apple.ts',
            fullPath: '/src/apple.ts',
            dirPath: '/src',
            readOnly: false,
          },
        },
        {
          type: 'file',
          id: '/src/banana.ts',
          origin: {
            name: 'banana.ts',
            fullPath: '/src/banana.ts',
            dirPath: '/src',
            readOnly: false,
          },
        },
      ];

      return useMemo(() => buildFileTree(originFiles), [originFiles]);
    },
  };
};
