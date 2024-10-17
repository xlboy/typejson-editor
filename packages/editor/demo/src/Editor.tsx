import { TypeJsonRunner } from '../../../runner/src';
import { TypeJsonEditor, type TypeJsonEditorFileAPI, type TypeJsonEditorValidationAPI } from '../../src';
import loader from '@monaco-editor/loader';
import { tx } from '@twind/core';
import { useMount } from 'ahooks';
import type * as Monaco from 'monaco-editor';
import { useRef, useState } from 'react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
  },
});

function Editor() {
  const [monaco, setMonaco] = useState<typeof Monaco | null>(null);
  const fileRef = useRef<TypeJsonEditorFileAPI>(null);
  const validationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const runnerInstanceRef = useRef<TypeJsonRunner | null>(null);

  useMount(() => {
    loader.init().then(monaco => {
      setMonaco(monaco);
    });
    runnerInstanceRef.current = new TypeJsonRunner();
  });

  if (!monaco) return 'Monaco loading...';

  return (
    <div className={tx`w-dvw h-dvh flex`}>
      <div className={tx`px-10 py-5`}>
        <button
          className={tx`block w-full`}
          onClick={() => {
            fileRef.current?.setActive('test.ts');
          }}
        >
          switch test.ts
        </button>
        <button
          className={tx`block mt-10 w-full`}
          onClick={async () => {
            const files = fileRef
              .current!.getAll()
              .map(v => v[0])
              .filter(v => !v.isExternal);
            await runnerInstanceRef.current!.setFiles(files);
            const res = await runnerInstanceRef.current?.run();
            console.log(res);
          }}
        >
          run
        </button>
        <button
          className={tx`block mt-10 w-full`}
          onClick={async () => {
            if (validationRef.current) {
              const { typeErrors, syntacticErrors } = await validationRef.current.getErrors();

              console.log('hasErrors', typeErrors, syntacticErrors);
            }
          }}
        >
          get type errors
        </button>
      </div>
      <div className={tx`w-[500px] h-full flex-1`}>
        <TypeJsonEditor
          monaco={monaco}
          initialFiles={[
            {
              path: 'index.ts',
              content: `import _ from "lodash";\nimport { a } from './test';\nconst result = _.add(1, a);\nexport default result;`,
              readOnly: false,
            },
            {
              path: 'test.ts',
              content: 'export const a = 1;',
              readOnly: true,
            },
          ]}
          initialActiveFile="index.ts"
          fileRef={fileRef}
          validationRef={validationRef}
          editorOptions={{
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
          }}
          plugins={{
            typeAcquisition: { enabled: true },
            vim: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}

export default Editor;
