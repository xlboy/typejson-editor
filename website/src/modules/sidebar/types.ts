import { SIDEBAR_ITEMS } from './config';

export interface SidebarItem {
  id: string;
  tooltip: string;
  icon: React.ReactNode;
  component: React.FunctionComponent;
}

export type SidebarItemId = (typeof SIDEBAR_ITEMS)[number]['id'];
