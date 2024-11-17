import useValidationError from '../hooks/use-validation-error';
import type {
  TypeJsonEditorFormFieldActionAPI,
  TypeJsonEditorFormFieldProps,
  TypeJsonEditorFormFieldValue,
} from '../types';
import { lzJsonCompressor } from '../utils/lz-json-compressor';
import { apply, tx } from '../utils/twind';
import FloatMenu, { FloatMenuProps } from './FloatMenu';
import { CloseOutlined } from '@ant-design/icons';
import {
  TypeJsonEditor,
  TypeJsonEditorFileAPI,
  TypeJsonEditorValidationAPI,
  TypeJsonFile,
} from '@typejson-editor/editor';
import { TypeJsonRunner } from '@typejson-editor/runner';
import { useDebounceFn, useEventListener, useSet } from 'ahooks';
import { Modal } from 'antd';
import type * as Monaco from 'monaco-editor';
import { memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function TypeJsonEditorFormField(props: TypeJsonEditorFormFieldProps) {
  const {
    editorProps,
    value,
    onChange,
    onChangeMode = 'blur',
    initialActiveFile = 'index.ts',
  } = props;

  const rootDOMRef = useRef<HTMLDivElement>(null);

  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>();
  const editorFileRef = useRef<TypeJsonEditorFileAPI>(null);
  const editorValidationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const runnerRef = useRef<TypeJsonRunner>();

  const defaultActionRef = useRef<TypeJsonEditorFormFieldActionAPI>(null);
  const actionRef = props.actionRef || defaultActionRef;

  const lastActiveFileRef = useRef('index.ts');
  const lastRunResultSnapshotRef = useRef<typeof value>();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [running, setRunning] = useState(false);
  const [loadingTextSet, loadingTextActions] = useSet<
    'Running...' | 'Runner initializing...'
  >();

  const validationError = useValidationError();
  const debouncedTriggerChange = useDebounceFn(triggerChange, {
    wait: 500,
    leading: true,
  });
  const debouncedRefreshTypeOrSyntacticErrors = useDebounceFn(
    refreshTypeOrSyntacticErrors,
    { wait: 300, leading: true },
  );

  const originPresetFiles = useMemo(
    () =>
      value?.preset ? lzJsonCompressor.decompress<TypeJsonFile[]>(value.preset) : [],
    [value?.preset],
  );

  useImperativeHandle(
    actionRef,
    () => ({
      async run<Result = unknown>() {
        if (!runnerRef.current) throw new Error('Runner not initialized');
        if (running) {
          validationError.set('warning:running');
          throw new Error('Running');
        }

        await refreshTypeOrSyntacticErrors();
        if (
          validationError.has('error:syntactic-check-failure') ||
          validationError.has('error:type-check-failure')
        ) {
          throw new Error('Type or syntactic check failure');
        }

        const startTime = Date.now();
        try {
          setRunning(true);
          loadingTextActions.add('Running...');
          const files = editorFileRef
            .current!.getAll()
            .map(v => v[0])
            .filter(v => !v.isExternal);
          const runResult = (await runnerRef.current.run({ files })) as Result;
          const presetFiles = files.filter(v =>
            originPresetFiles.some(p => p.path === v.path),
          );
          const sourceFiles = files.filter(
            v => !originPresetFiles.some(p => p.path === v.path),
          );
          validationError.remove('error:run-failure');
          lastRunResultSnapshotRef.current = {
            source: lzJsonCompressor.compress<TypeJsonFile[]>(sourceFiles),
            preset: presetFiles.length
              ? lzJsonCompressor.compress<TypeJsonFile[]>(presetFiles)
              : undefined,
            result: runResult,
          };
          return lastRunResultSnapshotRef.current as TypeJsonEditorFormFieldValue<Result>;
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error(typeof err === 'object' ? JSON.stringify(err) : String(err));
          validationError.set('error:run-failure', { error });
          throw error;
        } finally {
          validationError.remove('warning:running');
          const diff = Date.now() - startTime;
          const reset = () => {
            setRunning(false);
            loadingTextActions.remove('Running...');
          };
          if (diff > 300) {
            reset();
          } else {
            setTimeout(reset, 300 - diff);
          }
        }
      },
      async validate() {
        return (await actionRef.current!.validateDetailed()).type === 'success';
      },
      async validateDetailed() {
        if (running) validationError.set('warning:running');

        const isSnapshotOutdated =
          !lastRunResultSnapshotRef.current ||
          JSON.stringify(value) !== JSON.stringify(lastRunResultSnapshotRef.current);
        if (isSnapshotOutdated) await triggerChange();

        return validationError.getFirst() || { type: 'success' };
      },
    }),
    [value, running, originPresetFiles],
  );

  useEventListener(
    'focusout',
    ({ relatedTarget }) => {
      setTimeout(() => {
        const relatedTargetDOM = relatedTarget as HTMLElement | null;
        if (relatedTargetDOM) {
          if (
            rootDOMRef.current?.contains(relatedTargetDOM) ||
            rootDOMRef.current?.contains(document.activeElement)
          )
            return;
          if (relatedTargetDOM.querySelector('[data-float-menu-item]')) return;
        }
        if (onChangeMode === 'blur') triggerChange();
      }, 100);
    },
    { target: rootDOMRef },
  );

  useEffect(() => {
    const sourceFiles: TypeJsonFile[] = value?.source
      ? lzJsonCompressor.decompress<TypeJsonFile[]>(value.source)
      : [{ path: '/index.ts', content: '' }];
    const presetFiles = value?.preset
      ? lzJsonCompressor.decompress<TypeJsonFile[]>(value.preset)
      : [];

    const isInitialized = Boolean(runnerRef.current);
    if (isInitialized) {
      editorFileRef.current?.updateOrAddMultiple(sourceFiles);
      editorFileRef.current?.updateOrAddMultiple(presetFiles);
    } else {
      editorFileRef.current?.updateOrAddMultiple(sourceFiles);
      editorFileRef.current?.updateOrAddMultiple(presetFiles);
      editorFileRef.current?.setActive(initialActiveFile);

      const runner = new TypeJsonRunner({ files: [...presetFiles, ...sourceFiles] });
      runnerRef.current = runner;
      loadingTextActions.add('Runner initializing...');
      runner
        .init()
        .catch(error => {
          validationError.set('error:runner-init-failure', { error });
        })
        .finally(() => {
          loadingTextActions.remove('Runner initializing...');
        });
    }
  }, [value]);

  const floatMenuItems: FloatMenuProps['menuItems'] = [
    {
      key: 'run',
      label: <a data-float-menu-item>{running ? 'Running...' : 'Run'}</a>,
      onClick: () => actionRef.current!.run(),
    },
    {
      key: 'update-preset',
      label: <a data-float-menu-item>Update Preset</a>,
      onClick: handleUpdatePreset,
    },
    {
      key: 'update-source',
      label: <a data-float-menu-item>Update Source</a>,
      onClick: handleUpdateSource,
    },
    {
      key: 'view-result',
      label: <a data-float-menu-item>View Result</a>,
      onClick: handleViewResult,
    },
    {
      key: 'full-screen',
      label: (
        <a data-float-menu-item>{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</a>
      ),
      onClick: handleFullScreen,
    },
  ];

  const renderer = {
    alert() {
      const errors = validationError
        .getAll()
        .map(error => {
          switch (error.type) {
            case 'warning:running':
              return 'running, please wait...';
            case 'error:runner-init-failure':
            case 'error:run-failure':
              return error.error.message;
            case 'error:syntactic-check-failure':
            case 'error:type-check-failure':
              return error.errors;
            default:
              throw new Error(`Unknown error type: ${error}`);
          }
        })
        .flat(1);

      return (
        <div
          className={tx(
            apply.alert(
              'border(2 solid [#f56c6c]) rounded-[6px] p-3 pb-0 absolute bottom-0',
              'w-full text-[#f56c6c] bg-[#2b1d1d] max-h-[100px] overflow-y-auto box-border',
            ),
          )}
        >
          {errors.map(error => (
            <div
              key={error}
              className={tx`pb-3 m-0 whitespace-pre-wrap break-all`}
              dangerouslySetInnerHTML={{ __html: error.replace(/\\n/g, '<br />') }}
            />
          ))}
        </div>
      );
    },
    editorContent() {
      const editorJsx = (
        <div
          ref={rootDOMRef}
          tabIndex={0}
          className={tx('relative', isFullScreen && '!w-full !h-full rounded-[5px]')}
        >
          <TypeJsonEditor
            {...editorProps}
            editorOptions={editorProps.editorOptions}
            fileRef={editorFileRef}
            validationRef={editorValidationRef}
            onActiveFileContentChange={onActiveFileContentChange}
            onActiveFileChange={path => (lastActiveFileRef.current = path)}
            onCreated={onEditorCreated}
          />
          {validationError.getAll().length > 0 && renderer.alert()}
          <FloatMenu
            loadingText={loadingTextSet.values().next().value}
            menuItems={floatMenuItems}
          />
        </div>
      );

      if (isFullScreen) {
        return (
          <div
            className={tx(
              apply.bg`fixed inset-0 z-[1000] backdrop-blur-[4px] bg-black/30 flex items-center justify-center`,
            )}
          >
            <div
              className={tx(
                apply.editor`relative size-[90%] bg-[#1e1e1e] rounded-[10px] shadow-2xl overflow-hidden`,
              )}
            >
              {editorJsx}
              <CloseOutlined
                className={tx(
                  apply.closeIcon`absolute z-50 right-[20px] top-[20px] cursor-pointer text([18px] white) transition-all hover:scale-110`,
                )}
                onClick={() => setIsFullScreen(false)}
              />
            </div>
          </div>
        );
      }

      return editorJsx;
    },
  };

  return isFullScreen
    ? createPortal(renderer.editorContent(), document.body)
    : renderer.editorContent();

  function onEditorCreated(editor: Monaco.editor.IStandaloneCodeEditor) {
    monacoEditorRef.current = editor;

    const [, lastActiveModel] =
      editorFileRef.current?.get(lastActiveFileRef.current) || [];
    if (lastActiveModel) editor.setModel(lastActiveModel);
  }

  async function triggerChange(
    changedValue?: TypeJsonEditorFormFieldValue,
  ): Promise<boolean> {
    if (!runnerRef.current) return false;

    try {
      changedValue ||= await actionRef.current!.run();
      onChange?.(changedValue);
      return true;
    } catch (error) {
      console.error('run error', error);
      return false;
    }
  }

  function onActiveFileContentChange(path: string, content: string) {
    if (onChangeMode === 'change') debouncedTriggerChange.run();
    else if (
      validationError.has('error:type-check-failure') ||
      validationError.has('error:syntactic-check-failure')
    ) {
      debouncedRefreshTypeOrSyntacticErrors.run();
    }

    editorProps.onActiveFileContentChange?.(path, content);
  }

  async function refreshTypeOrSyntacticErrors() {
    const { typeErrors, syntacticErrors } =
      await editorValidationRef.current!.getErrors();
    if (typeErrors.length > 0) {
      validationError.set('error:type-check-failure', {
        errors: typeErrors.map(v => `${v.messageText} (${v.lineNumber}:${v.column})`),
      });
    } else {
      validationError.remove('error:type-check-failure');
    }

    if (syntacticErrors.length > 0) {
      validationError.set('error:syntactic-check-failure', {
        errors: syntacticErrors.map(
          v => `${v.messageText} (${v.lineNumber}:${v.column})`,
        ),
      });
    } else {
      validationError.remove('error:syntactic-check-failure');
    }
  }

  function handleUpdatePreset() {
    const preset = prompt('Please Input Preset: ');
    if (preset) onChange?.({ ...value, preset });
  }

  function handleUpdateSource() {
    const source = prompt('Please Input Source: ');
    if (source) onChange?.({ ...value, source });
  }

  function handleFullScreen() {
    setIsFullScreen(!isFullScreen);
  }

  async function handleViewResult() {
    try {
      const changedValue = await actionRef.current!.run();
      if (!(await triggerChange(changedValue))) return;

      const viewId = `view-result-${Math.random().toString(36).slice(2, 11)}`;
      Modal.info({
        title: 'Result',
        icon: null,
        okButtonProps: { style: { display: 'none' } },
        closable: true,
        width: '70%',
        content: (
          <div className={tx`h-[300px]`}>
            <TypeJsonEditor
              monaco={editorProps.monaco}
              initialFiles={[
                {
                  path: `${viewId}.ts`,
                  content: `export default ${JSON.stringify(changedValue?.result, null, 2)}`,
                  readOnly: true,
                },
              ]}
              initialActiveFile={`${viewId}.ts`}
            />
          </div>
        ),
      });
    } catch (error) {
      console.error('view result error', error);
    }
  }
}

export default memo(TypeJsonEditorFormField);
