import { DockviewApi, GridviewApi } from 'dockview';
import type * as Monaco from 'monaco-editor';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface GlobalStoreState {
  monaco: typeof Monaco | null;
  dockviewApi: {
    grid: GridviewApi | null;
    dock: DockviewApi | null;
  };
}

interface GlobalStoreActions {
  setMonaco: (monaco: typeof Monaco) => void;
  setDockviewApi: <T extends keyof GlobalStoreState['dockviewApi']>(
    key: T,
    value: GlobalStoreState['dockviewApi'][T],
  ) => void;
}

export type GlobalStore = GlobalStoreState & GlobalStoreActions;

export const useGlobalStore = create<GlobalStore>()(
  immer(set => ({
    //#region  //*=========== state ===========
    monaco: null,
    dockviewApi: {
      grid: null,
      dock: null,
    },
    //#endregion  //*======== state ===========
    //#region  //*=========== actions ===========
    setMonaco: monaco => set({ monaco }),
    setDockviewApi: (key, value) =>
      set(state => {
        state.dockviewApi[key] = value as never;
      }),
    //#endregion  //*======== actions ===========
  })),
);
