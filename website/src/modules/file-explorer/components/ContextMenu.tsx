import { useFileExplorerStore } from '../store';
import { tx } from '@twind/core';
import { useEffect, useLayoutEffect } from 'react';
import { Menu, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const MENU_ID = 'file-explorer-context-menu';

export interface ContextMenuProps {}

function ContextMenu(props: ContextMenuProps): JSX.Element {
  const { contextMenuData, contextMenuTriggerEvent } = useFileExplorerStore();
  const { show: showMenu } = useContextMenu({ id: MENU_ID });

  useEffect(() => {
    if (contextMenuTriggerEvent) {
      queueMicrotask(() => {
        showMenu({ event: contextMenuTriggerEvent });
      });
    }
  }, [contextMenuTriggerEvent]);

  return (
    <Menu className="monaco-menu" id={MENU_ID} animation={false}>
      {(() => {
        return (
          <>
            我草泥马
            <Separator />
          </>
        );
      })()}
    </Menu>
  );
}

export default ContextMenu;
