import { useFileExplorerStore } from '../store';
import { useEditorManager } from '@/stores/hooks/use-editor-manager';
import { apply } from '@twind/core';
import { useEffect } from 'react';
import { Menu, useContextMenu } from 'react-contexify';

const MENU_ID = 'file-explorer-context-menu';

export interface ContextMenuProps {}

function ContextMenu(props: ContextMenuProps): JSX.Element {
  const { contextMenuData, contextMenuTriggerEvent } = useFileExplorerStore();
  const { show: showMenu } = useContextMenu({ id: MENU_ID });
  const editorManager = useEditorManager();

  useEffect(() => {
    if (contextMenuTriggerEvent) {
      queueMicrotask(() => {
        showMenu({ event: contextMenuTriggerEvent });
      });
    }
  }, [contextMenuTriggerEvent]);

  return (
    <Menu
      className={apply.contextMenu(
        'min-w-[200px] fixed rounded-[4px] border(& solid [#4C5059])',
        'px-3 py-5 z-10 bg-[#212331] shadow-2xl',
      )}
      id={MENU_ID}
      animation={false}
    >
      {(() => {
        if (!contextMenuData) return null;

        const itemStyle = apply.item`text([#DADBDD] [12px]) px-7 py-1 rounded-[3px] cursor-pointer hover:(bg-[#1c65b8] text-white)`;
        const separatorStyle = apply.separator`h-1 bg-[#40434D] mx-7 my-3`;

        const isRoot = contextMenuData.node === null;
        const isFolder = contextMenuData.node?.type === 'directory';
        const isFile = contextMenuData.node?.type === 'file';

        const fileGroup = [
          <div className={itemStyle} onClick={handleOpen}>
            打开
          </div>,
        ];
        const folderGroup = [
          <div className={itemStyle}>新建文件...</div>,
          <div className={itemStyle}>新建文件夹...</div>,
        ];
        const commonGroup = [
          <div className={itemStyle}>重命名</div>,
          <div className={itemStyle}>删除</div>,
        ];
        const menuItemGroup = [
          (isRoot || isFolder) && folderGroup,
          isFile && fileGroup,
          (isFile || isFolder) && commonGroup,
        ].filter(Boolean) as React.ReactNode[];

        return menuItemGroup.map((item, index) => {
          const isLast = index === menuItemGroup.length - 1;
          return (
            <>
              {item!}
              {!isLast && <div className={separatorStyle} />}
            </>
          );
        });
      })()}
    </Menu>
  );

  function handleOpen() {
    if (contextMenuData!.node!.type === 'file') {
      editorManager.open(contextMenuData!.node!.origin);
    }
  }
}

export default ContextMenu;
