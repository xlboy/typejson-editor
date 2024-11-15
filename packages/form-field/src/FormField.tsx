import {
  TypeJsonEditor,
  TypeJsonEditorFileAPI,
  TypeJsonEditorProps,
  TypeJsonEditorValidationAPI,
  TypeJsonFile,
} from '../../editor/src';
import { TypeJsonRunner } from '../../runner/src';
import FloatMenu, { FloatMenuProps } from './components/FloatMenu';
import type {
  TypeJsonEditorFormFieldActionAPI,
  TypeJsonEditorFormFieldProps,
  TypeJsonEditorFormFieldValue,
  ValidationDetails,
} from './types';
import { lzJsonCompressor } from './utils/lz-json-compressor';
import { apply, css, tx } from './utils/twind';
import { AppstoreOutlined, CloseOutlined } from '@ant-design/icons';
import { useEventListener, useMap, useSet } from 'ahooks';
import { Dropdown, Modal } from 'antd';
import type * as Monaco from 'monaco-editor';
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  const lastActiveFileRef = useRef<string>('index.ts');

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [running, setRunning] = useState(false);
  const [loadingTextSet, loadingTextActions] = useSet<
    'Running...' | 'Runner initializing...'
  >();

  type DisplayError = ValidationDetails & { type: `${string}:${string}` };
  const [displayErrorMap, displayErrorActions] = useMap<
    DisplayError['type'],
    Omit<DisplayError, 'type'>
  >();

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
          displayErrorActions.set('warning:running', {});
          throw new Error('Running');
        }
        const { typeErrors, syntacticErrors } =
          await editorValidationRef.current!.getErrors();
        if (typeErrors.length > 0) {
          displayErrorActions.set('error:type-check-failure', {
            errors: typeErrors.map(v => `${v.messageText} (${v.lineNumber}:${v.column})`),
          });
          throw new Error('Type check failure');
        }

        displayErrorActions.remove('error:type-check-failure');

        if (syntacticErrors.length > 0) {
          displayErrorActions.set('error:syntactic-check-failure', {
            errors: syntacticErrors.map(
              v => `${v.messageText} (${v.lineNumber}:${v.column})`,
            ),
          });
          throw new Error('Syntactic check failure');
        }

        displayErrorActions.remove('error:syntactic-check-failure');

        setRunning(true);
        loadingTextActions.add('Running...');
        const startTime = Date.now();
        try {
          const files = editorFileRef
            .current!.getAll()
            .map(v => v[0])
            .filter(v => !v.isExternal);
          const result = (await runnerRef.current.run({ files })) as Result;
          const presetFiles = files.filter(v =>
            originPresetFiles.some(p => p.path === v.path),
          );
          const sourceFiles = files.filter(
            v => !originPresetFiles.some(p => p.path === v.path),
          );
          displayErrorActions.remove('error:run-failure');
          return {
            source: lzJsonCompressor.compress<TypeJsonFile[]>(sourceFiles),
            preset: presetFiles.length
              ? lzJsonCompressor.compress<TypeJsonFile[]>(presetFiles)
              : undefined,
            result,
          };
        } catch (err) {
          const error = err instanceof Error ? err : new Error(JSON.stringify(err));
          displayErrorActions.set('error:run-failure', { error });
          throw err;
        } finally {
          displayErrorActions.remove('warning:running');
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
        if (running) {
          displayErrorActions.set('warning:running', {});
          return { type: 'warning:running' };
        }

        try {
          await actionRef.current!.run();
        } catch (_) {
        } finally {
          if (displayErrorMap.has('error:run-failure')) {
            return {
              type: 'error:run-failure',
              ...(displayErrorMap.get('error:run-failure')! as { error: Error }),
            };
          }
        }

        const { typeErrors, syntacticErrors } =
          await editorValidationRef.current!.getErrors();
        if (typeErrors.length > 0) {
          return {
            type: 'error:type-check-failure',
            errors: typeErrors.map(v => `${v.messageText} (${v.lineNumber}:${v.column})`),
          };
        }
        if (syntacticErrors.length > 0) {
          return {
            type: 'error:syntactic-check-failure',
            errors: syntacticErrors.map(
              v => `${v.messageText} (${v.lineNumber}:${v.column})`,
            ),
          };
        }

        return { type: 'success' };
      },
    }),
    [running, originPresetFiles],
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
      if (lastActiveFileRef.current) {
        const activeFile = editorFileRef.current?.getActive()?.[0];
        if (activeFile && activeFile.path !== lastActiveFileRef.current) {
        }
      }
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
          displayErrorActions.set('error:runner-init-failure', { error });
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
      const errors = [...displayErrorMap.entries()]
        .map(([type, info]) => {
          switch (type) {
            case 'warning:running':
              return 'running, please wait...';
            case 'error:runner-init-failure':
            case 'error:run-failure':
              const error = (info as any).error as Error;
              return error.message;
            case 'error:syntactic-check-failure':
            case 'error:type-check-failure':
              const errors = (info as any).errors as string[];
              return errors;
          }
        })
        .flat(1);

      return (
        <div
          className={tx`border(2 solid [#f56c6c]) rounded-[6px] p-3 pb-0 absolute bottom-0 w-full text-[#f56c6c] bg-[#2b1d1d] max-h-[100px] overflow-y-auto`}
        >
          {errors.map(error => (
            <div key={error} className={tx`pb-3`}>
              {error}
            </div>
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
          {displayErrorMap.size > 0 && renderer.alert()}
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
              apply.bg`fixed inset-0 z-50 backdrop-blur-[4px] bg-black/30 flex items-center justify-center`,
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
                  apply.cursor`absolute right-[20px] top-[20px] cursor-pointer text([18px] white) transition-all hover:scale-110`,
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

  async function triggerChange(changedValue?: TypeJsonEditorFormFieldValue) {
    if (!runnerRef.current) return;

    try {
      changedValue ||= await actionRef.current!.run();
      onChange?.(changedValue);
    } catch (error) {
      console.error('run error', error);
    }
  }

  function onActiveFileContentChange(path: string, content: string) {
    if (onChangeMode === 'change') triggerChange();
    editorProps.onActiveFileContentChange?.(path, content);
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
      triggerChange(changedValue);
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
