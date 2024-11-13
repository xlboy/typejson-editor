import {
  SIDEBAR_BOUNDARY_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_ITEMS,
  SIDEBAR_MIN_WIDTH,
} from './config';
import { useSidebarStore } from './store';
import { SidebarItem } from './types';
import { useDockviewStore } from '@/stores/dockview';
import { Tooltip } from '@mantine/core';
import { apply } from '@twind/core';
import { useMount, useSize } from 'ahooks';
import { useEffect, useRef } from 'react';

function SidebarView() {
  const { focusItem, lastFocusItem, setFocusItem } = useSidebarStore();
  const { dockviewApi } = useDockviewStore();

  const sidebarDom = useRef<HTMLDivElement>(null);
  const sidebarDomSize = useSize(sidebarDom);

  // useEffect(() => {
  //   if (sidebarDomSize?.width) {
  //     if (sidebarDomSize.width < SIDEBAR_BOUNDARY_WIDTH) {
  //       updateSidebarWidth(SIDEBAR_MIN_WIDTH);
  //       setFocusItem(null);
  //     } else {
  //       if (lastFocusItem) setFocusItem(lastFocusItem);
  //       else setFocusItem(SIDEBAR_ITEMS[0]);
  //     }
  //   }
  // }, [sidebarDomSize?.width]);
  // useMount(() => {
  //   if (focusItem) {
  //     updateSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
  //   }
  // });

  const updateSidebarWidth = (w: number) =>
    dockviewApi.grid?.getPanel('sidebar-panel')?.api.setSize({ width: w });

  const handleIconClick = (item: SidebarItem) => {
    const changedItem = focusItem?.id === item.id ? null : item;
    setFocusItem(changedItem);

    const isIdenticalItem = focusItem?.id === item.id;
    const currentSidebarIsClose = (sidebarDomSize?.width || 0) < SIDEBAR_BOUNDARY_WIDTH;

    if (isIdenticalItem) {
      if (/* isClose */ changedItem === null) updateSidebarWidth(SIDEBAR_MIN_WIDTH);
      else if (currentSidebarIsClose) updateSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
      return;
    }

    if (currentSidebarIsClose) updateSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
  };

  return (
    <div
      ref={sidebarDom}
      className={apply.sidebar`size-full text-white bg-[#171f2c] flex transition-all`}
    >
      <div className={apply.iconColumn`h-full border(r [#2b2b4a])`}>
        {SIDEBAR_ITEMS.map(v => {
          const isFocus = focusItem?.id === v.id;

          return (
            <Tooltip
              label={v.tooltip}
              key={v.id}
              position="right"
              openDelay={300}
              transitionProps={{ transition: 'pop-bottom-left', duration: 300 }}
            >
              <div
                className={apply.iconItem(
                  `p-10 cursor-pointer text([23px] [#505b71] hover:[#8196b5])`,
                  isFocus && [
                    'text-[#8196b5] bg-[#273040] relative',
                    "[&:before]:(content-[''] absolute inset-0 w-2 h-full bg-[#5e6b7d])",
                  ],
                )}
                onClick={() => handleIconClick(v)}
              >
                {v.icon}
              </div>
            </Tooltip>
          );
        })}
      </div>
      {focusItem ? <focusItem.component /> : null}
    </div>
  );
}

export default SidebarView;
