import type { SidebarItem } from './types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SidebarStoreState {
  focusItem: SidebarItem | null;
  lastFocusItem: SidebarItem | null;
}

interface SidebarStoreActions {
  setFocusItem: (item: SidebarStoreState['focusItem']) => void;
}

export type SidebarStore = SidebarStoreState & SidebarStoreActions;

export const useSidebarStore = create<SidebarStore>()(
  immer(set => ({
    //#region  //*=========== state ===========
    focusItem: null,
    lastFocusItem: null,
    //#endregion  //*======== state ===========
    //#region  //*=========== actions ===========
    setFocusItem: item => {
      set({ focusItem: item });
      if (item) set({ lastFocusItem: item });
    },
    //#endregion  //*======== actions ===========
  })),
);
