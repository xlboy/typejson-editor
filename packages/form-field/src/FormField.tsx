import {
  TypeJsonEditor,
  TypeJsonEditorFileAPI,
  TypeJsonEditorProps,
  TypeJsonEditorValidationAPI,
  TypeJsonFile,
} from '../../editor/src';
import { TypeJsonRunner } from '../../runner/src';
import Alert from './components/Alert';
import RunLoading from './components/RunLoading';
import type {
  TypeJsonEditorFormFieldActionAPI,
  TypeJsonEditorFormFieldProps,
  TypeJsonEditorFormFieldValue,
  ValidationDetails,
} from './types';
import { jsonCompressor } from './utils';
import { merge } from 'lodash-es';
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEventListener, useMap } from 'usehooks-ts';

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
  const editorFileRef = useRef<TypeJsonEditorFileAPI>(null);
  const editorValidationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const runnerRef = useRef<TypeJsonRunner>();

  const defaultActionRef = useRef<TypeJsonEditorFormFieldActionAPI>(null);
  const actionRef = props.actionRef || defaultActionRef;

  const [running, setRunning] = useState(false);

  type DisplayError = ValidationDetails & { type: `${string}:${string}` };
  const [displayErrorMap, displayErrorActions] = useMap<DisplayError['type'], Omit<DisplayError, 'type'>>();

  const mergedEditorOptions = useMemo(() => merge(defaultEditorOptions, editorProps.editorOptions), [editorProps]);

  useImperativeHandle(
    actionRef,
    () => ({
      async run<Result = unknown>() {
        if (!runnerRef.current) throw new Error('Runner not initialized');

        setRunning(true);
        try {
          const files = editorFileRef.current!.getAll().map(v => v[0]);
          const result = (await runnerRef.current.run({ files })) as Result;
          const source = jsonCompressor.compress<TypeJsonFile[]>(files);
          displayErrorActions.remove('error:run-failure');
          return { source, result };
        } catch (err) {
          const error = err instanceof Error ? err : new Error(JSON.stringify(err));
          displayErrorActions.set('error:run-failure', { error });
          throw err;
        } finally {
          displayErrorActions.remove('warning:running');
          setRunning(false);
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
    [running],
  );

  useEventListener(
    'focusout',
    () => {
      if (onChangeMode === 'blur') triggerChange();
    },
    rootDOMRef,
  );

  useEffect(() => {
    if (!value) return;

    const files = jsonCompressor.decompress<TypeJsonFile[]>(value.source);

    const isInitialized = Boolean(runnerRef.current);
    if (isInitialized) {
      editorFileRef.current?.updateOrAddMultiple(files);
    } else {
      runnerRef.current = new TypeJsonRunner({ files });
      editorFileRef.current?.addMultiple(files);
      editorFileRef.current?.setActive(initialActiveFile);
    }
  }, [value]);

  const triggerChange = async () => {
    if (!runnerRef.current) return;

    try {
      onChange?.(await actionRef.current!.run());
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

  const alertErrors = [...displayErrorMap.entries()]
    .map(([type, info]) => {
      switch (type) {
        case 'warning:running':
          return 'running';
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
    <div ref={rootDOMRef} style={{ position: 'relative' }}>
      {running && <RunLoading />}
      <TypeJsonEditor
        {...editorProps}
        editorOptions={mergedEditorOptions}
        fileRef={editorFileRef}
        validationRef={editorValidationRef}
        onActiveFileContentChange={onActiveFileContentChange}
      />
      {displayErrorMap.size > 0 && <Alert errors={alertErrors} />}
    </div>
  );
}

export default memo(TypeJsonEditorFormField);
