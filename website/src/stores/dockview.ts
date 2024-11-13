import { DockviewApi, GridviewApi, SerializedGridviewComponent } from 'dockview';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface DockviewStoreState {
  dockviewApi: {
    grid: GridviewApi | null;
    dock: DockviewApi | null;
  };
  gridLayoutJson: SerializedGridviewComponent | null;
}

interface DockviewStorePersistState {
  gridLayoutJson: SerializedGridviewComponent | null;
}

interface DockviewStoreActions {
  setDockviewApi: <T extends keyof DockviewStoreState['dockviewApi']>(
    key: T,
    value: DockviewStoreState['dockviewApi'][T],
  ) => void;
  initGridLayout: () => void;
}

export type DockviewStore = DockviewStoreState & DockviewStoreActions;

export const useDockviewStore = create<DockviewStore>()(
  persist(
    immer((set, get) => ({
      //#region  //*=========== state ===========
      dockviewApi: {
        grid: null,
        dock: null,
      },
      gridLayoutJson: null,
      //#endregion  //*======== state ===========
      //#region  //*=========== actions ===========
      setDockviewApi: (key, value) =>
        set(state => {
          state.dockviewApi[key] = value as never;
        }),
      initGridLayout: () => {
        const { gridLayoutJson, dockviewApi } = get();
        if (gridLayoutJson) dockviewApi.grid?.fromJSON(gridLayoutJson);

        dockviewApi.grid?.onDidLayoutChange(() => {
          set({ gridLayoutJson: get().dockviewApi.grid?.toJSON() });
        });
      },
      //#endregion  //*======== actions ===========
    })),
    {
      name: 'dockview',
      partialize(state) {
        return {
          gridLayoutJson: state.gridLayoutJson,
        } satisfies DockviewStorePersistState;
      },
    },
  ),
);
