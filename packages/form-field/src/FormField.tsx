import {
  TypeJsonEditor,
  TypeJsonEditorFileAPI,
  TypeJsonEditorProps,
  TypeJsonEditorValidationAPI,
  TypeJsonFile,
} from '../../editor/src';
import { TypeJsonRunner } from '../../runner/src';
import type {
  TypeJsonEditorFormFieldActionAPI,
  TypeJsonEditorFormFieldProps,
  TypeJsonEditorFormFieldValue,
  ValidationDetails,
} from './types';
import { lzJsonCompressor } from './utils/lz-json-compressor';
import { css, tx } from './utils/twind';
import { AppstoreOutlined } from '@ant-design/icons';
import { useEventListener, useMap, useSet } from 'ahooks';
import { Dropdown, Modal } from 'antd';
import { merge } from 'lodash-es';
import type * as Monaco from 'monaco-editor';
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

const defaultEditorOptions: TypeJsonEditorProps['editorOptions'] = {
  theme: 'vs-dark',
  minimap: { enabled: false },
  fontSize: 14,
  suggestFontSize: 14,
  codeLensFontSize: 14,
  tabIndex: 2,
  cursorBlinking: 'smooth',
  scrollBeyondLastLine: false,
  hover: { enabled: true, delay: 300, sticky: true },
  colorDecorators: true,
  suggest: {
    filterGraceful: true,
    showWords: false,
    showStatusBar: true,
    preview: true,
    previewMode: 'subwordSmart',
  },
  inlineSuggest: { enabled: true, mode: 'subwordSmart' },
  suggestSelection: 'first',
  acceptSuggestionOnEnter: 'smart',
  definitionLinkOpensInPeek: true,
  peekWidgetDefaultFocus: 'editor',
  inlayHints: { fontSize: 12 },
  fontFamily: 'monospace',
  bracketPairColorization: {
    enabled: true,
    independentColorPoolPerBracketType: true,
  },
  stickyScroll: { enabled: true },
};

