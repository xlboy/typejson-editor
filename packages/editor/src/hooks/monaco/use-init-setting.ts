import type * as Monaco from 'monaco-editor';
import { useEffect } from 'react';

export function useInitMonacoSetting(monaco: typeof Monaco) {
  useEffect(() => {
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      module: monaco.languages.typescript.ModuleKind.ESNext,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      isolatedModules: true,
      allowJs: true,
      strict: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      allowNonTsExtensions: true,
      esModuleInterop: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSuggestionDiagnostics: true,
    });
  }, []);
}
