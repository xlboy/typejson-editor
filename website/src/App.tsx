import { TypeJsonEditor } from '../../packages/editor/src';
import NavigationBar from './components/NavigationBar';
import { SidebarView } from './modules/sidebar';
import { useGlobalStore } from './stores/global';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import loader from '@monaco-editor/loader';
import { tx } from '@twind/core';
import { useMount } from 'ahooks';
import { DockviewReact, GridviewReact, IGridviewPanelProps, Orientation } from 'dockview';
import 'dockview/dist/styles/dockview.css';

const gridComponents = {
  SidebarView,
  EditorView() {
    const { setDockviewApi } = useGlobalStore();

    return (
      <DockviewReact
        watermarkComponent={() => (
          <div className={tx`size-full text-white flex justify-around items-center`}>
            hi~
          </div>
        )}
        components={{
          editor(props) {
            const { monaco } = useGlobalStore();
            const {} = props.params as {};

            return (
              <div className={tx`size-full text-white`}>
                <TypeJsonEditor monaco={monaco!} />
              </div>
            );
          },
        }}
        onReady={event => {
          setDockviewApi('dock', event.api);
        }}
      />
    );
  },
} satisfies Record<string, React.FunctionComponent<IGridviewPanelProps>>;

function App() {
  const { setDockviewApi, setMonaco, monaco } = useGlobalStore();

  useMount(() => {
    loader.config({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' },
    });
    loader.init().then(setMonaco);
  });

  return (
    <MantineProvider>
      <div className={tx`w-full h-dvh flex(& col)`}>
        <NavigationBar />
        <div className={tx`flex-1 bg-[#121c2c]`}>
          {monaco ? (
            <GridviewReact
              className="dockview-theme-abyss"
              onReady={event => {
                setDockviewApi('grid', event.api);

                event.api.addPanel({
                  id: 'editor-panel',
                  component: 'EditorView',
                });
                event.api.addPanel({
                  id: 'sidebar-panel',
                  component: 'SidebarView',
                  position: {
                    direction: 'left',
                    referencePanel: 'editor-panel',
                  },
                  size: 43,
                  minimumWidth: 43,
                  maximumWidth: 400,
                });
              }}
              components={gridComponents}
              orientation={Orientation.VERTICAL}
            />
          ) : (
            <div className={tx`size-full text-white flex justify-around items-center`}>
              loading...
            </div>
          )}
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
