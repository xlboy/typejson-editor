import { FileExplorer } from '../file-explorer';
import type { SidebarItem } from './types';
import { MaterialSymbolsFolderOpenRounded } from '@/components/icons';

export const SIDEBAR_ITEMS = [
  {
    id: 'file-explorer',
    tooltip: 'File Explorer',
    icon: <MaterialSymbolsFolderOpenRounded />,
    component: FileExplorer,
  },
] as const satisfies SidebarItem[];

export const SIDEBAR_MIN_WIDTH = 43;
export const SIDEBAR_DEFAULT_WIDTH = 300;
export const SIDEBAR_BOUNDARY_WIDTH = 100;
