import { tx } from '@twind/core';
import {
  DockviewReact,
  GridviewApi,
  GridviewReact,
  GridviewReadyEvent,
  IDockviewPanelProps,
  IGridviewPanelProps,
  LayoutPriority,
  Orientation,
} from 'dockview';
import { useRef } from 'react';

const dockComponents = {
  editor(props) {
    return <div>俺是编辑器</div>;
  },
} satisfies Record<string, React.FunctionComponent<IDockviewPanelProps>>;

const gridComponents = {
  fileTree(props) {
    return <div className={tx`size-[100px] text-white`}>他们说你的心似乎痊愈了</div>;
  },
  dockview() {
    return (
      <DockviewReact
        watermarkComponent={() => <div>然后呢？</div>}
        components={dockComponents}
        onReady={event => {
          event.api.addPanel({
            id: 'wcc1',
            component: 'editor',
          });
          event.api.addPanel({
            id: 'wcc2',
            component: 'editor',
          });
        }}
      />
    );
  },
} satisfies Record<string, React.FunctionComponent<IGridviewPanelProps>>;

const Component = () => {
  const gridAPI = useRef<GridviewApi>();

  return (
    <div className={tx`flex-grow size-full`}>
      <button
        onClick={() => {
          const fileTreePanel = gridAPI.current?.getPanel('file-tree-panel');
          if (!fileTreePanel) return;
          fileTreePanel.api.setVisible(!fileTreePanel.api.isVisible);
        }}
      >
        toogle file-tree
      </button>
      <GridviewReact
        className="dockview-theme-abyss"
        onReady={event => {
          gridAPI.current = event.api;
          event.api.addPanel({
            id: 'editor-panel',
            component: 'dockview',
          });
          event.api.addPanel({
            id: 'file-tree-panel',
            component: 'fileTree',
            position: {
              direction: 'left',
              referencePanel: 'editor-panel',
            },
            size: 300,
            minimumWidth: 200,
          });
        }}
        components={gridComponents}
        orientation={Orientation.VERTICAL}
      />
    </div>
  );
};

export default Component;
