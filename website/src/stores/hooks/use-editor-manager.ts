import { useDockviewStore } from '../dockview';
import { useGlobalStore } from '../global';

export function useEditorManager() {
  const { dockviewApi } = useDockviewStore();
  const { monaco } = useGlobalStore();

  const open = (origin: MonacoOriginFile) => {
    const panel = dockviewApi.dock?.getPanel(origin.fullPath);
    if (panel) panel.focus();
    else create(origin);
  };

  const create = (origin: MonacoOriginFile) => {
    dockviewApi.dock?.addPanel({
      id: origin.fullPath,
      component: 'editor',
      title: origin.name,
    });
  };

  const remove = (origin: MonacoOriginFile) => {
    const panel = dockviewApi.dock?.getPanel(origin.fullPath);
    if (!panel) return;

    dockviewApi.dock?.removePanel(panel);
    monaco?.editor.getModel(monaco.Uri.file(origin.fullPath))?.dispose();
  };

  return { open, remove };
}
