import { SIDEBAR_ITEMS } from './config';
import type { SidebarItem } from './types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface SidebarStoreState {
  focusItem: SidebarItem | null;
  lastFocusItem: SidebarItem | null;
}

interface SidebarStorePersistState {
  focusItemId: string | null;
  lastFocusItemId: string | null;
}

interface SidebarStoreActions {
  setFocusItem: (item: SidebarStoreState['focusItem']) => void;
}

export type SidebarStore = SidebarStoreState & SidebarStoreActions;

export const useSidebarStore = create<SidebarStore>()(
  persist(
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
    })),
    {
      name: 'sidebar',
      partialize(state) {
        return {
          lastFocusItemId: state.lastFocusItem?.id || null,
          focusItemId: state.focusItem?.id || null,
        } satisfies SidebarStorePersistState;
      },
      // @ts-expect-error
      merge(persistedState: SidebarStorePersistState, currentState) {
        return {
          ...currentState,
          focusItem:
            SIDEBAR_ITEMS.find(item => item.id === persistedState.focusItemId) || null,
          lastFocusItem:
            SIDEBAR_ITEMS.find(item => item.id === persistedState.lastFocusItemId) ||
            null,
        } satisfies SidebarStore;
      },
    },
  ),
);
