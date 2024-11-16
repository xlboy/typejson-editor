import json5Example from './example.json5?raw';
import { registerJson5Language } from './register';
import { usePrettierFormatter } from './usePrettierFormatter';
import { Editor as MonacoEditor, useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

function Json5Editor() {
  const monaco = useMonaco();

  const prettierFormatter = usePrettierFormatter();

  useEffect(() => {
    if (monaco) {
      registerJson5Language(monaco);
    }
  }, [monaco]);

  if (!monaco) return null;

  return (
    <div>
      Json5Editor:
      <MonacoEditor
        height={500}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          folding: true,
          lineNumbers: 'on',
          wordWrap: 'on',
        }}
        defaultLanguage="json5"
        theme="vs-dark"
        defaultValue={json5Example}
      />
    </div>
  );
}

export default Json5Editor;