function TypeJsonEditorFormField(props: TypeJsonEditorFormFieldProps) {
  const { editorProps, value, onChange, onChangeMode = 'blur', initialActiveFile = 'index.ts' } = props;

  const rootDOMRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>();
  const editorFileRef = useRef<TypeJsonEditorFileAPI>(null);
  const editorValidationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const runnerRef = useRef<TypeJsonRunner>();

  const defaultActionRef = useRef<TypeJsonEditorFormFieldActionAPI>(null);
  const actionRef = props.actionRef || defaultActionRef;

  const [running, setRunning] = useState(false);
  const [loadingTextSet, loadingTextActions] = useSet<'Running...' | 'Runner loading...'>();

  type DisplayError = ValidationDetails & { type: `${string}:${string}` };
  const [displayErrorMap, displayErrorActions] = useMap<DisplayError['type'], Omit<DisplayError, 'type'>>();

  const mergedEditorOptions = useMemo(() => merge(defaultEditorOptions, editorProps.editorOptions), [editorProps]);

  const originPresetFiles = useMemo(
    () => (value?.preset ? lzJsonCompressor.decompress<TypeJsonFile[]>(value.preset) : []),
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

        setRunning(true);
        loadingTextActions.add('Running...');
        const startTime = Date.now();
        try {
          const files = editorFileRef.current!.getAll().map(v => v[0]);
          const result = (await runnerRef.current.run({ files })) as Result;
          const presetFiles = files.filter(v => originPresetFiles.some(p => p.path === v.path));
          const sourceFiles = files.filter(v => !originPresetFiles.some(p => p.path === v.path));
          displayErrorActions.remove('error:run-failure');
          return {
            source: lzJsonCompressor.compress<TypeJsonFile[]>(sourceFiles),
            preset: presetFiles.length ? lzJsonCompressor.compress<TypeJsonFile[]>(presetFiles) : undefined,
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
            return { type: 'error:run-failure', ...(displayErrorMap.get('error:run-failure')! as { error: Error }) };
          }
        }

        const { typeErrors, syntacticErrors } = await editorValidationRef.current!.getErrors();
        if (typeErrors.length > 0) {
          return {
            type: 'error:type-check-failure',
            errors: typeErrors.map(v => `${v.messageText} (${v.lineNumber}:${v.column})`),
          };
        }
        if (syntacticErrors.length > 0) {
          return {
            type: 'error:syntactic-check-failure',
            errors: syntacticErrors.map(v => `${v.messageText} (${v.lineNumber}:${v.column})`),
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
          if (rootDOMRef.current?.contains(relatedTargetDOM) || rootDOMRef.current?.contains(document.activeElement))
            return;
          if (relatedTargetDOM.querySelector('[data-float-menu-item]')) return;
        }
        if (onChangeMode === 'blur') triggerChange();
      }, 100);
    },
    { target: rootDOMRef },
  );

  useEffect(() => {
    if (!value) return;

    const sourceFiles = lzJsonCompressor.decompress<TypeJsonFile[]>(value.source);
    const presetFiles = value.preset ? lzJsonCompressor.decompress<TypeJsonFile[]>(value.preset) : [];

    const isInitialized = Boolean(runnerRef.current);
    if (isInitialized) {
      editorFileRef.current?.updateOrAddMultiple(sourceFiles);
      editorFileRef.current?.updateOrAddMultiple(presetFiles);
    } else {
      editorFileRef.current?.addMultiple(sourceFiles);
      editorFileRef.current?.addMultiple(presetFiles);
      editorFileRef.current?.setActive(initialActiveFile);

      const runner = new TypeJsonRunner({ files: sourceFiles });
      runnerRef.current = runner;
      loadingTextActions.add('Runner loading...');
      runner
        .init()
        .catch(error => {
          displayErrorActions.set('error:runner-init-failure', { error });
        })
        .finally(() => {
          loadingTextActions.remove('Runner loading...');
        });
    }
  }, [value]);

  const triggerChange = async (changedValue?: TypeJsonEditorFormFieldValue) => {
    if (!runnerRef.current) return;

    try {
      changedValue ||= await actionRef.current!.run();
      onChange?.(changedValue);
    } catch (error) {
      console.error('run error', error);
    }
  };

  const onActiveFileContentChange: NonNullable<TypeJsonEditorProps['onActiveFileContentChange']> = useCallback(
    (path, content) => {
      if (onChangeMode === 'change') triggerChange();
      editorProps.onActiveFileContentChange?.(path, content);
    },
    [onChangeMode],
  );

  const handleUpdatePreset = () => {
    const preset = prompt('Please Input Preset: ');
    if (preset && value) {
      onChange?.({ ...value, preset });
    }
  };

  const handleUpdateSource = () => {
    const source = prompt('Please Input Source: ');
    if (source && value) {
      onChange?.({ ...value, source });
    }
  };

  const handleViewResult = async () => {
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
  };

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
          className={tx`border(2 solid [#f56c6c]) rounded-[6px] p-3 pb-0 absolute bottom-0 w-full text-[#f56c6c] bg-[#2b1d1d]`}
        >
          {errors.map(error => (
            <div key={error} className={tx`pb-3`}>
              {error}
            </div>
          ))}
        </div>
      );
    },
    floatMenu() {
      const withLoader = (children: React.ReactNode) => {
        const loadingText = loadingTextSet.values().next().value;
        return (
          <div className={tx('group absolute right-20 bottom-20 z-10 p-2')}>
            <div className={tx('absolute size-full rounded-full left-0 top-0 overflow-hidden')}>
              <div
                className={tx(
                  'size-[200px] absolute left-1/2 top-1/2',
                  loadingText ? 'block' : 'hidden',
                  css`
                    background: radial-gradient(circle at 30% 30%, #ff0000, transparent 50%),
                      radial-gradient(circle at 70% 70%, #00ff00, transparent 50%),
                      radial-gradient(circle at 50% 50%, #0000ff, transparent 50%),
                      radial-gradient(circle at 80% 20%, #ff00ff, transparent 50%);
                    transform: translate(-50%, -50%);
                    animation: spinCenter 1.5s infinite linear;
                    @keyframes spinCenter {
                      0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                      }
                      100% {
                        transform: translate(-50%, -50%) rotate(360deg);
                      }
                    }
                  `,
                )}
              />
            </div>
            <div className={tx('relative flex items-center justify-center rounded-full bg-black')}>
              {loadingText ? <div className={tx('text-white/70 mx-8')}>{loadingText}</div> : null}
              {children}
            </div>
          </div>
        );
      };
      const menuButtonJsx = (
        <div
          className={tx(
            'flex items-center justify-center',
            'text-zinc-400 hover:(text-gray-600 shadow-gray/50) shadow rounded-full p-5 cursor-pointer',
            'backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent duration-700',
          )}
        >
          <Dropdown
            menu={{
              items: [
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
              ],
            }}
            trigger={['hover']}
          >
            <AppstoreOutlined className={tx`text-[20px]`} />
          </Dropdown>
        </div>
      );

      return withLoader(menuButtonJsx);
    },
  };

  return (
    <div ref={rootDOMRef} tabIndex={0} className={tx`relative`}>
      <TypeJsonEditor
        {...editorProps}
        editorOptions={mergedEditorOptions}
        fileRef={editorFileRef}
        validationRef={editorValidationRef}
        onActiveFileContentChange={onActiveFileContentChange}
        onCreated={editor => {
          monacoEditorRef.current = editor;
        }}
      />
      {displayErrorMap.size > 0 && renderer.alert()}
      {renderer.floatMenu()}
    </div>
  );
}

export default memo(TypeJsonEditorFormField);
