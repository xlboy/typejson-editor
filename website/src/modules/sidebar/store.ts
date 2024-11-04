import type { SidebarItem } from './types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SidebarStoreState {
  focusItem: SidebarItem | null;
}

interface SidebarStoreActions {
  setFocusItem: (item: SidebarStoreState['focusItem']) => void;
}

export type SidebarStore = SidebarStoreState & SidebarStoreActions;

export const useSidebarStore = create<SidebarStore>()(
  immer(set => ({
    //#region  //*=========== state ===========
    focusItem: null,
    //#endregion  //*======== state ===========
    //#region  //*=========== actions ===========
    setFocusItem: item => set({ focusItem: item }),
    //#endregion  //*======== actions ===========
  })),
);
